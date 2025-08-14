const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Deposit = sequelize.define('Deposit', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  userBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
    defaultValue: 'PENDING'
  },
  gatewayStatus: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'deposit_2',
  timestamps: true
});

// Static methods
Deposit.findDepositById = async function(id) {
  return await this.findByPk(id);
};

Deposit.updatePaymentStatus = async function(transactionId, paymentStatus, gatewayStatus) {
  return await this.update(
    { 
      paymentStatus: paymentStatus,
      gatewayStatus: gatewayStatus 
    },
    { where: { transactionId: transactionId } }
  );
};

module.exports = Deposit;