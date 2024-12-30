const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GameType = sequelize.define('GameType', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
   icon :{
    type: DataTypes.STRING,
    allowNull: true,
   },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  
}, {
  tableName: 'game_type',
  timestamps: false, 
});

module.exports = GameType;