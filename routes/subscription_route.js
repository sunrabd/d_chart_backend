const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription_controller');
const { authenticateToken } = require('../middleware/auth_middelware');


router.post('/subscriptions',authenticateToken, subscriptionController.createSubscription);

router.post('/subscriptions/get',authenticateToken, subscriptionController.getAllSubscriptions);

router.post('/subscriptions/:id',authenticateToken, subscriptionController.getSubscriptionById);

router.put('/subscriptions/:id',authenticateToken, subscriptionController.updateSubscription);

router.delete('/subscriptions/:id',authenticateToken, subscriptionController.deleteSubscription);

module.exports = router;
