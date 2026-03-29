const Prospect = require('../models/prospect.model');
const { Op, fn, col, where, literal } = require('sequelize');
const uploadToDropbox = require('../utils/uploadToDropbox');
const getDropboxTemporaryLink = require('../utils/getDropboxTemporaryLink');

const REQUIRED_FIELDS = ['nombre', 'apellidos', 'telefono', 'dependencia', 'ingresos'];
const SCORE_FIELDS = ['perfil', 'interes', 'decision'];
const SCORE_MAP = {
  A: 3,
  B: 2,
  C: 1,
};

// Perfil pesa más que interés y decisión.
const SCORE_WEIGHTS = {
  perfil: 2,
  interes: 1,
  decision: 1,
};

const validateRequiredFields = (payload) => {
  const missing = REQUIRED_FIELDS.filter((field) => {
    return payload[field] === undefined || payload[field] === null || payload[field] === '';
  });

  if (missing.length > 0) {
    const error = new Error(`Faltan campos obligatorios: ${missing.join(', ')}`);
    error.statusCode = 400;
    throw error;
  }
};

const buildBadRequest = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const normalizeScoreValue = (field, value) => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw buildBadRequest(`El campo "${field}" es obligatorio y debe ser A, B o C`);
  }

  const normalized = value.trim().toUpperCase();

  if (!Object.prototype.hasOwnProperty.call(SCORE_MAP, normalized)) {
    throw buildBadRequest(`El campo "${field}" solo acepta valores: A, B o C`);
  }

  return normalized;
};

const getNivel = (score, perfil) => {
  // Regla comercial prioritaria:
  // Si el perfil no califica (C), siempre se considera prospecto frío.
  if (perfil === 'C') {
    return 'frio';
  }

  if (score >= 9 && score <= 12) return 'caliente';
  if (score >= 5 && score <= 8) return 'tibio';
  if (score >= 2 && score <= 4) return 'frio';

  throw buildBadRequest('Score fuera de rango válido para estado');
};

const calculateScore = (payload) => {
  const perfil = normalizeScoreValue('perfil', payload.perfil);
  const interes = normalizeScoreValue('interes', payload.interes);
  const decision = normalizeScoreValue('decision', payload.decision);

  let score_total =
    SCORE_MAP[perfil] * SCORE_WEIGHTS.perfil +
    SCORE_MAP[interes] * SCORE_WEIGHTS.interes +
    SCORE_MAP[decision] * SCORE_WEIGHTS.decision;

  // Para que también respete el orden comercial en listados,
  // perfil C se limita al rango frío (2-4).
  if (perfil === 'C') {
    score_total = Math.min(score_total, 4);
  }

  const nivel_venta = getNivel(score_total, perfil);

  return {
    perfil,
    interes,
    decision,
    score_total,
    nivel_venta,
  };
};

const sanitizeScoreFields = (payload = {}) => {
  const result = { ...payload };

  // Estos campos siempre deben calcularse en backend.
  delete result.score_total;
  delete result.nivel_venta;
  delete result.estado;

  return result;
};

const prepareFileFields = async (files) => {
  const result = {};
  const now = new Date();

  if (files?.comprobante?.[0]) {
    try {
      const comprobantePath = await uploadToDropbox(files.comprobante[0]);

      result.comprobante_ingresos = comprobantePath;
      result.fecha_subida_comprobante = now;
    } catch (error) {
      console.error('🔥 ERROR DROPBOX COMPROBANTE:', error);
      console.error('🔥 DETALLE:', error?.response?.data);

      throw new Error('Error subiendo comprobante a Dropbox');
    }
  }

  if (files?.identificacion?.[0]) {
    try {
      const identificacionPath = await uploadToDropbox(files.identificacion[0]);

      result.identificacion = identificacionPath;
      result.fecha_subida_identificacion = now;
    } catch (error) {
      console.error('🔥 ERROR DROPBOX IDENTIFICACION:', error);
      console.error('🔥 DETALLE:', error?.response?.data);

      throw new Error('Error subiendo identificación a Dropbox');
    }
  }

  return result;
};

const createProspect = async (payload, files) => {
  const sanitizedPayload = sanitizeScoreFields(payload);

  validateRequiredFields(sanitizedPayload);

  const scoreFields = calculateScore(sanitizedPayload);
  const fileFields = await prepareFileFields(files);

  const created = await Prospect.create({
    ...sanitizedPayload,
    ...scoreFields,
    ...fileFields,
  });

  return created;
};

const getAllProspects = async () => {
  return Prospect.findAll({
    order: [
      [
        literal(`CASE
          WHEN nivel_venta = 'caliente' THEN 1
          WHEN nivel_venta = 'tibio' THEN 2
          WHEN nivel_venta = 'frio' THEN 3
          ELSE 4
        END`),
        'ASC',
      ],
      ['score_total', 'DESC'],
      ['createdAt', 'DESC'],
    ],
  });
};

const normalizeSearchTerm = (value) => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const buildAccentInsensitiveExpression = (expression) => {
  const replacements = [
    ['á', 'a'],
    ['é', 'e'],
    ['í', 'i'],
    ['ó', 'o'],
    ['ú', 'u'],
    ['ü', 'u'],
    ['ñ', 'n'],
  ];

  return replacements.reduce((result, [from, to]) => {
    return fn('REPLACE', result, from, to);
  }, fn('LOWER', expression));
};

const searchProspectsByName = async ({ q, page = 1, limit = 10 }) => {
  const normalized = normalizeSearchTerm(q);
  const pattern = `%${normalized}%`;
  const cappedLimit = Math.min(limit, 100);
  const offset = (page - 1) * cappedLimit;

  const fullNameExpression = fn('CONCAT', col('nombre'), ' ', col('apellidos'));
  const normalizedNombre = buildAccentInsensitiveExpression(col('nombre'));
  const normalizedApellidos = buildAccentInsensitiveExpression(col('apellidos'));
  const normalizedFullName = buildAccentInsensitiveExpression(fullNameExpression);

  const { rows, count } = await Prospect.findAndCountAll({
    where: {
      [Op.or]: [
        where(normalizedNombre, { [Op.like]: pattern }),
        where(normalizedApellidos, { [Op.like]: pattern }),
        where(normalizedFullName, { [Op.like]: pattern }),
      ],
    },
    order: [['nombre', 'ASC'], ['apellidos', 'ASC']],
    limit: cappedLimit,
    offset,
  });

  return { rows, count, page, limit: cappedLimit };
};

const getProspectById = async (id) => {
  const prospect = await Prospect.findByPk(id);

  if (!prospect) {
    const error = new Error('Prospecto no encontrado');
    error.statusCode = 404;
    throw error;
  }

  return prospect;
};

const updateProspect = async (id, payload, files) => {
  const prospect = await getProspectById(id);
  const sanitizedPayload = sanitizeScoreFields(payload);
  const fileFields = await prepareFileFields(files);

  const hasIncomingScoreFields = SCORE_FIELDS.some((field) => {
    return Object.prototype.hasOwnProperty.call(sanitizedPayload, field);
  });

  let scoreFields = {};

  if (hasIncomingScoreFields) {
    const scoringPayload = {
      perfil:
        sanitizedPayload.perfil !== undefined ? sanitizedPayload.perfil : prospect.perfil,
      interes:
        sanitizedPayload.interes !== undefined ? sanitizedPayload.interes : prospect.interes,
      decision:
        sanitizedPayload.decision !== undefined ? sanitizedPayload.decision : prospect.decision,
    };

    scoreFields = calculateScore(scoringPayload);
  }

  await prospect.update({
    ...sanitizedPayload,
    ...scoreFields,
    ...fileFields,
  });

  return prospect;
};

const deleteProspect = async (id) => {
  const prospect = await getProspectById(id);
  await prospect.destroy();
};

const getTemporaryFileLink = async (path) => {
  if (!path || typeof path !== 'string') {
    const error = new Error('El parámetro "path" es obligatorio');
    error.statusCode = 400;
    throw error;
  }

  if (!path.startsWith('/prospectos/')) {
    const error = new Error('Ruta inválida');
    error.statusCode = 400;
    throw error;
  }

  return getDropboxTemporaryLink(path);
};

module.exports = {
  createProspect,
  getAllProspects,
  searchProspectsByName,
  getProspectById,
  updateProspect,
  deleteProspect,
  getTemporaryFileLink,
  calculateScore,
  getNivel,
};
