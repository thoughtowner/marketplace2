import { AppDataSource } from '../config/data-source.js';
import { Seller } from '../models/Seller.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { StoreProduct } from '../models/StoreProduct.js';
import { Cart } from '../models/Cart.js';
import { ConsumerProduct } from '../models/ConsumerProduct.js';

/**
 * Снимает деньги со счёта продавца
 * 
 * Уменьшает баланс продавца на указанную сумму.
 * Продавец может только снимать деньги со счёта (уменьшать баланс),
 * увеличивать баланс напрямую нельзя - деньги начисляются только
 * при продаже товаров покупателями.
 * 
 * @param {Object} req - Express request объект
 * @param {Object} req.body - Тело запроса
 * @param {number} req.body.amount - Сумма для снятия (должна быть положительной)
 * @param {Object} req.user - Аутентифицированный пользователь
 * @param {Object} req.user.seller - Объект продавца
 * @param {number} req.user.seller.id - ID продавца
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next middleware функция
 * @returns {Promise<void>}
 * 
 * @throws {404} Если продавец не найден
 * @throws {400} Если недостаточно средств
 */
export const withdrawMoney = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const sellerId = req.user.seller.id;

    const sellerRepository = AppDataSource.getRepository(Seller);
    const seller = await sellerRepository.findOne({ where: { id: sellerId } });

    if (!seller) {
      return res.status(404).json({ error: 'Seller not found' });
    }

    if (parseFloat(seller.money) < parseFloat(amount)) {
      return res.status(400).json({
        error: 'Insufficient funds',
        available: seller.money
      });
    }

    seller.money = parseFloat(seller.money) - parseFloat(amount);
    await sellerRepository.save(seller);

    res.json({
      message: 'Money withdrawn successfully',
      balance: seller.money
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Создаёт новый товар в магазине продавца
 * 
 * Добавляет новый товар в магазин продавца. Процесс включает:
 * 1. Проверку существования магазина у продавца
 * 2. Создание записи товара в таблице products
 * 3. Опциональное создание записи в store_to_product с указанным количеством
 * 
 * Если количество не указано, товар создаётся без записи в store_to_product,
 * что означает, что товар есть в системе, но его количество равно 0.
 * 
 * @param {Object} req - Express request объект
 * @param {Object} req.body - Тело запроса
 * @param {string} req.body.title - Название товара
 * @param {number} req.body.price - Цена товара (должна быть положительной)
 * @param {number} [req.body.quantity] - Начальное количество товара (опционально)
 * @param {Object} req.user - Аутентифицированный пользователь
 * @param {Object} req.user.seller - Объект продавца
 * @param {number} req.user.seller.id - ID продавца
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next middleware функция
 * @returns {Promise<void>}
 * 
 * @throws {404} Если магазин не найден
 */
export const createProduct = async (req, res, next) => {
  try {
    const { title, price, quantity } = req.body;
    const sellerId = req.user.seller.id;

    const storeRepository = AppDataSource.getRepository(Store);
    const store = await storeRepository.findOne({
      where: { sellerId }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found. Please create a store first.' });
    }

    const productRepository = AppDataSource.getRepository(Product);
    const product = productRepository.create({
      title,
      price,
      storeId: store.id
    });
    await productRepository.save(product);

    if (quantity && quantity > 0) {
      const storeProductRepository = AppDataSource.getRepository(StoreProduct);
      const storeProduct = storeProductRepository.create({
        storeId: store.id,
        productId: product.id,
        quantity
      });
      await storeProductRepository.save(storeProduct);
    }

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const { title, price } = req.body;
    const sellerId = req.user.seller.id;

    const storeRepository = AppDataSource.getRepository(Store);
    const store = await storeRepository.findOne({
      where: { sellerId }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOne({
      where: { id: productId, storeId: store.id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (title) product.title = title;
    if (price) product.price = price;

    await productRepository.save(product);

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const sellerId = req.user.seller.id;

    const storeRepository = AppDataSource.getRepository(Store);
    const store = await storeRepository.findOne({
      where: { sellerId }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOne({
      where: { id: productId, storeId: store.id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Удаляем зависимые записи чтобы избежать нарушений FK:
    const storeProductRepository = AppDataSource.getRepository(StoreProduct);
    await storeProductRepository.delete({ productId });

    const consumerProductRepository = AppDataSource.getRepository(ConsumerProduct);
    await consumerProductRepository.delete({ productId });

    const cartRepository = AppDataSource.getRepository(Cart);
    await cartRepository.delete({ productId });

    // Удаляем сам товар
    await productRepository.delete({ id: productId });

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const increaseProductQuantity = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;
    const sellerId = req.user.seller.id;

    const storeRepository = AppDataSource.getRepository(Store);
    const store = await storeRepository.findOne({
      where: { sellerId }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOne({
      where: { id: productId, storeId: store.id }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const storeProductRepository = AppDataSource.getRepository(StoreProduct);
    let storeProduct = await storeProductRepository.findOne({
      where: { storeId: store.id, productId }
    });

    if (!storeProduct) {
      storeProduct = storeProductRepository.create({
        storeId: store.id,
        productId,
        quantity: 0
      });
    }

    storeProduct.quantity += quantity;
    await storeProductRepository.save(storeProduct);

    res.json({
      message: 'Product quantity increased',
      storeProduct
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreProducts = async (req, res, next) => {
  try {
    const sellerId = req.user.seller.id;

    const storeRepository = AppDataSource.getRepository(Store);
    const store = await storeRepository.findOne({
      where: { sellerId },
      relations: ['products']
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const storeProductRepository = AppDataSource.getRepository(StoreProduct);
    const storeProducts = await storeProductRepository.find({
      where: { storeId: store.id },
      relations: ['product']
    });

    res.json({
      store,
      products: storeProducts
    });
  } catch (error) {
    next(error);
  }
};

export const createStore = async (req, res, next) => {
  try {
    const { title } = req.body;
    const sellerId = req.user.seller.id;

    const storeRepository = AppDataSource.getRepository(Store);
    const existingStore = await storeRepository.findOne({
      where: { sellerId }
    });

    if (existingStore) {
      return res.status(409).json({ error: 'Store already exists for this seller' });
    }

    const store = storeRepository.create({
      title,
      sellerId
    });
    await storeRepository.save(store);

    res.status(201).json({
      message: 'Store created successfully',
      store
    });
  } catch (error) {
    next(error);
  }
};
