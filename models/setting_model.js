const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AdminSetting = sequelize.define('AdminSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  current_version: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  admin_upi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  admin_contact_no: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  apk: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'admin-setting',
  timestamps: false,
});

module.exports = AdminSetting;
