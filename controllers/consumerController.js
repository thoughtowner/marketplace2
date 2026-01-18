import { AppDataSource } from '../config/data-source.js';
import { Consumer } from '../models/Consumer.js';
import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { StoreProduct } from '../models/StoreProduct.js';
import { ConsumerProduct } from '../models/ConsumerProduct.js';
import { Seller } from '../models/Seller.js';

export const depositMoney = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const consumerId = req.user.consumer.id;

    const consumerRepository = AppDataSource.getRepository(Consumer);
    const consumer = await consumerRepository.findOne({ where: { id: consumerId } });

    if (!consumer) {
      return res.status(404).json({ error: 'Consumer not found' });
    }

    consumer.money = parseFloat(consumer.money) + parseFloat(amount);
    await consumerRepository.save(consumer);

    res.json({
      message: 'Money deposited successfully',
      balance: consumer.money
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const consumerId = req.user.consumer.id;

    const productRepository = AppDataSource.getRepository(Product);
    const product = await productRepository.findOne({ where: { id: productId } });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const storeProductRepository = AppDataSource.getRepository(StoreProduct);
    let storeProduct = await storeProductRepository.findOne({
      where: { storeId: product.storeId, productId: product.id }
    });

    if (!storeProduct) {
      storeProduct = storeProductRepository.create({
        storeId: product.storeId,
        productId: product.id,
        quantity: 0
      });
    }

    if (storeProduct.quantity < quantity) {
      return res.status(400).json({
        error: 'Insufficient quantity in store',
        available: storeProduct.quantity
      });
    }

    storeProduct.quantity -= quantity;
    await storeProductRepository.save(storeProduct);

    const cartRepository = AppDataSource.getRepository(Cart);
    let cartItem = await cartRepository.findOne({
      where: { consumerId, productId }
    });

    if (cartItem) {
      cartItem.quantity += quantity;
      await cartRepository.save(cartItem);
    } else {
      cartItem = cartRepository.create({
        consumerId,
        productId,
        quantity
      });
      await cartRepository.save(cartItem);
    }

    res.json({
      message: 'Product added to cart',
      cartItem
    });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const consumerId = req.user.consumer.id;

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItem = await cartRepository.findOne({
      where: { consumerId, productId },
      relations: ['product']
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    const quantityToReturn = cartItem.quantity;

    const storeProductRepository = AppDataSource.getRepository(StoreProduct);
    let storeProduct = await storeProductRepository.findOne({
      where: { storeId: cartItem.product.storeId, productId }
    });

    if (!storeProduct) {
      storeProduct = storeProductRepository.create({
        storeId: cartItem.product.storeId,
        productId,
        quantity: 0
      });
    }

    storeProduct.quantity += quantityToReturn;
    await storeProductRepository.save(storeProduct);

    await cartRepository.remove(cartItem);

    res.json({
      message: 'Product removed from cart',
      returnedQuantity: quantityToReturn
    });
  } catch (error) {
    next(error);
  }
};

export const updateCartQuantity = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.id);
    const { quantity } = req.body;
    const consumerId = req.user.consumer.id;

    if (quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItem = await cartRepository.findOne({
      where: { consumerId, productId },
      relations: ['product']
    });

    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    const currentQuantity = cartItem.quantity;
    const difference = currentQuantity - quantity;

    if (difference > 0) {
      const storeProductRepository = AppDataSource.getRepository(StoreProduct);
      let storeProduct = await storeProductRepository.findOne({
        where: { storeId: cartItem.product.storeId, productId }
      });

      if (!storeProduct) {
        storeProduct = storeProductRepository.create({
          storeId: cartItem.product.storeId,
          productId,
          quantity: 0
        });
      }

      storeProduct.quantity += difference;
      await storeProductRepository.save(storeProduct);
    }

    cartItem.quantity = quantity;
    await cartRepository.save(cartItem);

    res.json({
      message: 'Cart quantity updated',
      cartItem
    });
  } catch (error) {
    next(error);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const consumerId = req.user.consumer.id;

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItems = await cartRepository.find({
      where: { consumerId },
      relations: ['product', 'product.store']
    });

    const consumerRepository = AppDataSource.getRepository(Consumer);
    const consumer = await consumerRepository.findOne({ where: { id: consumerId } });

    res.json({ cartItems, balance: consumer ? consumer.money : 0 });
  } catch (error) {
    next(error);
  }
};

export const purchaseCart = async (req, res, next) => {
  try {
    const consumerId = req.user.consumer.id;

    const cartRepository = AppDataSource.getRepository(Cart);
    const cartItems = await cartRepository.find({
      where: { consumerId },
      relations: ['product', 'product.store']
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let totalCost = 0;
    const sellerPayments = {};

    for (const item of cartItems) {
      const itemCost = parseFloat(item.product.price) * item.quantity;
      totalCost += itemCost;

      const sellerId = item.product.store.sellerId;
      if (!sellerPayments[sellerId]) {
        sellerPayments[sellerId] = 0;
      }
      sellerPayments[sellerId] += itemCost;
    }

    const consumerRepository = AppDataSource.getRepository(Consumer);
    const consumer = await consumerRepository.findOne({ where: { id: consumerId } });

    if (parseFloat(consumer.money) < totalCost) {
      return res.status(400).json({
        error: 'Insufficient funds',
        required: totalCost,
        available: consumer.money
      });
    }

    consumer.money = parseFloat(consumer.money) - totalCost;
    await consumerRepository.save(consumer);

    const consumerProductRepository = AppDataSource.getRepository(ConsumerProduct);
    const purchases = [];

    for (const item of cartItems) {
      const purchase = consumerProductRepository.create({
        consumerId,
        productId: item.productId,
        quantity: item.quantity
      });
      await consumerProductRepository.save(purchase);
      purchases.push(purchase);
    }

    const sellerRepository = AppDataSource.getRepository(Seller);
    for (const [sellerId, amount] of Object.entries(sellerPayments)) {
      const seller = await sellerRepository.findOne({ where: { id: parseInt(sellerId) } });
      if (seller) {
        seller.money = parseFloat(seller.money) + parseFloat(amount);
        await sellerRepository.save(seller);
      }
    }

    await cartRepository.remove(cartItems);

    res.json({
      message: 'Purchase completed successfully',
      totalCost,
      purchases
    });
  } catch (error) {
    next(error);
  }
};
