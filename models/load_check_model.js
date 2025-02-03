const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const MarketType = require('./market_type_model');
const User = require('./user_model');

const CheckLoad = sequelize.define('CheckLoad', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  //  MarketType data 
  market_type: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'market_type',
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'user',
      key: 'id',
    },
  },
  // open part
  open_digit: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  open_digit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  open_digit_decrement_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  open_digit_amount :{
    type: DataTypes.STRING,
    allowNull: true,
  },

  // close part
  close_digit: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  close_digit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  close_digit_decrement_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  close_digit_amount :{
    type: DataTypes.STRING,
    allowNull: true,
  },

  // jodi part 
  jodi_digit: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  jodi_digit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  jodi_digit_decrement_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  jodi_digit_amount :{
    type: DataTypes.STRING,
    allowNull:true,
  },

  // open panna part
  open_panna_digit: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  open_panna_digit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  open_panna_decrement_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  open_panna_amount :{
    type: DataTypes.STRING,
    allowNull: true,
  },

  // close panna part
  close_panna_digit: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  close_panna_digit_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
   close_panna_decrement_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  close_panna_amount_count :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'laod_check',
  timestamps: false,
});

CheckLoad.belongsTo(MarketType, { foreignKey: 'market_type', as: 'marketType' });
CheckLoad.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = CheckLoad;
