const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user_model');

const PaymentData = sequelize.define('PaymentData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failure'),
    allowNull: false,
    defaultValue: 'pending',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
  },
  subscriptionId :{
    type: DataTypes.STRING,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'payment_data',
  timestamps: false,
});

// Association
PaymentData.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// (async () => {
//   try {
//     await sequelize.sync({ alter: true });
//     console.log('PaymentData table synced successfully.');
//   } catch (error) {
//     console.error('Error syncing PaymentData table:', error);
//   }
// })();

// PaymentData.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = PaymentData;