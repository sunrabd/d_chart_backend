// controllers/PaymentCallbackController.js
const moment = require('moment-timezone');
const User = require('../models/user_model');
const Transaction = require('../models/trasaction_model');
const Payment = require('../models/payment_model');
const Deposit = require('../models/deposite_model_2');
const PaymentData = require('../models/payment_data_model_2');
const { validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { createPaymentAbcGateway } = require('../services/paymentService');
/**
 * Handle ABC Gateway payment callback
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */

exports.getabcgatewayPaymentDetails = async (req, res) => {
    try {
        const { event_type, data } = req.body;

        // Validate event type
        if (event_type !== "PAYIN") {
            return res.status(200).json({
                status: false,
                msg: "Invalid event type",
            });
        }

        // Validate required data
        if (!data || !data.order_id || !data.status) {
            return res.status(200).json({
                status: false,
                msg: "Invalid callback data",
            });
        }

        const currentTimeIst = moment().tz("Asia/Kolkata");
        const date = currentTimeIst.format("YYYY-MM-DD HH:mm:ss");

        // Log the callback response
        const encodedResponse = JSON.stringify(req.body);
        console.log("Callback Response:", encodedResponse);

        const response = await Payment.create({
            response: encodedResponse,
            date: date
        });
        console.log("Payment Response:", response);

        // Find the payment record
        const findUserPayment = await PaymentData.findOneById(data.order_id);

        if (!findUserPayment) {
            return res.status(200).json({
                status: false,
                msg: "Payment record not found",
            });
        }

        // Check if payment is already processed
        if (findUserPayment.status === "success" || findUserPayment.status === "failure") {
            return res.status(200).json({
                status: false,
                msg: "Payment already processed",
            });
        }

        // Process payment based on status
        if (data && data.status === "success") {
            const amount = parseFloat(findUserPayment.amount);
            const userId = findUserPayment.userId;
            await User.increment(
                { balance: amount },
                { where: { id: userId } }
            );
            // Get updated user balance
            const findUser = await User.findByPk(findUserPayment.userId);

            // Create transaction record
            await Transaction.create({
                userid: findUserPayment.userId,
                amount: findUser.balance,
                ttype: "abc-payment",
                date: date,
                type: "credit",
                status:"completed",
                remark:"Fund Add"
            });

            // Update deposit status
            await Deposit.updatePaymentStatus(data.order_id, "SUCCESS", "SUCCESS");
            await PaymentData.updateStatusByTransactionId(data.order_id, "SUCCESS");

            return res.status(200).json({
                status: true,
                msg: "Payment processed successfully",
                data: {
                    transactionId: data.order_id,
                    amount: findUserPayment.amount,
                    status: "success"
                },
            });
        } else {
            // Payment failed
            await Deposit.updatePaymentStatus(data.order_id, "FAILED", "FAILED");
            await PaymentData.updateStatusByTransactionId(data.order_id, "FAILED");

            return res.status(200).json({
                status: true,
                msg: "Payment failed",
                data: {
                    transactionId: data.order_id,
                    status: "failed"
                },
            });
        }
    } catch (error) {
        console.error("Error processing payment callback:", error);
        res.status(500).json({
            status: false,
            error: "Internal server error",
            msg: "Failed to process payment callback"
        });
    }
};



exports.createDepositAbcGateway = async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        return res.status(400).json({
            status: false,
            errors: errorMessages
        });
    }

    const { userId, amount } = req.body;

    // Validate amount
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({
            status: false,
            msg: "Invalid amount"
        });
    }

    try {
        // Find user
        const user = await User.findByPk(userId);
        console.log("User found:", user);
        if (!user) {
            return res.status(404).json({
                status: false,
                msg: "User not found"
            });
        }

        // Check if user is blocked
        if (user.status === 'block') {
            return res.status(400).json({
                status: false,
                msg: "Your account is blocked"
            });
        }

        const currentTimeIst = moment().tz("Asia/Kolkata");
        const date = currentTimeIst.format("YYYY-MM-DD HH:mm:ss");
        const generateCustomerReferenceNumber = uuidv4();
        const order_id = uuidv4();

        // Create payment with ABC Gateway
        const createPaymentData = await createPaymentAbcGateway(
            order_id.substring(0, 8),
            amount,
            generateCustomerReferenceNumber.substring(0, 8),
            user.name,
            user.mobile_no,
            user.email,
            'upiMoney',
            date,
            userId
        );

        console.log("ABC Gateway response:", createPaymentData);

        if (createPaymentData.status === false) {
            return res.status(400).json({
                status: false,
                msg: createPaymentData.details?.message || "Payment initialization failed"
            });
        }

        // Create deposit record
        const newDeposit = await Deposit.create({
            userId,
            amount: parseFloat(amount),
            date,
            userBalance: user.balance,
            transactionId: createPaymentData.transaction_id,
        });

        const checkDeposit = await Deposit.findDepositById(newDeposit.id);

        const response = {
            userId: checkDeposit.userId,
            amount: checkDeposit.amount,
            paymentStatus: checkDeposit.paymentStatus,
            date: checkDeposit.date,
            merchantTransactionId: createPaymentData.transaction_id,
            clientId: createPaymentData.order_id,
            paymentUrl: createPaymentData.payment_url
        };

        return res.status(201).json({
            status: true,
            msg: "Deposit created successfully",
            data: response,
        });
    } catch (error) {
        console.error("Error in createDepositAbcGateway:", error);
        return res.status(500).json({
            status: false,
            error: "Internal server error",
            msg: "Failed to create deposit"
        });
    }
};