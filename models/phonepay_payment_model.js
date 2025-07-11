const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PhonePayPayment = sequelize.define('PhonePayPayment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
    },
    response: {
        type: DataTypes.JSON,
        allowNull: true,
    }
}, {
    tableName: 'phonepe_payments',
    timestamps: true,
});

module.exports = PhonePayPayment;
