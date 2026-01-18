import express from 'express';
import { getStoreProducts, getAllStores } from '../controllers/storeController.js';

const router = express.Router();

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Get all stores
 *     tags: [Stores]
 *     responses:
 *       200:
 *         description: Stores retrieved successfully
 */
router.get('/', getAllStores);

/**
 * @swagger
 * /api/stores/:id/products:
 *   get:
 *     summary: Get all products in a specific store
 *     tags: [Stores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       404:
 *         description: Store not found
 */
router.get('/:id/products', getStoreProducts);

export default router;
