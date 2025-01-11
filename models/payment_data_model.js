const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user_model');

const PaymentData = sequelize.define('PaymentData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failure'),
    allowNull: false,
    defaultValue: 'pending',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'payment_data',
  timestamps: false,
});

PaymentData.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = PaymentData;