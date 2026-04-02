const AppError = require('../errors/AppError');

const isProduction = process.env.NODE_ENV === 'production';

const errorMiddleware = (error, _req, res, _next) => {
  const normalizedError =
    error instanceof AppError
      ? error
      : new AppError(error.message || 'Error interno del servidor', error.statusCode || 500);

  if (!isProduction) {
    console.error('[API ERROR]', {
      name: normalizedError.name,
      message: normalizedError.message,
      statusCode: normalizedError.statusCode,
      details: normalizedError.details,
      stack: normalizedError.stack,
    });
  }

  const payload = {
    success: false,
    message: normalizedError.message,
  };

  if (normalizedError.details) {
    payload.errors = normalizedError.details;
  }

  if (!isProduction) {
    payload.stack = normalizedError.stack;
  }

  return res.status(normalizedError.statusCode).json(payload);
};

module.exports = errorMiddleware;
