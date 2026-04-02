const sequelize = require('../config/database');
const User = require('./user.model');
const Prospect = require('./prospect.model');

User.hasMany(Prospect, {
  foreignKey: 'userId',
  as: 'prospects',
});

Prospect.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

module.exports = {
  sequelize,
  User,
  Prospect,
};
