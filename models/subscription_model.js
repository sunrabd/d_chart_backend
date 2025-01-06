const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

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
    amount: {
        type: DataTypes.STRING,
        allowNull: true,
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