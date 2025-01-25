const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const SubscriptionModel = require('./subscription_model');
const GlobalNotificationModel = require('./global_notification_model');
const AdminSetting = require('./setting_model');

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
    type: DataTypes.ENUM('admin', 'user', 'sub-admin'),
    allowNull: false,
    defaultValue: 'user',
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
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
  // refreshToken: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  // },

  is_paid_member: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  show_logout_user: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: true,
  },
  join_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  expiry_date: {
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
  global_notification_id: {
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
  show_global_notifications: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  subscriptionCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  is_free_user: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  active_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  super_coins: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
},
  {
    tableName: 'user',
    timestamps: true,
  });

User.belongsTo(SubscriptionModel, {
  foreignKey: 'subscription_id',
  as: 'subscription',
});

User.belongsTo(GlobalNotificationModel, {
  foreignKey: 'global_notification_id',
  as: 'global_notification',
});


User.beforeCreate(async (user) => {
  const adminSetting = await AdminSetting.findOne();
  if (adminSetting) {
    user.super_coins = adminSetting.signup_bonus_coin;
  }
});

module.exports = User;