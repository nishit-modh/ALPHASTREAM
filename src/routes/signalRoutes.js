'use strict';

const { Router } = require('express');
const signalController = require('../controllers/signalController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../validators/validate');
const {
  createSignalSchema,
  updateSignalSchema,
  paginationSchema,
} = require('../validators/schemas');

const router = Router();

// All signal routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/v1/signals:
 *   get:
 *     summary: Get all market signals (paginated)
 *     tags: [Signals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: ticker
 *         schema: { type: string }
 *         description: Filter by ticker substring (e.g. BTC)
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [BUY, SELL] }
 *     responses:
 *       200:
 *         description: List of signals with pagination meta
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  validate(paginationSchema, 'query'),
  signalController.getAll
);

/**
 * @swagger
 * /api/v1/signals/{id}:
 *   get:
 *     summary: Get a single signal by ID
 *     tags: [Signals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Signal data
 *       404:
 *         description: Signal not found
 */
router.get('/:id', signalController.getById);

/**
 * @swagger
 * /api/v1/signals:
 *   post:
 *     summary: Create a new signal (ADMIN only)
 *     tags: [Signals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ticker, type, entryPrice, confidenceLevel]
 *             properties:
 *               ticker:
 *                 type: string
 *                 example: BTC/USDT
 *               type:
 *                 type: string
 *                 enum: [BUY, SELL]
 *               entryPrice:
 *                 type: number
 *                 example: 65000.50
 *               confidenceLevel:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *                 example: 0.85
 *     responses:
 *       201:
 *         description: Signal created
 *       403:
 *         description: Admin role required
 *       422:
 *         description: Validation error
 */
router.post(
  '/',
  roleMiddleware('ADMIN'),
  validate(createSignalSchema),
  signalController.create
);

/**
 * @swagger
 * /api/v1/signals/{id}:
 *   patch:
 *     summary: Update a signal (ADMIN only)
 *     tags: [Signals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Signal'
 *     responses:
 *       200:
 *         description: Signal updated
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Signal not found
 */
router.patch(
  '/:id',
  roleMiddleware('ADMIN'),
  validate(updateSignalSchema),
  signalController.update
);

/**
 * @swagger
 * /api/v1/signals/{id}:
 *   delete:
 *     summary: Delete a signal (ADMIN only)
 *     tags: [Signals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Signal deleted
 *       403:
 *         description: Admin role required
 *       404:
 *         description: Signal not found
 */
router.delete(
  '/:id',
  roleMiddleware('ADMIN'),
  signalController.delete
);

module.exports = router;
