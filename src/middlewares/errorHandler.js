'use strict';

const { Prisma } = require('@prisma/client');
const { sendError } = require('../utils/apiResponse');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Handle Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        const field = err.meta?.target?.[0] || 'field';
        statusCode = 409;
        message = `A record with this ${field} already exists`;
        break;
      }
      case 'P2025':
        statusCode = 404;
        message = 'Record not found';
        break;
      case 'P2003':
        statusCode = 400;
        message = 'Foreign key constraint failed';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided to the database';
  }

  // Do not expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
    errors = [];
  }

  // Log non-operational or 500 errors
  if (!err.isOperational || statusCode === 500) {
    console.error('[ERROR]', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  }

  return sendError(res, statusCode, message, errors);
};

module.exports = errorHandler;
