const Joi = require('joi');

const SCORE_VALUES = ['A', 'B', 'C'];
const DEPENDENCIA_VALUES = ['IMSS', 'ISSSTE', 'CFE', 'PEMEX'];

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const searchProspectsSchema = Joi.object({
  q: Joi.string().trim().min(1).max(100).required(),
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(100).default(10),
});

const listProspectsSchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  limit: Joi.number().integer().positive().max(100).default(5),
});

const prospectBaseSchema = {
  nombre: Joi.string().trim().min(2).max(120),
  apellido_paterno: Joi.string().trim().min(2).max(120),
  apellido_materno: Joi.string().trim().min(2).max(120),
  telefono: Joi.string().trim().min(7).max(25),
  dependencia: Joi.string()
    .trim()
    .uppercase()
    .valid(...DEPENDENCIA_VALUES),
  ingresos: Joi.number().precision(2).min(0),
  perfil: Joi.string()
    .trim()
    .uppercase()
    .valid(...SCORE_VALUES),
  interes: Joi.string()
    .trim()
    .uppercase()
    .valid(...SCORE_VALUES),
  decision: Joi.string()
    .trim()
    .uppercase()
    .valid(...SCORE_VALUES),
  proximo_contacto: Joi.date().iso().allow(null),
  comentarios: Joi.string().trim().allow('', null).max(5000),
  apellidos: Joi.string().trim().max(240),
};

const createProspectSchema = Joi.object({
  ...prospectBaseSchema,
  nombre: prospectBaseSchema.nombre.required(),
  apellido_paterno: prospectBaseSchema.apellido_paterno.required(),
  apellido_materno: prospectBaseSchema.apellido_materno.required(),
  telefono: prospectBaseSchema.telefono.required(),
  dependencia: prospectBaseSchema.dependencia.required(),
  ingresos: prospectBaseSchema.ingresos.required(),
  perfil: prospectBaseSchema.perfil.required(),
  interes: prospectBaseSchema.interes.required(),
  decision: prospectBaseSchema.decision.required(),
});

const updateProspectSchema = Joi.object(prospectBaseSchema);

const filePathQuerySchema = Joi.object({
  path: Joi.string().trim().min(1).required(),
});

module.exports = {
  listProspectsSchema,
  idParamSchema,
  searchProspectsSchema,
  createProspectSchema,
  updateProspectSchema,
  filePathQuerySchema,
};
