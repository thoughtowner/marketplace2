/**
 * Middleware для валидации входных данных с помощью Zod
 * 
 * Фабричная функция, которая возвращает middleware для валидации
 * данных запроса (body, query, params) согласно переданной Zod схеме.
 * 
 * Процесс валидации:
 * 1. Объединение body, query и params в один объект
 * 2. Валидация с помощью schema.parse()
 * 3. Обновление req с преобразованными значениями (если Zod выполнил преобразования)
 * 4. Передача управления следующему middleware при успехе
 * 5. Возврат ошибки 400 с деталями валидации при неудаче
 * 
 * Zod автоматически преобразует типы данных (например, строки в числа)
 * с помощью z.coerce, что позволяет принимать данные в разных форматах.
 * 
 * @param {z.ZodObject} schema - Zod схема для валидации
 * @returns {Function} Middleware функция для валидации
 * 
 * @example
 * // Использование с Zod схемой
 * const schema = z.object({
 *   body: z.object({
 *     amount: z.coerce.number().positive()
 *   })
 * });
 * router.post('/deposit', validate(schema), depositMoney);
 */
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      // Update req with parsed values if needed
      if (result.body) req.body = result.body;
      if (result.query) req.query = result.query;
      if (result.params) req.params = result.params;
      next();
    } catch (error) {
      if (error.errors) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors
        });
      }
      return res.status(400).json({ error: 'Validation error', message: error.message });
    }
  };
};
