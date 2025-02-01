const express = require('express');
const router = express.Router();
const paymentFailedController = require('../controllers/payment_failed_controller');

router.post('/payment-failed', paymentFailedController.createPaymentFailed);
router.get('/payment-failed', paymentFailedController.getAllPaymentFailed);
router.get('/payment-failed/:id', paymentFailedController.getPaymentFailedById);
router.get('/payment-failed/user/:userId', paymentFailedController.getPaymentFailedByUser);
router.put('/payment-failed/:id', paymentFailedController.updatePaymentFailed);
router.delete('/payment-failed/:id', paymentFailedController.deletePaymentFailed);

module.exports = router;
