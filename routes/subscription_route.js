const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription_controller');

router.post('/subscriptions',authenticateToken, subscriptionController.createSubscription);

router.get('/subscriptions',authenticateToken, subscriptionController.getAllSubscriptions);

router.get('/subscriptions/:id',authenticateToken, subscriptionController.getSubscriptionById);

router.put('/subscriptions/:id',authenticateToken, subscriptionController.updateSubscription);

router.delete('/subscriptions/:id',authenticateToken, subscriptionController.deleteSubscription);

module.exports = router;
