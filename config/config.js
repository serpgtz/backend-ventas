'use strict';

require('dotenv').config();

const base = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT || 'mysql',
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  seederStorage: 'sequelize',
  migrationStorage: 'sequelize',
};

module.exports = {
  development: { ...base },
  test: { ...base },
  production: { ...base },
};
