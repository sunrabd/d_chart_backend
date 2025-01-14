// Required modules
const express = require('express');
const dotenv = require('dotenv');
const crypto = require('crypto');
const axios = require('axios');
const moment = require('moment-timezone');
const User = require('../models/user_model');
const PaymentData = require('../models/payment_data_model');
const ServerLog = require('../models/server_log_model');

dotenv.config();

const app = express();
const router = express.Router();

app.use(express.json());

exports.getSkillPaymentDetails = async (req, res) => {
    const { AuthID, respData } = req.body;
   const resonseData=  JSON.stringify(req.body);
   const dataVaule = await ServerLog.create({ encodedResponse : resonseData });
   console.log(`dataVaule******* = ${dataVaule}`);
    
    const AUTH_KEY = process.env.AuthKey;
    const IV = AUTH_KEY.substring(0, 16);

    console.log('Processing payment details webhook.');



    try {
        // Validate respData
        if (!respData) {
            console.error("Missing respData in request body");
            return res.status(400).json({ error: "Missing respData in request body" });
        }

        // Decrypt and parse respData
        const formattedRespData = respData.replace(/ /g, '+');
        const decryptedData = decryptData(formattedRespData, AUTH_KEY, IV);
        const parsedResponse = JSON.parse(decryptedData);
        const { CustRefNum, payStatus, resp_code, resp_message } = parsedResponse;

        const encodedResponse = JSON.stringify(parsedResponse);
        const serverLog = await ServerLog.create({ encodedResponse : encodedResponse });
        console.log("Server log saved successfully.");


        // Log the parsed response
        console.log("Parsed Response:", parsedResponse);

        // Fetch payment data by order ID
        const paymentRecord = await PaymentData.findOne({
            where: { order_id: CustRefNum },
        });

        if (!paymentRecord) {
            console.error(`No payment record found for Order ID: ${CustRefNum}`);
            return res.status(404).json({ error: "Payment record not found" });
        }

        if (paymentRecord.status === "success" || paymentRecord.status === "failure") {
            console.log(`Payment already processed for Order ID: ${CustRefNum}`);
            return res.status(200).json({ 
                status: false, 
                msg: "Payment already processed" 
            });
        }

        if (payStatus === "Ok" && resp_code === "00000") {
            console.log("Payment successful.");

            await User.update(
                { is_paid_member: true },
                { where: { id: paymentRecord.userId } }
            );

            await PaymentData.update(
                { status: "success" },
                { where: { order_id: CustRefNum } }
            );

            console.log(`Payment marked as success for Order ID: ${CustRefNum}`);
        } else {
            console.error(`Payment failed for Order ID: ${CustRefNum}. Reason: ${resp_message}`);

            await PaymentData.update(
                { status: "failure" },
                { where: { order_id: CustRefNum } }
            );
        }

        
        return res.status(200).json({
            status: true,
            msg: "Payment data processed successfully",
            data: serverLog,
        });

    } catch (error) {
        console.error("Error processing payment callback:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

function decryptData(encryptedData, key, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
    let decrypted = decipher.update(encryptedData, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
