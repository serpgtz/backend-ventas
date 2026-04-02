const AppError = require('../errors/AppError');

const notFoundMiddleware = (req, _res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
};

module.exports = notFoundMiddleware;
