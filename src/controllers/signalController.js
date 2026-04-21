'use strict';

const signalService = require('../services/signalService');
const { sendSuccess } = require('../utils/apiResponse');

const signalController = {
  async getAll(req, res, next) {
    try {
      const result = await signalService.getAll(req.query);
      return sendSuccess(res, 200, 'Signals fetched', result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const signal = await signalService.getById(parseInt(req.params.id, 10));
      return sendSuccess(res, 200, 'Signal fetched', signal);
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const signal = await signalService.create(req.body, req.user.id);
      return sendSuccess(res, 201, 'Signal created', signal);
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const signal = await signalService.update(parseInt(req.params.id, 10), req.body);
      return sendSuccess(res, 200, 'Signal updated', signal);
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await signalService.delete(parseInt(req.params.id, 10));
      return sendSuccess(res, 200, 'Signal deleted');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = signalController;
