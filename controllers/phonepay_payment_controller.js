const axios = require('axios');
const crypto = require('crypto');
const PaymentModel = require('../models/phonepay_payment_model');
require('dotenv').config();

// Replace these with your .env or actual values
const MERCHANT_ID = process.env.MERCHANT_ID || 'M22S12Q88H8M2';
const SALT_KEY = process.env.SALT_KEY || 'dab3e7a7-ac23-4d0e-b96f-c78d58e397b2';
const SALT_INDEX = process.env.SALT_INDEX || '1';
const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

// Generate signature
function generateSignature(payload, path) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToSign = `${encoded}/pg/v1/pay${SALT_KEY}`;
    const signature = crypto.createHash('sha256').update(stringToSign).digest('hex');
    return { encoded, signature };
}

// Initiate Payment
exports.initiatePayment = async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount)) {
            return res.status(400).json({ status: false, message: "Amount is required and must be a number" });
        }

        const transactionId = `TXN_${Date.now()}`;
        const redirectUrl = `https://dchart.site/success`;
        const callbackUrl = `https://dchart.site/api/dchart/phone-pay/webhook`;

        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: 'user123',
            amount: amount * 100,
            redirectUrl,
            redirectMode: 'REDIRECT',
            callbackUrl,
            paymentInstrument: {
                type: 'PAY_PAGE',
            }
        };

        const { encoded, signature } = generateSignature(payload, '/pg/v1/pay');

        const response = await axios.post(`${PHONEPE_BASE_URL}/pg/v1/pay`, {
            request: encoded,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': `${signature}###${SALT_INDEX}`,
                'X-MERCHANT-ID': MERCHANT_ID,
            }
        });

        // Save transaction
        await PaymentModel.create({
            transaction_id: transactionId,
            amount: amount * 100,
            response: response.data,
        });

        return res.status(200).json({
            status: true,
            message: 'Payment initiated successfully',
            payment_url: response.data.data.instrumentResponse.redirectInfo.url
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Payment initiation failed',
            error: error?.response?.data || error.message,
        });
    }
};

// Check Payment Status
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { transaction_id } = req.query;

        if (!transaction_id) {
            return res.status(400).json({ status: false, message: "transaction_id is required" });
        }

        const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${transaction_id}${SALT_KEY}`;
        const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');

        const response = await axios.get(`${PHONEPE_BASE_URL}/pg/v1/status/${MERCHANT_ID}/${transaction_id}`, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': `${hash}###${SALT_INDEX}`,
                'X-MERCHANT-ID': MERCHANT_ID
            }
        });

        // Update DB
        const payment = await PaymentModel.findOne({ where: { transaction_id } });
        if (payment) {
            payment.status = response.data.data.status || 'UNKNOWN';
            payment.response = response.data;
            await payment.save();
        }

        return res.status(200).json({
            status: true,
            message: 'Payment status fetched',
            data: response.data,
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Failed to fetch payment status',
            error: error?.response?.data || error.message,
        });
    }
};

// Handle PhonePe Webhook
exports.handleWebhook = async (req, res) => {
    try {
        const { merchantTransactionId, code, data } = req.body;

        if (!merchantTransactionId) {
            return res.status(400).json({ status: false, message: 'Missing merchantTransactionId' });
        }

        const payment = await PaymentModel.findOne({ where: { transaction_id: merchantTransactionId } });
        if (!payment) {
            return res.status(404).json({ status: false, message: 'Payment not found' });
        }

        payment.status = code === 'PAYMENT_SUCCESS' ? 'SUCCESS' : 'FAILED';
        payment.response = req.body;
        await payment.save();

        return res.status(200).json({ status: true, message: 'Webhook received' });

    } catch (err) {
        return res.status(500).json({ status: false, message: 'Webhook error', error: err.message });
    }
};
