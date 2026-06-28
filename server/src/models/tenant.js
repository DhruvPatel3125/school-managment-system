const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Tenant = sequelize.define('Tenant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  schoolName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'school_name'
  },
  subdomain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'subdomain'
  },
  logoUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'logo_url'
  },
  primaryColor: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#1e3a8a', // Default Tailwind Blue-800
    field: 'primary_color'
  },
  secondaryColor: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '#d97706', // Default Tailwind Amber-600
    field: 'secondary_color'
  },
  status: {
    type: DataTypes.ENUM('active', 'suspended', 'draft'),
    allowNull: false,
    defaultValue: 'active',
    field: 'status'
  }
}, {
  tableName: 'tenants',
  indexes: [
    {
      unique: true,
      fields: ['subdomain']
    }
  ]
});

module.exports = Tenant;
