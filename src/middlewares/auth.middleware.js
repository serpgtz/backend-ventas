const jwt = require('jsonwebtoken');
const AppError = require('../errors/AppError');

const authMiddleware = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No autorizado', 401));
    }

    const token = authHeader.split(' ')[1];
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
