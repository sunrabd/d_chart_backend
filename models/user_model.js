const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const SubscriptionModel = require('./subscription_model');
const GlobalNotificationModel = require('./global_notification_model');
const AdminSetting = require('./setting_model');
const validator = require('validator');


const generateReferralCode = async () => {
  let code;
  do {
    code = Math.random().toString(36).substring(2, 10).toUpperCase();
  } while (await User.findOne({ where: { refer_and_earn_code: code } }));
  return code;
};

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
  is_first_time_user :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceIds: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  deviceToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  deviceTokens: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  mobile_no: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    set(value) {
      if (value && validator.isMobilePhone(value, 'any', { strictMode: false })) {
        this.setDataValue('mobile_no', value);
      } else {
        this.setDataValue('mobile_no', null);
      }
    },
    get() {
      const rawValue = this.getDataValue('mobile_no');
      if (rawValue && /^\d+$/.test(rawValue) && rawValue.length >= 5) {
        return rawValue.substring(0, 5) + '*******';
      }
      return rawValue;
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  app_version:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_paid_member: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  show_logout_user: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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
  refer_and_earn_code: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  refer_code :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_deleted :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  mobile_number_check_count :{
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  set_mobile_number_check_count :{
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
  // Generate referral code for new user
  user.refer_and_earn_code = await generateReferralCode();

  // Assign signup bonus coins from AdminSettings if available
  // const adminSetting = await AdminSetting.findOne();
  // if (adminSetting) {
  //   user.super_coins = adminSetting.signup_bonus_coin;
  // }
});

User.beforeCreate(async (user) => {
  const adminSetting = await AdminSetting.findOne();
  if (adminSetting) {
    user.super_coins = adminSetting.signup_bonus_coin;
  }
});

module.exports = User;