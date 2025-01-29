const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user_model');

const CoinTransaction = sequelize.define('CoinTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  transaction_type: {
    type: DataTypes.ENUM('increase', 'deduct'),
    allowNull: false,
  },
  coins: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'coin_transactions',
  timestamps: true,
});

CoinTransaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = CoinTransaction;
