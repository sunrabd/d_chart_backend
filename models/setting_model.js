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
  insta_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  youtube_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  razorpay_key:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  whatsapp_channel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  terms_and_condition: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  qrCode :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  privacy_policy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  payment_type: {
    type: DataTypes.ENUM('UPI', 'RazorPay', 'Cashfree', 'PhonePe', 'SkillPay', 'NoGateway'),
    allowNull: true,
    defaultValue: 'UPI',
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
