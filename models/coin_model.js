const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { months } = require('moment');

const CoinModel = sequelize.define('CoinModel', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    plan_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    join_date :{
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW,
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'coin',
    timestamps: false,
});


module.exports = CoinModel;