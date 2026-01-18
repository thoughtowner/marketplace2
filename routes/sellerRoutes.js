import express from 'express';
import {
  withdrawMoney,
  createProduct,
  updateProduct,
  deleteProduct,
  increaseProductQuantity,
  getStoreProducts,
  createStore
} from '../controllers/sellerController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  withdrawMoneySchema,
  createProductSchema,
  updateProductSchema,
  increaseProductQuantitySchema,
  createStoreSchema
} from '../utils/validators.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('seller'));

/**
 * @swagger
 * /api/seller/withdraw:
 *   post:
 *     summary: Withdraw money from seller account
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Money withdrawn successfully
 */
router.post('/withdraw', validate(withdrawMoneySchema), withdrawMoney);

/**
 * @swagger
 * /api/seller/store:
 *   post:
 *     summary: Create a store
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       201:
 *         description: Store created successfully
 */
router.post('/store', validate(createStoreSchema), createStore);

/**
 * @swagger
 * /api/seller/products:
 *   get:
 *     summary: Get all products in seller's store
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 */
router.get('/products', getStoreProducts);

/**
 * @swagger
 * /api/seller/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               quantity:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       201:
 *         description: Product created successfully
 */
router.post('/products', validate(createProductSchema), createProduct);

/**
 * @swagger
 * /api/seller/products/:id:
 *   patch:
 *     summary: Update a product
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
router.patch('/products/:id', validate(updateProductSchema), updateProduct);

/**
 * @swagger
 * /api/seller/products/:id:
 *   delete:
 *     summary: Delete a product
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 */
router.delete('/products/:id', deleteProduct);

/**
 * @swagger
 * /api/seller/products/:id/quantity:
 *   post:
 *     summary: Increase product quantity in store
 *     tags: [Seller]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Product quantity increased
 */
router.post('/products/:id/quantity', validate(increaseProductQuantitySchema), increaseProductQuantity);

export default router;
