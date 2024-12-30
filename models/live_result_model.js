  const { DataTypes } = require('sequelize');
  const { sequelize } = require('../config/db');
  const MarketType = require('./market_type_model');


  const LiveResult = sequelize.define('LiveResult', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    market_type: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'market_type',
        key: 'id',
      },
    },
    open_panna:{
      type: DataTypes.STRING,
      allowNull: true,
    },
      open_result :{
      type: DataTypes.STRING,
      allowNull: true,
    },
    close_panna: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    close_result: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jodi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    day:{
      type: DataTypes.STRING,
      allowNull: true,
    },
    date :{
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'live_result',
    timestamps: false, 
  });

  // Define associations
  LiveResult.belongsTo(MarketType, { foreignKey: 'market_type', as: 'marketType' });

  module.exports = LiveResult;