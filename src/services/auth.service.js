const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const error = new Error('JWT secret no configurado');
    error.statusCode = 500;
    throw error;
  }

  return secret;
};

const validateRegisterPayload = ({ email, password, nombre }) => {
  if (!email || !password || !nombre) {
    const error = new Error('email, password y nombre son obligatorios');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(normalizedEmail)) {
    const error = new Error('Email inválido');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('La contraseña debe tener al menos 6 caracteres');
    error.statusCode = 400;
    throw error;
  }

  return {
    nombre: nombre.trim(),
    email: normalizedEmail,
    password,
  };
};

const register = async (payload) => {
  const { email, password, nombre } = validateRegisterPayload(payload);

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = new Error('El email ya está registrado');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    email,
    nombre,
    password: hashedPassword,
  });

  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error('email y password son obligatorios');
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ where: { email: normalizedEmail } });

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    getJwtSecret(),
    { expiresIn: '1h' }
  );

  return token;
};

module.exports = {
  register,
  login,
};
