const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const SubscriptionModel = require('./subscription_model');
const GlobalNotificationModel = require('./global_notification_model');

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
    unique: true,
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
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
    unique: true,
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
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
  
  expiry_date :{
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  subscription_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: SubscriptionModel, 
      key: 'id',
    },
  },
  global_notification_id :{
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: GlobalNotificationModel,
      key: 'id',
    },
  },
  is_block: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  show_global_notifications :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  active_date:{
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
},
 {
  tableName: 'user',
  timestamps: false,
});

User.belongsTo(SubscriptionModel, {
  foreignKey: 'subscription_id',
  as: 'subscription',
});

User.belongsTo(GlobalNotificationModel, {
  foreignKey: 'global_notification_id',
  as: 'global_notification',
});

module.exports = User;