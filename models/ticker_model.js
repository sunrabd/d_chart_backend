const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user_model'); 
const SubscriptionModel = require('./subscription_model');

const Ticker = sequelize.define('Ticker', {
   id :{
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
   },
   title :{
    type: DataTypes.STRING,
    allowNull: true,
   },
   link :{
    type: DataTypes.STRING,
    allowNull: true,
   },
   background_color :{
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '0xFF000000',
   },
   text_color :{
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '0xFFFFFFFF',
   },
   link_color :{
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '0xFFFFFFFF',
   },

  createdAt: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ticker',
  timestamps: true,
});


module.exports = Ticker;