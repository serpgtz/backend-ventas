const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../errors/AppError');

const SALT_ROUNDS = 10;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError('JWT secret no configurado', 500);
  }

  return secret;
};

const sanitizeUser = (user) => ({
  id: user.id,
  nombre: user.nombre,
  apellido_paterno: user.apellido_paterno,
  apellido_materno: user.apellido_materno,
  tel: user.tel,
  email: user.email,
});

const register = async ({ email, password, nombre, apellido_paterno, apellido_materno, tel }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new AppError('El email ya está registrado', 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    email: normalizedEmail,
    nombre: nombre.trim(),
    apellido_paterno: apellido_paterno.trim(),
    apellido_materno: apellido_materno.trim(),
    tel: tel.trim(),
    password: hashedPassword,
  });

  return sanitizeUser(user);
};

const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    getJwtSecret(),
    { expiresIn: '1h' }
  );

  return {
    token,
    user: sanitizeUser(user),
  };
};

module.exports = {
  register,
  login,
};
