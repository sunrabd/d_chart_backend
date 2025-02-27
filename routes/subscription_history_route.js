const express = require('express');
const router = express.Router();
const subscriptionHistoryController = require('../controllers/subscription_history_controller');
const { authenticateToken } = require('../middleware/auth_middelware');

router.post('/create',authenticateToken, subscriptionHistoryController.createSubscriptionHistory);

router.post('/user/:userId',authenticateToken, subscriptionHistoryController.getSubscriptionHistoryByUser);

router.put('/update/:id',authenticateToken, subscriptionHistoryController.updateSubscriptionHistory);

router.post('/get',authenticateToken, subscriptionHistoryController.getAllSubscriptionHistory);

module.exports = router;