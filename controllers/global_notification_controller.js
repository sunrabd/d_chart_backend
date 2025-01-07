const GlobalNotification = require('../models/global_notification_model');

// Get all global notifications
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await GlobalNotification.findAll();
        res.status(200).json({ status: true, meassage: "get all notification successfully", data: notifications });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch notifications', error });
    }
};

// Get a single notification by ID
exports.getNotificationById = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await GlobalNotification.findByPk(id);

        if (!notification) {
            return res.status(404).json({ status: false, message: 'Notification not found' });
        }

        res.status(200).json({ status: true, meassage: "get notification successfully", data: notification });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch notification', error });
    }
};

// Create a new notification
exports.createNotification = async (req, res) => {
    try {
        const { title, description, is_visible } = req.body;

        const newNotification = await GlobalNotification.create({
            title,
            description,
            is_visible,
        });

        res.status(201).json({ status: true, message: "notification created successfully", newNotification });
    } catch (error) {
        res.status(500).json({status : false , message: 'Failed to create notification', error });
    }
};

// Update a notification by ID
exports.updateNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, is_visible } = req.body;

        const notification = await GlobalNotification.findByPk(id);

        if (!notification) {
            return res.status(404).json({status: false , message: 'Notification not found' });
        }

        notification.title = title ?? notification.title;
        notification.description = description ?? notification.description;
        notification.is_visible = is_visible ?? notification.is_visible;

        await notification.save();

        res.status(200).json({status :  notification});
    } catch (error) {
        res.status(500).json({ message: 'Failed to update notification', error });
    }
};

// Delete a notification by ID
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await GlobalNotification.findByPk(id);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        await notification.destroy();

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete notification', error });
    }
};
