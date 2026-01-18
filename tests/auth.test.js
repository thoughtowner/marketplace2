import request from 'supertest';
import app from '../index.js';
import { AppDataSource } from '../config/data-source.js';

describe('Auth API', () => {
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

  describe('POST /api/auth/register', () => {
    it('should register a new consumer', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          login: 'testconsumer@example.com',
          password: 'password123',
          role: 'consumer'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('consumer');
    });

    it('should register a new seller', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          login: 'testseller@example.com',
          password: 'password123',
          role: 'seller'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.role).toBe('seller');
    });

    it('should not register with duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          login: 'duplicate@example.com',
          password: 'password123',
          role: 'consumer'
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          login: 'duplicate@example.com',
          password: 'password123',
          role: 'consumer'
        });

      expect(response.status).toBe(409);
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          login: 'invalid-email',
          password: 'password123',
          role: 'consumer'
        });

      expect(response.status).toBe(400);
    });

    it('should validate password length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          login: 'test@example.com',
          password: '123',
          role: 'consumer'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          login: 'loginuser@example.com',
          password: 'password123',
          role: 'consumer'
        });
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'loginuser@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'loginuser@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });

    it('should not login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          login: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
    });
  });
});
