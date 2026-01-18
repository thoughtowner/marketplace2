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

/**
 * Конфигурация подключения к базе данных PostgreSQL через TypeORM
 * 
 * Создаёт и экспортирует DataSource объект для работы с базой данных.
 * Настройки подключения берутся из переменных окружения:
 * - DB_HOST: хост базы данных (по умолчанию localhost)
 * - DB_PORT: порт базы данных (по умолчанию 5432)
 * - DB_USERNAME: имя пользователя
 * - DB_PASSWORD: пароль
 * - DB_DATABASE: название базы данных
 * 
 * synchronize: false - автоматическая синхронизация схемы отключена
 * (рекомендуется для продакшена, используйте миграции)
 * 
 * logging: false - логирование SQL запросов отключено
 * (можно включить для отладки)
 * 
 * entities: массив всех моделей (entities) приложения
 * migrations: путь к файлам миграций
 * 
 * @type {DataSource}
 */
const isTest = process.env.NODE_ENV === 'test';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: isTest ? (process.env.DB_TEST_HOST || process.env.DB_HOST) : process.env.DB_HOST,
  port: parseInt(isTest ? (process.env.DB_TEST_PORT || process.env.DB_PORT) : process.env.DB_PORT || '5432', 10),
  username: isTest ? (process.env.DB_TEST_USERNAME || process.env.DB_USERNAME) : process.env.DB_USERNAME,
  password: isTest ? (process.env.DB_TEST_PASSWORD || process.env.DB_PASSWORD) : process.env.DB_PASSWORD,
  database: isTest ? (process.env.DB_TEST_DATABASE || process.env.DB_DATABASE) : process.env.DB_DATABASE,
  synchronize: isTest,    // enable schema sync in tests for clean state
  dropSchema: isTest,     // drop schema in tests to start fresh
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
  migrations: isTest ? [] : ['migrations/*.js'], // avoid loading migrations during tests
  subscribers: [],
});
