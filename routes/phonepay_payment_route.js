const express = require('express');
const router = express.Router();
const controller = require('../controllers/phonepay_payment_controller');

router.post('/initiate', controller.createPaymenPhonpe);
router.post('/webhook', controller.phonePeWebhook);
router.get('/status', controller.checkPaymentStatus);
router.get('/check',controller.getUrl);
// router.post('/webhook', controller.handleWebhook);


module.exports = router;
