const express = require('express');
const router = express.Router();
const { createPayment2 } = require('../utils/skillpay_payment');
const { getSkillPaymentDetails } = require('../utils/webhook_controller');


// Define the route
router.post('/skill-pay', async (req, res) => {
    try {
        const { amount, customer_mobile, customer_email, order_id, userId, subscriptionId} = req.body;
     
        const paymentResponse = await createPayment2(
            order_id,
            amount,
            customer_mobile,
            customer_email,
            userId,
            subscriptionId
        );
        console.log(`new reqqqqqqqqqqqqqqq ${userId}`);
        res.status(200).json(paymentResponse);
    } catch (error) {
        res.status(500).json({ status: false, message: 'Payment creation failed', error: error.message });
    }
});

// webhooks routes

router.post('/webhook', getSkillPaymentDetails);

module.exports = router;

