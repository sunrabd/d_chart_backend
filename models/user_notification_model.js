const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./user_model');
const GlobalNotification = require('./global_notification_model');

const UserNotification = sequelize.define('UserNotification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    is_visible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: 'user_notification',
    timestamps: false,
});

UserNotification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
UserNotification.belongsTo(GlobalNotification, { foreignKey: 'notification_id', as: 'notification' });

module.exports = UserNotification;
