'use strict';

const signalRepository = require('./signalRepository');
const AppError = require('../utils/AppError');

const signalService = {
  async getAll(query) {
    return signalRepository.findAll(query);
  },

  async getById(id) {
    const signal = await signalRepository.findById(id);
    if (!signal) {
      throw new AppError('Signal not found', 404);
    }
    return signal;
  },

  async create(data, userId) {
    return signalRepository.create({
      ticker: data.ticker,
      type: data.type,
      entryPrice: data.entryPrice,
      confidenceLevel: data.confidenceLevel,
      createdBy: userId,
    });
  },

  async update(id, data) {
    await signalService.getById(id); // Ensures 404 if not found
    return signalRepository.update(id, data);
  },

  async delete(id) {
    await signalService.getById(id);
    return signalRepository.delete(id);
  },
};

module.exports = signalService;
