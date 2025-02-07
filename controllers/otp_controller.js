const axios = require('axios');
const OTP = require('../models/otp_model');

require('dotenv').config();

const sendOTP = async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({status:false, error: 'Phone number is required' });
    }

    const otp = new OTP(phoneNumber);
    const apiKey = process.env.API_KEY;
    const otpTemplate = process.env.OTP_TEMPLATE;
    const url = `https://2factor.in/API/V1/${apiKey}/SMS/${otp.phoneNumber}/AUTOGEN/${otpTemplate}`;

    try {
        const response = await axios.get(url);
        res.json({status: true, message: 'OTP Sent Successfully', data: response.data });
    } catch (error) {
        res.status(500).json({status:false, error: error.response ? error.response.data : error.message });
    }
};

module.exports = { sendOTP };
