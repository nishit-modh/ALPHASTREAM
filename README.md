# AlphaStream — Market Signal Management System

A production-ready REST API for managing Web3 trading signals, built with Node.js, Express, MySQL, and Prisma ORM. Features JWT authentication, Role-Based Access Control, strict input validation, Swagger documentation, and a minimal React dashboard.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Runtime    | Node.js (CommonJS)                      |
| Framework  | Express.js                              |
| Database   | MySQL 8+                                |
| ORM        | Prisma                                  |
| Auth       | JWT + Bcrypt                            |
| Validation | Zod                                     |
| API Docs   | Swagger-jsdoc + Swagger UI              |
| Frontend   | React + Vite + Tailwind CSS             |

---

## Project Structure

```
alphastream/
├── prisma/
│   ├── schema.prisma          # DB models: User, Signal
│   └── seed.js                # Seed admin + user + sample signals
├── src/
│   ├── app.js                 # Express entry point
│   ├── config/
│   │   ├── env.js             # Validated environment variables
│   │   ├── prisma.js          # Prisma client singleton
│   │   └── swagger.js         # Swagger spec configuration
│   ├── controllers/
│   │   ├── authController.js  # Register, login, profile
│   │   └── signalController.js
│   ├── services/
│   │   ├── authService.js     # Auth business logic
│   │   ├── authRepository.js  # Auth DB queries
│   │   ├── signalService.js   # Signal business logic
│   │   └── signalRepository.js
│   ├── middlewares/
│   │   ├── authMiddleware.js  # JWT verification
│   │   ├── roleMiddleware.js  # RBAC enforcement
│   │   └── errorHandler.js   # Global error handler
│   ├── routes/
│   │   ├── index.js           # API v1 router
│   │   ├── authRoutes.js
│   │   └── signalRoutes.js
│   ├── validators/
│   │   ├── schemas.js         # Zod schemas
│   │   └── validate.js        # Middleware factory
│   └── utils/
│       ├── apiResponse.js     # Standardized JSON responses
│       └── AppError.js        # Custom error class
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── pages/
    │   │   ├── AuthPage.jsx   # Login/Signup toggle
    │   │   └── Dashboard.jsx  # Signal table + CRUD
    │   ├── components/
    │   │   └── SignalModal.jsx
    │   ├── services/
    │   │   └── api.js         # Fetch wrapper + auth/signal APIs
    │   └── utils/
    │       └── AuthContext.jsx
    └── ...config files
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MySQL 8+ running locally or via Docker
- npm

### 1. Clone and install

```bash
git clone <repo>
cd alphastream

# Backend
npm install

# Frontend
cd frontend && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
```

### 3. Database setup

```bash
# Run migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed with demo data
npm run db:seed
```

### 4. Run the backend

```bash
npm run dev        # development (nodemon)
npm start          # production
```

### 5. Run the frontend

```bash
cd frontend
npm run dev
```

---

## API Reference

### Base URL
```
http://localhost:4000/api/v1
```

### Swagger UI
```
http://localhost:4000/api-docs
```

### Auth Endpoints

| Method | Path                  | Auth     | Description           |
|--------|-----------------------|----------|-----------------------|
| POST   | `/auth/register`      | Public   | Create account        |
| POST   | `/auth/login`         | Public   | Login, receive JWT    |
| GET    | `/auth/profile`       | JWT      | Get current user      |

### Signal Endpoints

| Method | Path              | Auth       | Role    | Description         |
|--------|-------------------|------------|---------|---------------------|
| GET    | `/signals`        | JWT        | Any     | List (paginated)    |
| GET    | `/signals/:id`    | JWT        | Any     | Get by ID           |
| POST   | `/signals`        | JWT        | ADMIN   | Create signal       |
| PATCH  | `/signals/:id`    | JWT        | ADMIN   | Update signal       |
| DELETE | `/signals/:id`    | JWT        | ADMIN   | Delete signal       |

### Query Parameters (GET /signals)

| Param  | Type    | Description                    |
|--------|---------|--------------------------------|
| page   | integer | Page number (default: 1)       |
| limit  | integer | Per page, max 100 (default: 20)|
| ticker | string  | Filter by ticker substring     |
| type   | string  | Filter by BUY or SELL          |

### Response Format

All responses follow this envelope:

```json
{
  "success": true,
  "message": "Signals fetched",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "ticker", "message": "Ticker must be in format BASE/QUOTE" }
  ]
}
```

---

## RBAC

| Action          | USER | ADMIN |
|-----------------|------|-------|
| View signals    | ✅   | ✅    |
| Create signal   | ❌   | ✅    |
| Update signal   | ❌   | ✅    |
| Delete signal   | ❌   | ✅    |

---

## Seed Credentials

| Role  | Email                     | Password     |
|-------|---------------------------|--------------|
| ADMIN | admin@alphastream.io      | Admin@1234   |
| USER  | user@alphastream.io       | User@1234    |

---

## Security Features

- **Helmet** — HTTP security headers
- **CORS** — Configurable origin whitelist
- **Rate Limiting** — 200 req/15min globally; 20 req/15min on auth routes
- **Bcrypt** — Passwords hashed with configurable salt rounds (default: 12)
- **JWT** — Stateless auth with expiry enforcement
- **Zod** — Runtime input validation on all endpoints
- **Body size limit** — 10kb max on JSON payloads
