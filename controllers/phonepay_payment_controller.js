const axios = require('axios');
const crypto = require('crypto');
const PaymentModel = require('../models/phonepay_payment_model');
require('dotenv').config();

// Replace these with your .env or actual values
const MERCHANT_ID = (process.env.MERCHANT_ID || 'M22S12Q88H8M2').trim();
const SALT_KEY = (process.env.SALT_KEY || 'dab3e7a7-ac23-4d0e-b96f-c78d58e397b2').trim();
const SALT_INDEX = (process.env.SALT_INDEX || '1').trim();
const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

console.log(`MERCHANT_ID *** :- ${MERCHANT_ID}`);
console.log(`SALT_KEY *** :- ${SALT_KEY}`);
console.log(`SALT_INDEX *** :- ${SALT_INDEX}`);

// Generate signature

function generateSignature(payload, path) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToSign = `${encoded}${path}${SALT_KEY}`;
    const signature = crypto.createHash('sha256').update(stringToSign).digest('hex');
    return { encoded, signature };
}

exports.initiatePayment = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || isNaN(amount)) {
            return res.status(400).json({ status: false, message: "Amount is required and must be a number" });
        }

        const MERCHANT_ID = process.env.MERCHANT_ID;
        const SALT_KEY = process.env.SALT_KEY;
        const SALT_INDEX = process.env.SALT_INDEX || '1';
        const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';

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
                type: 'PAY_PAGE'
            }
        };

        const base64Body = Buffer.from(JSON.stringify(payload)).toString('base64');
        const stringToSign = base64Body + '/pg/v1/pay' + SALT_KEY;
        const hash = crypto.createHash('sha256').update(stringToSign).digest('hex');
        const signature = `${hash}###${SALT_INDEX}`;

        const response = await axios.post(`${PHONEPE_BASE_URL}/pg/v1/pay`, {
            request: base64Body,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': signature,
                'X-MERCHANT-ID': MERCHANT_ID
            }
        });

        if (response.data.success) {
            const paymentUrl = response.data.data.instrumentResponse.redirectInfo.url;

            await PaymentModel.create({
                transaction_id: transactionId,
                amount: amount * 100,
                response: response.data,
            });

            return res.status(200).json({
                status: true,
                message: 'Payment initiated successfully',
                payment_url: paymentUrl
            });
        } else {
            return res.status(500).json({
                status: false,
                message: 'Payment failed',
                error: response.data
            });
        }

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

// new api
exports.createPaymenPhonpe = async (req, res) => {
    function generatePhonePeChecksum(payload, SALT_KEY, SALT_INDEX) {
        const base64Body = Buffer.from(JSON.stringify(payload)).toString('base64');
        const stringToHash = base64Body + '/pg/v1/pay' + SALT_KEY;
        const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        return { base64Body, checksum: `${hash}###${SALT_INDEX}` };
    }
    try {
        const {orderId,merchantUserId,amount,REDIRECT_URL,CALLBACK_URL } = req.body;
        const MERCHANT_ID = 'M22S12Q88H8M2';
        const SALT_KEY = 'dab3e7a7-ac23-4d0e-b96f-c78d58e397b2';
        // let amount = 10;
        // const MERCHANT_ID = "SUNRATECHUAT";
        // const SALT_KEY = "b27f5732-ca35-419f-8710-c142b71a9b5b";
        // const REDIRECT_URL = "https://api.king999.cloud/app/deposit/sucesspage";
        //const REDIRECT_URL = "https://sunrasofttech.com/";
        // const CALLBACK_URL = "https://api.king999.cloud/payment/callbackPayment/phonepecallback";
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: orderId,
            merchantUserId: merchantUserId,
            amount: amount * 100,
            redirectUrl: REDIRECT_URL,
            redirectMode: 'POST',
            callbackUrl: CALLBACK_URL,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const { base64Body, checksum } = generatePhonePeChecksum(payload, SALT_KEY, '1');

        const BASE_URL = 'https://api.phonepe.com/apis/hermes';
        //const BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox';
        const response = await axios.post(`${BASE_URL}/pg/v1/pay`, { "request": base64Body }, {
            headers: {
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': MERCHANT_ID
            }
        });
        if (response.data.success) {
            const phonePeData = response.data.data;
            // const payment = await PaymentData.create(
            //     {
            //         transactionId: phonePeData.merchantTransactionId,
            //         paymentMethod: 'UPI_VIP',
            //         userId: userId,
            //         amount: amount,
            //         paymentType: paymentType,
            //         date: date,
            //         status: 'initilalized',
            //         clientId: phonePeData.merchantTransactionId,
            //         customer_reference_number: order_id
            //     }
            // )
            // console.log(true);
            res.json({ status: true, data: phonePeData });
        }
    } catch (error) {
        console.log({ 'error': error.response });
        return { status: false, message: "something went wrong" };
    }
}