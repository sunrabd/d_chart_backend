const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ServerLog = sequelize.define('ServerLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  encodedResponse :{
    type : DataTypes.JSON,
    allowNull :false,
  }
}, {
  tableName: 'server-log',
  timestamps: false, 
});

module.exports = ServerLog;