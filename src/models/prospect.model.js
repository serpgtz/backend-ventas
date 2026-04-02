const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Prospect = sequelize.define(
  'Prospect',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido_paterno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apellido_materno: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dependencia: {
      type: DataTypes.ENUM('IMSS', 'ISSSTE', 'CFE', 'PEMEX'),
      allowNull: false,
    },
    ingresos: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    // Criterios de scoring comercial (A/B/C)
    perfil: {
      type: DataTypes.ENUM('A', 'B', 'C'),
      allowNull: true,
    },
    interes: {
      type: DataTypes.ENUM('A', 'B', 'C'),
      allowNull: true,
    },
    decision: {
      type: DataTypes.ENUM('A', 'B', 'C'),
      allowNull: true,
    },
    // Resultado calculado automáticamente desde perfil/interes/decision
    score_total: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    nivel_venta: {
      type: DataTypes.ENUM('caliente', 'tibio', 'frio'),
      allowNull: true,
    },
    comprobante_ingresos: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    identificacion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fecha_subida_comprobante: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    fecha_subida_identificacion: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    proximo_contacto: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    comentarios: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'prospects',
    timestamps: true,
  }
);

module.exports = Prospect;
