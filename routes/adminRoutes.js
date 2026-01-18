import express from 'express';
import { deleteUser, deleteProduct, deleteStore } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';

const router = express.Router();

// Все роуты требуют аутентификации и роли администратора
router.use(authenticateToken);
router.use(requireRole('admin'));

// Схемы валидации для админских операций
const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'User ID must be a number')
  })
});

const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Product ID must be a number')
  })
});

const deleteStoreSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'Store ID must be a number')
  })
});

/**
 * @swagger
 * /api/admin/users/:id:
 *   delete:
 *     summary: Delete a user (consumer, seller, or admin)
 *     tags: [Admin]
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
 *         description: User deleted successfully
 *       400:
 *         description: Cannot delete yourself
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', validate(deleteUserSchema), deleteUser);

/**
 * @swagger
 * /api/admin/products/:id:
 *   delete:
 *     summary: Delete a product from any store
 *     tags: [Admin]
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
 *       404:
 *         description: Product not found
 */
router.delete('/products/:id', validate(deleteProductSchema), deleteProduct);

/**
 * @swagger
 * /api/admin/stores/:id:
 *   delete:
 *     summary: Delete a store
 *     tags: [Admin]
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
 *         description: Store deleted successfully
 *       404:
 *         description: Store not found
 */
router.delete('/stores/:id', validate(deleteStoreSchema), deleteStore);

export default router;
