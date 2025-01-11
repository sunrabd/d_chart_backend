const express = require('express');
const router = express.Router();
const { createPayment2 } = require('../utils/skillpay_payment');
const { getSkillPaymentDetails } = require('../utils/webhook_controller');

// Define the route
router.post('/skill-pay', async (req, res) => {
    try {
        const { order_id, amount, customerReferenceNumber, customer_name, customer_mobile, customer_email, paymentType, date, userId } = req.body;

        const paymentResponse = await createPayment2(
            order_id,
            amount,
            customerReferenceNumber,
            customer_name,
            customer_mobile,
            customer_email,
            paymentType,
            date,
            userId
        );

        res.status(200).json(paymentResponse);
    } catch (error) {
        res.status(500).json({ status: false, message: 'Payment creation failed', error: error.message });
    }
});

// webhooks routes

router.post('/webhook', getSkillPaymentDetails);

module.exports = router;

