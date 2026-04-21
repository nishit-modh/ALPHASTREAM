'use strict';

/**
 * Send a standardized success response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {*} data
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const payload = { success: true, message };
  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  return res.status(statusCode).json(payload);
};

/**
 * Send a standardized error response.
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {Array} errors
 */
const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = []) => {
  const payload = { success: false, message };
  if (errors.length > 0) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
};

module.exports = { sendSuccess, sendError };
