const express = require('express');
const router = express.Router();
const paymentFailedController = require('../controllers/payment_failed_controller');
const { authenticateToken } = require('../middleware/auth_middelware');

router.post('/payment-failed',authenticateToken, paymentFailedController.createPaymentFailed);
router.post('/payment-failed/get',authenticateToken, paymentFailedController.getAllPaymentFailed);
router.post('/payment-failed/:id',authenticateToken, paymentFailedController.getPaymentFailedById);
router.post('/payment-failed/user/:userId',authenticateToken, paymentFailedController.getPaymentFailedByUser);
router.put('/payment-failed/:id',authenticateToken, paymentFailedController.updatePaymentFailed);
router.delete('/payment-failed/:id',authenticateToken, paymentFailedController.deletePaymentFailed);

module.exports = router;
