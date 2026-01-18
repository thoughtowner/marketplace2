import express from 'express';
import {
  depositMoney,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  getCart,
  purchaseCart
} from '../controllers/consumerController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  depositMoneySchema,
  addToCartSchema,
  removeFromCartSchema,
  updateCartQuantitySchema
} from '../utils/validators.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireRole('consumer'));

/**
 * @swagger
 * /api/consumer/deposit:
 *   post:
 *     summary: Deposit money to consumer account
 *     tags: [Consumer]
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
 *         description: Money deposited successfully
 */
router.post('/deposit', validate(depositMoneySchema), depositMoney);

/**
 * @swagger
 * /api/consumer/cart:
 *   get:
 *     summary: Get consumer cart
 *     tags: [Consumer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 */
router.get('/cart', getCart);

/**
 * @swagger
 * /api/consumer/cart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Consumer]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: number
 *               quantity:
 *                 type: number
 *                 minimum: 1
 *     responses:
 *       200:
 *         description: Product added to cart
 */
router.post('/cart', validate(addToCartSchema), addToCart);

/**
 * @swagger
 * /api/consumer/cart/:id:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Consumer]
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
 *         description: Product removed from cart
 */
router.delete('/cart/:id', validate(removeFromCartSchema), removeFromCart);

/**
 * @swagger
 * /api/consumer/cart/:id:
 *   patch:
 *     summary: Update product quantity in cart
 *     tags: [Consumer]
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
 *         description: Cart quantity updated
 */
router.patch('/cart/:id', validate(updateCartQuantitySchema), updateCartQuantity);

/**
 * @swagger
 * /api/consumer/cart/purchase:
 *   post:
 *     summary: Purchase all items in cart
 *     tags: [Consumer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase completed successfully
 */
router.post('/cart/purchase', purchaseCart);

export default router;
