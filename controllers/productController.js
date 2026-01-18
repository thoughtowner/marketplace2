import { AppDataSource } from '../config/data-source.js';
import { Product } from '../models/Product.js';
import { StoreProduct } from '../models/StoreProduct.js';

export const getAllProducts = async (req, res, next) => {
  try {
    const productRepository = AppDataSource.getRepository(Product);
    const products = await productRepository.find({
      relations: ['store', 'store.seller']
    });

    const storeProductRepository = AppDataSource.getRepository(StoreProduct);
    const storeProducts = await storeProductRepository.find({
      relations: ['product', 'store']
    });

    const productsWithQuantity = products.map(product => {
      const storeProduct = storeProducts.find(
        sp => sp.productId === product.id && sp.storeId === product.storeId
      );
      return {
        ...product,
        availableQuantity: storeProduct ? storeProduct.quantity : 0
      };
    });

    res.json({ products: productsWithQuantity });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);

    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOne({
      where: { id: productId },
      relations: ['store', 'store.seller']
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const storeProductRepository = AppDataSource.getRepository(StoreProduct);
    const storeProduct = await storeProductRepository.findOne({
      where: { productId, storeId: product.storeId }
    });

    res.json({
      ...product,
      availableQuantity: storeProduct ? storeProduct.quantity : 0
    });
  } catch (error) {
    next(error);
  }
};
