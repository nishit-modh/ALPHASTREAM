'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const authRepository = require('./authRepository');
const AppError = require('../utils/AppError');

const authService = {
  async register({ email, password, role }) {
    const existing = await authRepository.findUserByEmail(email);
    if (existing) {
      throw new AppError('Email already in use', 409);
    }

    const hashed = await bcrypt.hash(password, config.bcrypt.saltRounds);
    const user = await authRepository.createUser({ email, password: hashed, role });

    const token = jwt.sign({ userId: user.id, role: user.role }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    return { user, token };
  },

  async login({ email, password }) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const { password: _, ...safeUser } = user;
    return { user: safeUser, token };
  },

  async getProfile(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  },
};

module.exports = authService;
