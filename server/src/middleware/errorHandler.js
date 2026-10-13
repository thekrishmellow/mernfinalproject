export function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.originalUrl,
    method: req.method
  });

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Database Validation Error',
      errors: Object.values(err.errors).map((e) => e.message)
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid format for resource identifier: ${err.value}`
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${field} already exists.`
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational || process.env.NODE_ENV === 'development'
    ? err.message
    : 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message
  });
}
