import { AppDataSource } from './data-source.js';

/**
 * Инициализирует подключение к базе данных
 * 
 * Устанавливает соединение с PostgreSQL базой данных через TypeORM.
 * Выполняет подключение к БД, указанной в конфигурации AppDataSource.
 * 
 * @returns {Promise<void>}
 * @throws {Error} Если подключение не удалось
 */
export const initializeDatabase = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');
  } catch (error) {
    console.error('Error during database initialization:', error);
    throw error;
  }
};

/**
 * Закрывает подключение к базе данных
 * 
 * Корректно завершает все соединения с базой данных.
 * Полезно при завершении работы приложения или в тестах.
 * 
 * @returns {Promise<void>}
 * @throws {Error} Если закрытие соединения не удалось
 */
export const closeDatabase = async () => {
  try {
    await AppDataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error during database close:', error);
    throw error;
  }
};
