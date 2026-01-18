import request from 'supertest';
import app from '../index.js';
import { AppDataSource } from '../config/data-source.js';

describe('Product API', () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('products');
      expect(Array.isArray(response.body.products)).toBe(true);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get product by ID if exists', async () => {
      const allProductsResponse = await request(app)
        .get('/api/products');

      if (allProductsResponse.body.products.length > 0) {
        const productId = allProductsResponse.body.products[0].id;
        const response = await request(app)
          .get(`/api/products/${productId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
      }
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/99999');

      expect(response.status).toBe(404);
    });
  });
});
