const axios = require('axios');
const crypto = require('crypto');
// const PaymentModel = require('../models/phonepay_payment_model');
const PhonePayWebhookUrl = require('../models/phonepay_webhook_url_model');
require('dotenv').config();

// Replace these with your .env or actual values
const MERCHANT_ID = (process.env.MERCHANT_ID || 'M22S12Q88H8M2').trim();
const SALT_KEY = (process.env.SALT_KEY || 'dab3e7a7-ac23-4d0e-b96f-c78d58e397b2').trim();
const SALT_INDEX = (process.env.SALT_INDEX || '1').trim();
const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

console.log(`MERCHANT_ID *** :- ${MERCHANT_ID}`);
console.log(`SALT_KEY *** :- ${SALT_KEY}`);
console.log(`SALT_INDEX *** :- ${SALT_INDEX}`);

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

// new api
exports.createPaymenPhonpe = async (req, res) => {
    function generatePhonePeChecksum(payload, SALT_KEY, SALT_INDEX) {
        const base64Body = Buffer.from(JSON.stringify(payload)).toString('base64');
        const stringToHash = base64Body + '/pg/v1/pay' + SALT_KEY;
        const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        return { base64Body, checksum: `${hash}###${SALT_INDEX}` };
    }
    try {
        const { orderId, merchantUserId, amount, REDIRECT_URL, CALLBACK_URL } = req.body;
        const MERCHANT_ID = 'M22S12Q88H8M2';
        const SALT_KEY = 'dab3e7a7-ac23-4d0e-b96f-c78d58e397b2';
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: orderId,
            merchantUserId: merchantUserId,
            amount: amount * 100,
            redirectUrl: REDIRECT_URL,
            redirectMode: 'POST',
            callbackUrl: 'https://dchart.site/api/dchart/phone-pay/webhook',
            paymentInstrument: {
                type: 'PAY_PAGE'
            },

        };

        const { base64Body, checksum } = generatePhonePeChecksum(payload, SALT_KEY, '1');

        const BASE_URL = 'https://api.phonepe.com/apis/hermes';
        const response = await axios.post(`${BASE_URL}/pg/v1/pay`, { "request": base64Body }, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': MERCHANT_ID
            }
        });
        if (response.data.success) {
            const phonePeData = response.data.data;
            const url = response.data.data?.instrumentResponse?.redirectInfo?.url;
            if (url) {
                await PhonePayWebhookUrl.create({
                    transaction_id: phonePeData.merchantTransactionId,
                    amount: amount,
                    orderId: orderId,
                    status: "success",
                    REDIRECT_URL: REDIRECT_URL,
                    CALLBACK_URL: CALLBACK_URL
                });
                return res.json({ status: true, url });

            } else {
                return res.status(500).json({ status: false, message: "Something went wrong", error: error.message });
            }
        } else {
            return res.status(500).json({ status: false, message: "Something went wrong", error: error.message });
        }
    } catch (error) {
        console.log({ 'error': error.response });
        return { status: false, message: "something went wrong" };
    }
}

exports.getUrl = async (req, res) =>{
    let varia = encodeURIComponent(req.query.url);
    res.redirect(varia);
}

exports.phonePeWebhook = async (req, res) => {
    try {
        const webhookData = req.body;
        console.log(`******************${webhookData}`);

        // const data = await PhonePayWebhookUrl.findAll({
        //     where
        //     order: [['createdAt', 'DESC']]
        // });

        const forwardingResponse = await axios.post(
            'https://api.stgame.in/payment/callbackPayment/forwarding/bospayPayment',
            webhookData,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json({ success: true, data: forwardingResponse.data });
    } catch (err) {
        console.error("❌ Webhook Error:", err);
        return res.status(500).json({ success: false });
    }
};