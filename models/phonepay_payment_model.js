const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PhonePayPayments = sequelize.define('PhonePayPayments', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    transaction_id: { // merchantTransactionId
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    clientId: { // same as merchantTransactionId
        type: DataTypes.STRING,
        allowNull: true,
    },
    merchantTransactionId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    customer_reference_number: { // orderId
        type: DataTypes.STRING,
        allowNull: true,
    },
    response: {
        type: DataTypes.JSON,
        allowNull: true,
    }
}, {
    tableName: 'phonepe_payment',
    timestamps: true,
});

module.exports = PhonePayPayments;
