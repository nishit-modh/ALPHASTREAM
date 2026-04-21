'use strict';

const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['ADMIN', 'USER']).optional().default('USER'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const createSignalSchema = z.object({
  ticker: z
    .string()
    .min(1, 'Ticker is required')
    .regex(/^[A-Z0-9]+\/[A-Z0-9]+$/, 'Ticker must be in format BASE/QUOTE (e.g. BTC/USDT)'),
  type: z.enum(['BUY', 'SELL']),
  entryPrice: z
    .number({ invalid_type_error: 'entryPrice must be a number' })
    .positive('entryPrice must be positive'),
  confidenceLevel: z
    .number({ invalid_type_error: 'confidenceLevel must be a number' })
    .min(0, 'confidenceLevel must be >= 0')
    .max(1, 'confidenceLevel must be <= 1'),
});

const updateSignalSchema = createSignalSchema.partial();

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  ticker: z.string().optional(),
  type: z.enum(['BUY', 'SELL']).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createSignalSchema,
  updateSignalSchema,
  paginationSchema,
};
