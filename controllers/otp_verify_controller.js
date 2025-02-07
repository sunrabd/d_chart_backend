const axios = require('axios');
require('dotenv').config();

exports.verifyOtp = async (req, res) => {
  const { phoneNumber, otp} = req.body;

  if (!phoneNumber || !otp) {
    return res.status(400).json({ status: false, message: "Mobile number, OTP, and session ID are required" });
  }

  try {
    const apiKey = process.env.API_KEY;
    const verifyUrl = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY3/${phoneNumber}/${otp}`;

    const otpResponse = await axios.get(verifyUrl);

    if (otpResponse.data.Status === 'Success') {
      res.status(200).json({ status: true, message: "OTP verified successfully" });
    } else {
      res.status(400).json({ status: false, message: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: "Error verifying OTP", error: error.message });
  }
};
