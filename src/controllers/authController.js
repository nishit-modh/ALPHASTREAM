'use strict';

const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

const authController = {
  async register(req, res, next) {
    try {
      const { user, token } = await authService.register(req.body);
      return sendSuccess(res, 201, 'Account created successfully', { user, token });
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const { user, token } = await authService.login(req.body);
      return sendSuccess(res, 200, 'Login successful', { user, token });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return sendSuccess(res, 200, 'Profile fetched', user);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
