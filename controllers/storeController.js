import { AppDataSource } from '../config/data-source.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { StoreProduct } from '../models/StoreProduct.js';

/**
 * Получает все товары конкретного магазина
 * 
 * Этот контроллер обрабатывает запрос на получение всех товаров,
 * принадлежащих конкретному магазину. Возвращает список товаров
 * с информацией о доступном количестве каждого товара.
 * 
 * @param {Object} req - Express request объект
 * @param {Object} req.params - Параметры маршрута
 * @param {string} req.params.id - ID магазина
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next middleware функция
 * @returns {Promise<void>}
 */
export const getStoreProducts = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id);

    const storeRepository = AppDataSource.getRepository(Store);
    const store = await storeRepository.findOne({
      where: { id: storeId },
      relations: ['seller']
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const productRepository = AppDataSource.getRepository(Product);
    const products = await productRepository.find({
      where: { storeId },
      relations: ['store']
    });

    const storeProductRepository = AppDataSource.getRepository(StoreProduct);
    const storeProducts = await storeProductRepository.find({
      where: { storeId },
      relations: ['product']
    });

    const productsWithQuantity = products.map(product => {
      const storeProduct = storeProducts.find(
        sp => sp.productId === product.id
      );
      return {
        ...product,
        availableQuantity: storeProduct ? storeProduct.quantity : 0
      };
    });

    res.json({
      store: {
        id: store.id,
        title: store.title,
        seller: store.seller
      },
      products: productsWithQuantity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Получает список всех магазинов
 * 
 * Возвращает список всех магазинов в системе с информацией
 * о продавцах, владеющих этими магазинами.
 * 
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next middleware функция
 * @returns {Promise<void>}
 */
export const getAllStores = async (req, res, next) => {
  try {
    const storeRepository = AppDataSource.getRepository(Store);
    const stores = await storeRepository.find({
      relations: ['seller', 'seller.user']
    });

    res.json({ stores });
  } catch (error) {
    next(error);
  }
};
