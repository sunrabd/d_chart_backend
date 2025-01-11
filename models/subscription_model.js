const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const { months } = require('moment');

const SubscriptionModel = sequelize.define('SubscriptionModel', {
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
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    amount: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    time_validation: {
        type: DataTypes.ENUM('month', 'year', 'week'),
        allowNull: false,
        bydefault:"month"
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'subscriptions',
    timestamps: false,
});


module.exports = SubscriptionModel;