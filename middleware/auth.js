import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source.js';
import { User } from '../models/User.js';

/**
 * Middleware для аутентификации пользователя по JWT токену
 * 
 * Проверяет наличие и валидность JWT токена в заголовке Authorization.
 * Процесс аутентификации включает:
 * 1. Извлечение токена из заголовка Authorization (формат: "Bearer <token>")
 * 2. Верификация токена с помощью секретного ключа (JWT_SECRET)
 * 3. Поиск пользователя в базе данных по userId из токена
 * 4. Загрузка связанных ролей (consumer, seller, admin)
 * 5. Добавление объекта пользователя в req.user для использования в следующих middleware/контроллерах
 * 
 * Если токен отсутствует, невалиден или истёк, возвращается ошибка 401.
 * 
 * @param {Object} req - Express request объект
 * @param {Object} req.headers - Заголовки запроса
 * @param {string} [req.headers.authorization] - Заголовок с токеном (формат: "Bearer <token>")
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next middleware функция
 * @returns {Promise<void>}
 * 
 * @throws {401} Если токен отсутствует, невалиден или истёк
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
      relations: ['consumer', 'seller', 'admin']
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Middleware для проверки роли пользователя
 * 
 * Фабричная функция, которая возвращает middleware для проверки,
 * имеет ли аутентифицированный пользователь одну из указанных ролей.
 * 
 * Проверяет наличие соответствующей записи в связанных таблицах:
 * - 'consumer' - проверяет наличие req.user.consumer
 * - 'seller' - проверяет наличие req.user.seller
 * - 'admin' - проверяет наличие req.user.admin
 * 
 * Должен использоваться после authenticateToken, так как требует
 * наличия req.user.
 * 
 * @param {...string} roles - Список разрешённых ролей ('consumer', 'seller', 'admin')
 * @returns {Function} Middleware функция для проверки роли
 * 
 * @example
 * // Разрешить доступ только покупателям и продавцам
 * router.use(authenticateToken);
 * router.use(requireRole('consumer', 'seller'));
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasRole = roles.some(role => {
      if (role === 'consumer' && req.user.consumer) return true;
      if (role === 'seller' && req.user.seller) return true;
      if (role === 'admin' && req.user.admin) return true;
      return false;
    });

    if (!hasRole) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
