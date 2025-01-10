const GlobalNotification = require('../models/global_notification_model');
const User = require('../models/user_model');
const upload = require('../middleware/upload')
// Get all global notifications with user details
exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await GlobalNotification.findAll({});
        res.status(200).json({
            status: true,
            message: "Get all notifications successfully",
            data: notifications,
        });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch notifications', error });
    }
};

// Update is_visible for a particular user and notification
exports.updateNotificationVisibility = async (req, res) => {
    try {
        const notification = await GlobalNotification.findByPk(req.params.id);

        if (!notification) {
            return res.status(404).json({ 
                status: false, 
                message: 'Notification not found' 
            });
        }

        await notification.update(req.body);

        res.status(200).json({
            status: true,
            message: "Notification visibility updated successfully",
            data: notification,
        });
    } catch (error) {
        console.error('Error in updateNotificationVisibility:', error);
        res.status(500).json({ 
            status: false, 
            message: 'Failed to update notification visibility', 
            error 
        });
    }
};

exports.updateShowGlobalNotifications = async (req, res) => {
    try {
        const [updated] = await User.update(
            { show_global_notifications: false },
            { where: { show_global_notifications: true } }
        );

        res.status(200).json({
            status: true,
            message: `${updated} users' show_global_notifications updated to false.`,
        });
    } catch (error) {
        console.error('Error updating show_global_notifications:', error);
        res.status(500).json({
            status: false,
            message: 'Failed to update show_global_notifications for users.',
            error: error.message,
        });
    }
};

exports.createNotificationForAllUsers = async (req, res) => {
    const uploadSingle = upload.single('img');

    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, message: err.message });
        }

        const { title, description, is_visible } = req.body;
        const img = req.file ? `/uploads/${req.file.filename}` : null;

        try {
            const newNotification = await GlobalNotification.create({
                img,
                title,
                description,
                is_visible,
            });

            res.status(201).json({
                status: true,
                message: 'Notification created successfully',
                data: newNotification,
            });
        } catch (error) {
            console.error('Error in createGlobalNotification:', error);
            res.status(500).json({ status: false, message: 'Error creating notification', error: error.message });
        }
    });
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
