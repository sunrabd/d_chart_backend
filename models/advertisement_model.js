const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Advertisement = sequelize.define('Advertisement', {
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
  yt_url :{
    type: DataTypes.STRING,
    allowNull: true,
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
  tableName: 'advertisement',
  timestamps: false, 
});

module.exports = Advertisement;