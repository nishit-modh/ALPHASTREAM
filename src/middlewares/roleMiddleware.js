'use strict';

const AppError = require('../utils/AppError');

/**
 * Returns a middleware that restricts access to users with the given roles.
 * Must be used AFTER authMiddleware.
 * @param {...string} roles
 */
const roleMiddleware = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (!roles.includes(req.user.role)) {
    return next(
      new AppError(
        `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
        403
      )
    );
  }

  next();
};

module.exports = roleMiddleware;
