const express = require('express');
const router = express.Router();
const subscriptionHistoryController = require('../controllers/subscription_history_controller');

router.post('/create', subscriptionHistoryController.createSubscriptionHistory);

router.get('/user/:userId', subscriptionHistoryController.getSubscriptionHistoryByUser);

router.put('/update/:id', subscriptionHistoryController.updateSubscriptionHistory);

router.get('/', subscriptionHistoryController.getAllSubscriptionHistory);

module.exports = router;