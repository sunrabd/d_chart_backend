const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const MarketType = require('./market_type_model');

const AiGuess = sequelize.define('AiGuess', {
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
  open_panna: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  open_result: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  close_panna: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  close_result: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  jodi: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ai_guess',
  timestamps: false,
});

AiGuess.belongsTo(MarketType, { foreignKey: 'market_type', as: 'marketType' });
module.exports = AiGuess;
