const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AddVideo = sequelize.define('AddVideo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  video:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  
}, {
  tableName: 'video',
  timestamps: false, 
});

module.exports = AddVideo;