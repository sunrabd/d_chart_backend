const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user_model');
const Subscription = require('./subscription_model');
const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: 'id',
    },
  },
  mobile : {
    type: DataTypes.STRING,
    allowNull: true,
  },
  transactionType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  subscriptionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_cupon_applied :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue : false,
  },
  status :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue : false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
  },

}, {
  tableName: 'transaction',
  timestamps: false,
});

Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
// Transaction.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscr' });

module.exports = Transaction;

