const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AdminSetting = sequelize.define('AdminSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  current_version: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  admin_upi: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  admin_contact_no: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  apk: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  insta_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  youtube_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  show_subscriptions: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  show_coins: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  show_email_field :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  razorpay_key: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phonepay_key: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phonepay_pay_salt_key: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cashfree_client_secret_key: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cashfree_client_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  secret_key: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  whatsapp_channel: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  terms_and_condition: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  qrCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  privacy_policy: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  payment_type: {
    type: DataTypes.ENUM('UPI', 'RazorPay', 'Cashfree', 'PhonePe', 'SkillPay', 'NoGateway','Free'),
    allowNull: true,
    defaultValue: 'UPI',
  },

  jodiBgColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '0xFFFFCC99'
  },
  pannelBgColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '0xFFFFCC99'
  },
  jodiTextColor: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '0x000000'
  },
  ai_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  check_load_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  guessing_free: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  signup_bonus_coin: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  banner_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  interstitial_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  rewarded_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  native_id: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  about_us: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  playStore_link: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  refer_bouns_coin: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  refer_img :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  show_refer_screen: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  show_amount_checkload :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  facebook_placement_id :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  whatsapp_contact_number :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  show_otp_option :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  show_wp_otp_option :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  show_firebase_otp_option :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'admin-setting',
  timestamps: false,
});

module.exports = AdminSetting;
