const express = require('express');
const router = express.Router();
const globalNotificationController = require('../controllers/global_notification_controller');

router.get('/', globalNotificationController.getAllNotifications);

router.get('/:id', globalNotificationController.getNotificationById);

router.post('/', globalNotificationController.createNotification);

router.put('/:id', globalNotificationController.updateNotification);

router.delete('/:id', globalNotificationController.deleteNotification);

module.exports = router;
