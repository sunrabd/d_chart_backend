const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user_model');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  userBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  transactionType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  withdrawMoney: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('add', 'withdraw'),
    allowNull: false,
  },
}, {
  tableName: 'transaction',
  timestamps: false,
});

Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Transaction;

