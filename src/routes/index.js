'use strict';

const { Router } = require('express');
const authRoutes = require('./authRoutes');
const signalRoutes = require('./signalRoutes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/signals', signalRoutes);

module.exports = router;
