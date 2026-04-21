'use strict';

const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

/**
 * Returns an Express middleware that validates req.body against the given Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} source
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  try {
    const result = schema.parse(req[source]);
    req[source] = result; // Replace with coerced/defaulted values
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errors = err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(new AppError('Validation failed', 422, errors));
    }
    next(err);
  }
};

module.exports = validate;
