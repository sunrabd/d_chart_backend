const express = require('express');
const { verifyOtp } = require('../controllers/otp_verify_controller');

const router = express.Router();

router.post('/verify-otp', verifyOtp);

module.exports = router;