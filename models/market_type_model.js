const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const GameType = require('./game_type_model');

const MarketType = sequelize.define('MarketType', {
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
   start_time :{
    type: DataTypes.STRING,
    allowNull: true,
   },
    open_close_time :{
    type: DataTypes.STRING,
    allowNull: true,
   },
   close_close_time :{
    type: DataTypes.STRING,
    allowNull: true,
   },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  color :{
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: '0xFFFFFFFF',
  },
  jodi_url :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  jodi_background :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  pannel_background :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  pannel_url :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  is_selected :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  is_loading :{
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'market_type',
  timestamps: false, 
}); 

MarketType.hasMany(GameType, { foreignKey: 'market_type_id', as: 'gameTypes' });
GameType.belongsTo(MarketType, { foreignKey: 'market_type_id', as: 'marketType' });


module.exports = MarketType;