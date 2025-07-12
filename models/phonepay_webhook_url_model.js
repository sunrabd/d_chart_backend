const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PhonePayWebhookUrl = sequelize.define('PhonePayWebhookUrl', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    orderId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    REDIRECT_URL:{
         type: DataTypes.STRING,
        allowNull: true,
    },
    CALLBACK_URL:{
        type: DataTypes.STRING,
        allowNull: true,
    },
   createdAt: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
}, {
    tableName: 'phonepay_webhook',
    timestamps: true,
});

module.exports = PhonePayWebhookUrl;
