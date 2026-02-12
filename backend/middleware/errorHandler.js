const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    status: 500,
    message: 'Internal Server Error'
  };

  // Validation errors
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.details = Object.values(err.errors).map(val => val.message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.message = 'Token expired';
  }

  // Supabase errors
  if (err.code === 'PGRST301') {
    error.status = 404;
    error.message = 'Resource not found';
  }

  if (err.code === '23505') { // Unique constraint violation
    error.status = 409;
    error.message = 'Resource already exists';
  }

  if (err.code === '23503') { // Foreign key constraint violation
    error.status = 400;
    error.message = 'Invalid reference';
  }

  // Custom application errors
  if (err.status) {
    error.status = err.status;
    error.message = err.message;
  }

  // Rate limiting errors
  if (err.message && err.message.includes('Too many requests')) {
    error.status = 429;
    error.message = 'Too many requests. Please try again later.';
  }

  res.status(error.status).json({
    error: true,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      original: err.message 
    })
  });
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  notFound
};