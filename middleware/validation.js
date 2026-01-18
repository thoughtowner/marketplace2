export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
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
