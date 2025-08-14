// PaymentData Model
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');


const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  response: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'payments',
  timestamps: true
});


module.exports = Payment;