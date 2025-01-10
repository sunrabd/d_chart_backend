const express = require('express');
const router = express.Router();
const globalNotificationController = require('../controllers/global_notification_controller');

router.get('/',authenticateToken, globalNotificationController.getAllNotifications);

router.post('/',authenticateToken, globalNotificationController.createNotificationForAllUsers);

router.put('/:id',authenticateToken, globalNotificationController.updateNotificationVisibility);

router.delete('/:id',authenticateToken, globalNotificationController.deleteNotification);

router.patch('/notification',authenticateToken, globalNotificationController.updateShowGlobalNotifications);

module.exports = router;