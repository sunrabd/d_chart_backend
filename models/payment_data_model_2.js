// PaymentData Model
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentData = sequelize.define('PaymentData', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    paymentType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('initialized', 'success', 'failure', 'pending'),
        defaultValue: 'initialized'
    },
    clientId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    customer_reference_number: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'payment_data',
    timestamps: true
});

// Static methods
PaymentData.findOneById = async function (id) {
    return await this.findOne({ where: { clientId: id } });
};

PaymentData.updateStatusByTransactionId = async function (transactionId, status) {
    return await this.update(
        { status: status.toLowerCase() },
        { where: { clientId: transactionId } }
    );
};


module.exports =PaymentData;