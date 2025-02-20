const express = require("express");
const { createOrder } = require("../controllers/razorpay_order_controller");

const router = express.Router();

router.post("/create-order", createOrder);

module.exports = router;
