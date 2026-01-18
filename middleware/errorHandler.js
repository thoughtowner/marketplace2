/**
 * Глобальный обработчик ошибок
 * 
 * Обрабатывает все ошибки, возникающие в приложении, и возвращает
 * соответствующие HTTP ответы. Поддерживает различные типы ошибок:
 * 
 * - ValidationError: ошибки валидации (400)
 * - UnauthorizedError: ошибки аутентификации (401)
 * - PostgreSQL ошибка 23505: нарушение уникальности (409)
 * - PostgreSQL ошибка 23503: нарушение внешнего ключа (400)
 * - Остальные ошибки: внутренняя ошибка сервера (500)
 * 
 * Все ошибки логируются в консоль для отладки.
 * 
 * @param {Error} err - Объект ошибки
 * @param {string} [err.name] - Имя ошибки
 * @param {string} [err.code] - Код ошибки (для PostgreSQL)
 * @param {string} [err.message] - Сообщение об ошибке
 * @param {number} [err.status] - HTTP статус код
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @param {Function} next - Express next middleware функция
 * @returns {void}
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: err.detail
    });
  }

  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Foreign key constraint violation',
      details: err.detail
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
};

/**
 * Обработчик для несуществующих маршрутов
 * 
 * Возвращает ошибку 404 для всех запросов, которые не соответствуют
 * ни одному определённому маршруту в приложении.
 * 
 * Должен быть установлен после всех маршрутов, но перед errorHandler.
 * 
 * @param {Object} req - Express request объект
 * @param {Object} res - Express response объект
 * @returns {void}
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
};
