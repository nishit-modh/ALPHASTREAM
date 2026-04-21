# AlphaStream — Scalability Strategy

This document outlines concrete strategies for scaling AlphaStream from a single-node deployment to a horizontally distributed, high-throughput system capable of handling thousands of concurrent trading signal requests.

---

## 1. Horizontal Scaling via Nginx

### Problem
A single Node.js process is single-threaded. Under high concurrency, one instance becomes a bottleneck.

### Solution: Nginx as a Reverse Proxy + Load Balancer

Run multiple Node.js instances (one per CPU core) and place Nginx in front to distribute traffic.

**nginx.conf**
```nginx
upstream alphastream_cluster {
    least_conn;  # Route to instance with fewest active connections
    server 127.0.0.1:4000;
    server 127.0.0.1:4001;
    server 127.0.0.1:4002;
    server 127.0.0.1:4003;
    keepalive 64;
}

server {
    listen 80;
    server_name api.alphastream.io;

    location /api/ {
        proxy_pass         http://alphastream_cluster;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 10s;
        proxy_read_timeout    30s;
    }
}
```

**PM2 cluster mode** (process manager to spawn N workers):
```bash
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'alphastream',
    script: './src/app.js',
    instances: 'max',       # Spawns one process per CPU core
    exec_mode: 'cluster',
    watch: false,
    env_production: {
      NODE_ENV: 'production',
      PORT: 4000
    }
  }]
};
```

### Stateless Design Requirement
For clustering to work, the application must be fully stateless — no in-memory session storage. AlphaStream already satisfies this: JWT tokens are validated on each request against a shared MySQL database, with no server-side session state.

### Docker + Container Orchestration (Next Step)
For cloud deployments, containerize each instance and orchestrate with Kubernetes or Docker Swarm:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
RUN npx prisma generate
COPY . .
EXPOSE 4000
CMD ["node", "src/app.js"]
```

A Kubernetes HorizontalPodAutoscaler can then scale replica count automatically based on CPU/memory metrics.

---

## 2. Database Indexing Strategy

### Current Indexes (defined in schema.prisma)

```prisma
model Signal {
  @@index([ticker])      # Range queries and filter by ticker
  @@index([createdBy])   # Join from User -> Signals
  @@index([type])        # Filter by BUY/SELL
}

model User {
  @@index([email])       # Login lookup
}
```

### Why `ticker` Indexing is Critical

The most frequent query pattern in a signal management system is:

```sql
SELECT * FROM Signal WHERE ticker = 'BTC/USDT' ORDER BY createdAt DESC LIMIT 20;
```

Without an index on `ticker`, MySQL performs a full table scan — O(n) cost. With a B-Tree index, this becomes O(log n). At 1M rows, this reduces lookup from ~500ms to ~1ms.

### Composite Index for Common Filter Combinations

If users frequently filter by both `ticker` AND `type`, add a composite index:

```prisma
@@index([ticker, type])
```

MySQL uses the leftmost prefix rule — this index also serves queries filtering by `ticker` alone.

### Index for Time-Range Queries

For analytics dashboards showing signals in a date range:

```sql
-- Add to schema.prisma
@@index([createdAt])
-- Or a composite for "signals by ticker in last 24h":
@@index([ticker, createdAt])
```

### EXPLAIN Analysis Workflow

Always verify index usage in production:

```sql
EXPLAIN SELECT * FROM Signal WHERE ticker = 'BTC/USDT' AND type = 'BUY';
-- Confirm: key = 'Signal_ticker_type_idx', type = 'ref' (not 'ALL')
```

---

## 3. Redis Caching Layer

### Problem
The `GET /api/v1/signals` endpoint hits MySQL on every request. Under high read traffic (e.g., 500 req/s from dashboard polling), this saturates database connections.

### Solution: Redis Cache with Cache-Aside Pattern

Install the Redis client:
```bash
npm install ioredis
```

**src/config/redis.js**
```js
'use strict';
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('error', (err) => console.error('[Redis] Error:', err.message));
redis.on('connect', () => console.log('[Redis] Connected'));

module.exports = redis;
```

**Cache-aside pattern in signalService.js**
```js
const redis = require('../config/redis');
const CACHE_TTL = 60; // seconds

const signalService = {
  async getAll(query) {
    const cacheKey = `signals:${JSON.stringify(query)}`;

    // 1. Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Cache miss — query DB
    const result = await signalRepository.findAll(query);

    // 3. Populate cache (fire-and-forget)
    redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result)).catch(() => {});

    return result;
  },
};
```

**Cache invalidation on write operations**
```js
async create(data, userId) {
  const signal = await signalRepository.create({ ...data, createdBy: userId });
  // Invalidate all signal list caches
  const keys = await redis.keys('signals:*');
  if (keys.length > 0) await redis.del(...keys);
  return signal;
},
```

### Cache Key Design

| Operation               | Cache Key Pattern                        | TTL   |
|-------------------------|------------------------------------------|-------|
| List (paginated)        | `signals:{"page":1,"limit":20,...}`      | 60s   |
| Single signal           | `signal:42`                              | 120s  |
| User profile            | `user:profile:7`                         | 300s  |

### Expected Impact

At 500 req/s with a 60s TTL on the list endpoint:
- Without Redis: 500 MySQL queries/second
- With Redis (>95% hit rate after warmup): ~5 MySQL queries/second
- **Reduction: ~99% of read load offloaded from MySQL**

---

## 4. Additional Production Considerations

### Connection Pooling
Prisma uses a connection pool by default. Tune it for your instance size:
```
DATABASE_URL="mysql://user:pass@host:3306/alphastream?connection_limit=20&pool_timeout=10"
```

### Read Replicas
For read-heavy workloads, provision a MySQL read replica and route `SELECT` queries to it:
```js
// Prisma supports this natively via datasource replicas (Prisma Accelerate)
// or by initializing two PrismaClient instances pointing to primary/replica
```

### Observability
Add structured logging with `pino` and ship to Datadog/Loki. Add `prom-client` to expose `/metrics` for Prometheus scraping. Use APM tracing (OpenTelemetry) to identify slow query paths.

### CDN for Static Assets
Serve the React build via a CDN (Cloudflare, AWS CloudFront) to eliminate frontend traffic hitting the API servers entirely.

---

## Architecture Diagram (Scaled)

```
Internet
    │
    ▼
[Cloudflare CDN]  ←── React Static Build
    │
    ▼
[Nginx Load Balancer]
    ├── Node.js Instance :4000
    ├── Node.js Instance :4001
    ├── Node.js Instance :4002
    └── Node.js Instance :4003
              │
              ├──► [Redis Cluster]    ← Cache layer (reads)
              │
              └──► [MySQL Primary]   ← Writes + cache misses
                        │
                        └──► [MySQL Read Replica] ← Heavy read queries
```
