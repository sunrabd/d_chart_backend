const express = require('express');
const router = express.Router();
const globalNotificationController = require('../controllers/global_notification_controller');

router.get('/', globalNotificationController.getAllNotifications);

router.post('/', globalNotificationController.createNotificationForAllUsers);

router.put('/:id', globalNotificationController.updateNotificationVisibility);

router.delete('/:id', globalNotificationController.deleteNotification);

router.patch('/notification', globalNotificationController.updateShowGlobalNotifications);

module.exports = router;