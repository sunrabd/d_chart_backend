const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user_model');

const PaymentFailed = sequelize.define('PaymentFailed', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  
  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  reason :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  gateway_type: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'payment_failed',
  timestamps: false,
});

// Association
PaymentFailed.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = PaymentFailed;