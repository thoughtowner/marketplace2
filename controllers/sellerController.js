import { AppDataSource } from '../config/data-source.js';
import { Seller } from '../models/Seller.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { StoreProduct } from '../models/StoreProduct.js';
import { Cart } from '../models/Cart.js';
import { ConsumerProduct } from '../models/ConsumerProduct.js';

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

    const storeProductRepository = AppDataSource.getRepository(StoreProduct);
    await storeProductRepository.delete({ productId });

    const consumerProductRepository = AppDataSource.getRepository(ConsumerProduct);
    await consumerProductRepository.delete({ productId });

    const cartRepository = AppDataSource.getRepository(Cart);
    await cartRepository.delete({ productId });

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
