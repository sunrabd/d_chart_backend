const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const GlobalNotification = sequelize.define('GlobalNotification', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_visible: {
       type: DataTypes.STRING,
        allowNull: false,
        defaultValue : false
    },
    createdAt: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'global-notification',
    timestamps: false,
});

module.exports = GlobalNotification;
