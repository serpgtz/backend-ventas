const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');

const authMiddleware = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const fallbackToken = req.headers['x-access-token'];
    const headerValue = typeof authHeader === 'string' ? authHeader.trim() : '';
    const bearerMatch = headerValue.match(/^Bearer\s+(.+)$/i);
    const token =
      bearerMatch?.[1]?.trim() ||
      (typeof fallbackToken === 'string' ? fallbackToken.trim() : '');

    if (!token) {
      return next(new AppError('No autorizado', 401));
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return next(new AppError('JWT secret no configurado', 500));
    }

    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (_error) {
    return next(new AppError('Token inválido o expirado', 401));
  }
};

module.exports = authMiddleware;
