const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user_model'); 
const SubscriptionModel = require('./subscription_model');

const SubscriptionHistoryModel = sequelize.define('SubscriptionHistoryModel', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  subscription_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: SubscriptionModel,
      key: 'id',
    },
},
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
    field: 'updated_at',
  }
}, {
  tableName: 'subscription_history',
  timestamps: true,
});

// Define associations
SubscriptionHistoryModel.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});                      

SubscriptionHistoryModel.belongsTo(SubscriptionModel, {
  foreignKey: 'subscription_id',
  as: 'subscription',
});

module.exports = SubscriptionHistoryModel;