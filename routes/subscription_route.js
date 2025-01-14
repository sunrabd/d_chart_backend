const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription_controller');
const { authenticateToken } = require('../middleware/auth_middelware');


router.post('/subscriptions', subscriptionController.createSubscription);

router.get('/subscriptions', subscriptionController.getAllSubscriptions);

router.get('/subscriptions/:id', subscriptionController.getSubscriptionById);

router.put('/subscriptions/:id', subscriptionController.updateSubscription);

router.delete('/subscriptions/:id', subscriptionController.deleteSubscription);

module.exports = router;
