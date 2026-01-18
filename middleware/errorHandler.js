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

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
};
