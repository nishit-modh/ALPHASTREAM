'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const config = require('./config/env');
const swaggerSpec = require('./config/swagger');
const apiRoutes = require('./routes/index');
const errorHandler = require('./middlewares/errorHandler');
const { sendSuccess, sendError } = require('./utils/apiResponse');

const app = express();

// ── Security ─────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Rate Limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
});

app.use(limiter);
app.use('/api/v1/auth', authLimiter);

// ── Body Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logging ───────────────────────────────────────────────
if (config.env !== 'test') {
  app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));
}

// ── API Docs ──────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ── Health Check ──────────────────────────────────────────
app.get('/health', (req, res) => {
  return sendSuccess(res, 200, 'AlphaStream API is running', {
    env: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────
app.use('/api/v1', apiRoutes);

// ── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  return sendError(res, 404, `Route ${req.method} ${req.path} not found`);
});

// ── Global Error Handler ──────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────
const server = app.listen(config.port, () => {
  console.log(`[AlphaStream] Server running on http://localhost:${config.port}`);
  console.log(`[AlphaStream] API Docs: http://localhost:${config.port}/api-docs`);
  console.log(`[AlphaStream] Environment: ${config.env}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[AlphaStream] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[AlphaStream] Server closed.');
    process.exit(0);
  });
});

module.exports = app;
