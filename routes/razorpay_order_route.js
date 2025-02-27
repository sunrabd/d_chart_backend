const express = require("express");
const { createOrder } = require("../controllers/razorpay_order_controller");
const { authenticateToken } = require('../middleware/auth_middelware');

const router = express.Router();

router.post("/create-order",authenticateToken, createOrder);

module.exports = router;
