const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  discount : {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiration_date : {
    type: DataTypes.DATE,
    allowNull: true,
  },
  status :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  
}, {
  tableName: 'coupon',
  timestamps: false, 
});

module.exports = Coupon;