'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AlphaStream API',
      version: '1.0.0',
      description: 'Market Signal Management System for Web3 Trading',
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['ADMIN', 'USER'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Signal: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            ticker: { type: 'string', example: 'BTC/USDT' },
            type: { type: 'string', enum: ['BUY', 'SELL'] },
            entryPrice: { type: 'number', example: 65000.5 },
            confidenceLevel: { type: 'number', minimum: 0, maximum: 1, example: 0.85 },
            createdBy: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
