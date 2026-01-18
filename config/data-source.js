import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import {
  User,
  Consumer,
  Seller,
  Admin,
  Store,
  Product,
  Cart,
  ConsumerProduct,
  StoreProduct
} from '../models/index.js';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: isTest ? (process.env.DB_TEST_HOST || process.env.DB_HOST) : process.env.DB_HOST,
  port: parseInt(isTest ? (process.env.DB_TEST_PORT || process.env.DB_PORT) : process.env.DB_PORT || '5432', 10),
  username: isTest ? (process.env.DB_TEST_USERNAME || process.env.DB_USERNAME) : process.env.DB_USERNAME,
  password: isTest ? (process.env.DB_TEST_PASSWORD || process.env.DB_PASSWORD) : process.env.DB_PASSWORD,
  database: isTest ? (process.env.DB_TEST_DATABASE || process.env.DB_DATABASE) : process.env.DB_DATABASE,
  synchronize: isTest,
  dropSchema: isTest,
  logging: false,
  entities: [
    User,
    Consumer,
    Seller,
    Admin,
    Store,
    Product,
    Cart,
    ConsumerProduct,
    StoreProduct
  ],
  migrations: isTest ? [] : ['migrations/*.js'],
  subscribers: [],
});
