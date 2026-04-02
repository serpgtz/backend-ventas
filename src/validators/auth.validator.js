const Joi = require('joi');

const registerSchema = Joi.object({
  nombre: Joi.string().trim().min(2).max(120).required(),
  apellido_paterno: Joi.string().trim().min(2).max(120).required(),
  apellido_materno: Joi.string().trim().min(2).max(120).required(),
  tel: Joi.string().trim().min(7).max(25).required(),
  email: Joi.string().trim().email().max(255).required(),
  password: Joi.string().min(8).max(72).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().max(255).required(),
  password: Joi.string().min(8).max(72).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
};
