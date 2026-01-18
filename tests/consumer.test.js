import request from 'supertest';
import app from '../index.js';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../models/User.js';
import { Consumer } from '../models/Consumer.js';
import { Store } from '../models/Store.js';
import { Product } from '../models/Product.js';
import { StoreProduct } from '../models/StoreProduct.js';
import { Cart } from '../models/Cart.js';
import jwt from 'jsonwebtoken';

describe('Consumer API', () => {
  let consumerToken;
  let consumerUserId;
  let sellerToken;
  let storeId;
  let productId;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Create consumer user
    const consumerRegisterResponse = await request(app)
      .post('/api/auth/register')
      .send({
        login: 'testconsumerapi@example.com',
        password: 'password123',
        role: 'consumer'
      });
    consumerToken = consumerRegisterResponse.body.token;
    consumerUserId = consumerRegisterResponse.body.user.id;

    // Create seller user and store
    const sellerRegisterResponse = await request(app)
      .post('/api/auth/register')
      .send({
        login: 'testsellerapi@example.com',
        password: 'password123',
        role: 'seller'
      });
    sellerToken = sellerRegisterResponse.body.token;

    const createStoreResponse = await request(app)
      .post('/api/seller/store')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ title: 'Test Store' });
    storeId = createStoreResponse.body.store.id;

    const createProductResponse = await request(app)
      .post('/api/seller/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        title: 'Test Product',
        price: 100,
        quantity: 10
      });
    productId = createProductResponse.body.product.id;
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/consumer/deposit', () => {
    it('should deposit money to consumer account', async () => {
      const response = await request(app)
        .post('/api/consumer/deposit')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ amount: 1000 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('balance');
      expect(parseFloat(response.body.balance)).toBeGreaterThanOrEqual(1000);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/consumer/deposit')
        .send({ amount: 100 });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/consumer/cart', () => {
    it('should add product to cart', async () => {
      const response = await request(app)
        .post('/api/consumer/cart')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          productId: productId,
          quantity: 2
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cartItem');
    });

    it('should not add product if insufficient quantity', async () => {
      const response = await request(app)
        .post('/api/consumer/cart')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          productId: productId,
          quantity: 1000
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/consumer/cart', () => {
    it('should get consumer cart', async () => {
      const response = await request(app)
        .get('/api/consumer/cart')
        .set('Authorization', `Bearer ${consumerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('cartItems');
    });
  });

  describe('PATCH /api/consumer/cart/:id', () => {
    it('should update cart quantity', async () => {
      const response = await request(app)
        .patch(`/api/consumer/cart/${productId}`)
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ quantity: 1 });

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/consumer/cart/purchase', () => {
    it('should purchase all items in cart', async () => {
      // First deposit money
      await request(app)
        .post('/api/consumer/deposit')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({ amount: 5000 });

      // Add product to cart
      await request(app)
        .post('/api/consumer/cart')
        .set('Authorization', `Bearer ${consumerToken}`)
        .send({
          productId: productId,
          quantity: 1
        });

      const response = await request(app)
        .post('/api/consumer/cart/purchase')
        .set('Authorization', `Bearer ${consumerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalCost');
    });
  });
});
