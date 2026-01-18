import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { initializeDatabase } from './config/database.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

dotenv.config();

/**
 * Главный файл приложения
 * 
 * Инициализирует и запускает Express сервер с REST API.
 * 
 * Настройка middleware:
 * - helmet(): устанавливает HTTP заголовки безопасности
 * - cors(): разрешает кросс-доменные запросы
 * - express.json(): парсит JSON тела запросов
 * - express.urlencoded(): парсит URL-encoded тела запросов
 * 
 * Маршруты:
 * - /api-docs: Swagger UI документация
 * - /api: все API маршруты приложения
 * 
 * Обработка ошибок:
 * - notFoundHandler: обрабатывает несуществующие маршруты (404)
 * - errorHandler: обрабатывает все ошибки приложения
 * 
 * Запуск сервера:
 * 1. Инициализация подключения к базе данных
 * 2. Запуск HTTP сервера на указанном порту
 * 3. Вывод информации о запуске в консоль
 */

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static('public'));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Асинхронная функция для запуска сервера
 * 
 * Выполняет инициализацию базы данных и запуск HTTP сервера.
 * При ошибке подключения к БД выводит сообщение и завершает процесс.
 * 
 * @returns {Promise<void>}
 */
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(Number(PORT), () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
