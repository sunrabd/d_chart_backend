const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const MarketType = require('./market_type_model');


const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  profile_picture: {
    type: DataTypes.STRING,
    allowNull: true, 
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
   
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique : true,
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  mobile_no: {
    type: DataTypes.STRING,
    allowNull: true,
    unique : true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_paid_member: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  is_active:{
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue : true,
  },
  is_block:{
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue : false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user',
  timestamps: false, 
});

module.exports = User;