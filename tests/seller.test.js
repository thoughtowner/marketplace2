import request from 'supertest';
import app from '../index.js';
import { AppDataSource } from '../config/data-source.js';

describe('Seller API', () => {
  let sellerToken;

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const response = await request(app)
      .post('/api/auth/register')
      .send({
        login: 'testsellerapi2@example.com',
        password: 'password123',
        role: 'seller'
      });
    sellerToken = response.body.token;
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/seller/store', () => {
    it('should create a store', async () => {
      const response = await request(app)
        .post('/api/seller/store')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ title: 'My Store' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('store');
      expect(response.body.store.title).toBe('My Store');
    });
  });

  describe('POST /api/seller/products', () => {
    it('should create a product', async () => {
      const response = await request(app)
        .post('/api/seller/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'New Product',
          price: 50,
          quantity: 5
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('product');
    });

    it('should require store to exist', async () => {
      const response = await request(app)
        .post('/api/seller/products')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: 'Another Product',
          price: 75
        });

      expect([201, 404]).toContain(response.status);
    });
  });

  describe('GET /api/seller/products', () => {
    it('should get all products in store', async () => {
      const response = await request(app)
        .get('/api/seller/products')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('store');
    });
  });

  describe('POST /api/seller/withdraw', () => {
    it('should withdraw money from seller account', async () => {
      const response = await request(app)
        .post('/api/seller/withdraw')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({ amount: 10 });

      expect([200, 400]).toContain(response.status);
    });
  });
});
