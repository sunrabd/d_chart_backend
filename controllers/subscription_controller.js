const SubscriptionModel = require('../models/subscription_model');

// Create a new subscription
exports.createSubscription = async (req, res) => {
    try {
        const { plan_name, amount, time_validation , join_date } = req.body;

        if (time_validation && !['month', 'year', 'week'].includes(time_validation)) {
            return res.status(400).json({ status: false, message: 'Invalid time_validation value. Allowed values are: month, year, week.' });
        }

        const newSubscription = await SubscriptionModel.create({
            plan_name,
            amount,
            time_validation, 
            join_date
        });

        res.status(201).json({ status: true, message: 'Subscription created successfully', data: newSubscription });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error creating subscription', error: error.message });
    }
};

// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
    try {
        const subscriptions = await SubscriptionModel.findAll();
        res.status(200).json({status: true, message: 'Subscriptions retrieved successfully', data: subscriptions });
    } catch (error) {
        res.status(500).json({status: false, message: 'Error retrieving subscriptions', error: error.message });
    }
};

// Get a subscription by ID
exports.getSubscriptionById = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await SubscriptionModel.findByPk(id);
        if (!subscription) {
            return res.status(404).json({status: false, message: 'Subscription not found' });
        }
        res.status(200).json({status: true, message: 'Subscription retrieved successfully', data: subscription });
    } catch (error) {
        res.status(500).json({status: false, message: 'Error retrieving subscription', error: error.message });
    }
};

// Update a subscription
exports.updateSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const { plan_name, amount , time_validation, join_date } = req.body;
        const subscription = await SubscriptionModel.findByPk(id);

        if (!subscription) {
            return res.status(404).json({status: false, message: 'Subscription not found' });
        }

        await subscription.update({ plan_name, amount, time_validation, join_date });
        res.status(200).json({status: true, message: 'Subscription updated successfully', data: subscription });
    } catch (error) {
        res.status(500).json({status: false, message: 'Error updating subscription', error: error.message });
    }
};

// Delete a subscription
exports.deleteSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const subscription = await SubscriptionModel.findByPk(id);

        if (!subscription) {
            return res.status(404).json({status: false, message: 'Subscription not found' });
        }

        await subscription.destroy();
        res.status(200).json({status: true, message: 'Subscription deleted successfully' });
    } catch (error) {
        res.status(500).json({status: false, message: 'Error deleting subscription', error: error.message });
    }
};
