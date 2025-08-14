const express = require('express');
const { body } = require('express-validator');
const {getabcgatewayPaymentDetails,createDepositAbcGateway} = require('../controllers/payment_callback_controller');

const router = express.Router();

// Validation middleware for deposit creation
const depositValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('Invalid User ID format'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number')
    .custom((value) => {
      if (parseFloat(value) > 100000) {
        throw new Error('Amount cannot exceed 100,000');
      }
      return true;
    })
];

// Routes
router.post('/webhooks/payment', getabcgatewayPaymentDetails);
router.post('/createpayment', depositValidation, createDepositAbcGateway);



module.exports = router;