const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ActiveUserAds = sequelize.define('ActiveUserAds', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_photo :{
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: true,
  },
   url :{
    type: DataTypes.STRING,
    allowNull: true,
   },
  button_text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  button_text_color: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '0xFFFFFFFF',
  },
  button_background_color:{
      type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '0xFF000000',
  },
  video :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  
}, {
  tableName: 'active_user_ads',
  timestamps: false,
});

module.exports = ActiveUserAds;