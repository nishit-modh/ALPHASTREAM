'use strict';

class AppError extends Error {
  /**
   * @param {string} message
   * @param {number} statusCode
   * @param {Array} errors - Zod validation errors or other structured errors
   */
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
