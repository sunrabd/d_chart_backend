const SubscriptionHistoryModel = require('../models/subscription_history_model');
const { Op } = require('sequelize');
const SubscriptionModel = require('../models/subscription_model');
const User = require('../models/user_model');

// Create subscription history
exports.createSubscriptionHistory = async (req, res) => {
  try {
    const { userId, subscription_id, start_date, end_date } = req.body;

    if (!userId || !subscription_id) {
      return res.status(400).json({ status: false, message: 'User ID and  Subscription ID are required.' });
    }

    const newHistory = await SubscriptionHistoryModel.create({
      userId,
      subscription_id,
      start_date,
      end_date: end_date || null,
    });

    res.status(201).json({ status: true, message: 'Subscription history created successfully', data: newHistory });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error creating subscription history', error: error.message });
  }
};

// Get all subscription history for a user
exports.getSubscriptionHistoryByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const history = await SubscriptionHistoryModel.findAll({
      where: {
        userId,
      },
      include: [
        {
          model:SubscriptionModel,
          as: 'subscription',
        },
      ],
      order: [['start_date', 'DESC']],
    });

    if (history.length === 0) {
      return res.status(404).json({ status: false, message: 'No subscription history found for this user.' });
    }

    res.status(200).json({ status: true, message: 'Subscription history retrieved successfully', data: history });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving subscription history', error: error.message });
  }
};

exports.updateSubscriptionHistory = async (req, res) => {
  const { id } = req.params;
  const { end_date } = req.body;

  try {
    const history = await SubscriptionHistoryModel.findByPk(id);

    if (!history) {
      return res.status(404).json({ status: false, message: 'Subscription history not found.' });
    }

    if (end_date) {
      await history.update({ end_date });
      res.status(200).json({ status: true, message: 'Subscription history updated successfully', data: history });
    } else {
      res.status(400).json({ status: false, message: 'End date is required for update.' });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error updating subscription history', error: error.message });
  }
};


exports.getAllSubscriptionHistory = async (req, res) => {
  try {
    const history = await SubscriptionHistoryModel.findAll({
      include: [
        {
          model:SubscriptionModel,
          as: 'subscription',
        },
        {
          model:User,
          as: 'user',
        },
      ],
      order: [['start_date', 'DESC']],
    });

    if (history.length === 0) {
      return res.status(404).json({ status: false, message: 'No subscription history found.' });
    }

    res.status(200).json({ status: true, message: 'All subscription history retrieved successfully', data: history });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving subscription history', error: error.message });
  }
};