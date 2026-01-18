import express from 'express';
import authRoutes from './authRoutes.js';
import consumerRoutes from './consumerRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import productRoutes from './productRoutes.js';
import storeRoutes from './storeRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/consumer', consumerRoutes);
router.use('/seller', sellerRoutes);
router.use('/products', productRoutes);
router.use('/stores', storeRoutes);
router.use('/admin', adminRoutes);

export default router;
