const AppError = require('../errors/AppError');

const validate = (schema, target = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[target], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const details = error.details.map((item) => ({
      field: item.path.join('.'),
      message: item.message,
    }));

    return next(new AppError('Payload inválido', 400, details));
  }

  req[target] = value;
  return next();
};

module.exports = validate;
