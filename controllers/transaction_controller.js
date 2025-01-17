const Transaction = require('../models/transaction_model');
const User = require('../models/user_model');
const Message = require('../config/message');

// Create a new transaction
const createTransaction = async (req, res) => {
    try {
        const { userId, mobile, transactionType, subscriptionId, date } = req.body;
        const transaction = await Transaction.create({
            userId,
            mobile,
            transactionType,
            subscriptionId,
            date,
        });
        try {
            // Fetch the admin user to get their device token
            const adminUser = await User.findOne({ where: { role: 'admin' } });
            
            if (adminUser && adminUser.deviceToken) {
                console.log(`Admin Device Token: ${adminUser.deviceToken}`);
                
                // Send a notification to the admin
                const message = `A new transaction has been created by User ID: ${userId}`;
                
                console.log(message);
                // const notificationDate = new Date().toISOString();
            //    return ;
                await Message.sendNotificationToUserDevice(
                    message,
                    // adminUser.deviceToken,
                    // "dqyuRUBWSSGzfsJ0C9DdxJ:APA91bFzxFZMO6O2JhXDbTzyiV7pJbYIbhy9Y_onzrKnDtu_21BD0_QsFxHZf_SJeh61tdIeC88_o8lBWrflSLMDCxvnLAFLot6gDlehkIeEN8Quhg_NzvY",
                    adminUser.deviceToken,
                    // notificationDate,
                    'New Transaction Created'
                );
            } else {
                console.warn('Admin user not found or does not have a device token.');
            }
        } catch (error) {
            console.error('Error sending notification:', error);
        }
        res.status(201).json({ status: true, message: "create transaction successfully", data: transaction });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const newReq = async (req, res) => {
    // try {
    //     const transactions = await Transaction.findAll({ include: ['user'] });
        res.status(200).json({ status: true, message: "get All transactions"});
    // } catch (error) {
    //     res.status(500).json({ status: false, error: error.message });
    // }
};

// Get all transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({ include: ['user'] });
        res.status(200).json({ status: true, message: "get All transactions", data: transactions });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Get a single transaction by ID
const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findOne({
            where: { id },
            include: ['user'],
        });
        if (!transaction) {
            return res.status(404).json({ status: false, error: 'Transaction not found' });
        }
        res.status(200).json({ status: true, message: "get transaction by id", data: transaction });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Update a transaction
const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { mobile, transactionType, subscriptionId, date, status } = req.body;
        const transaction = await Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ status: false, error: 'Transaction not found' });
        }
        await transaction.update({ mobile, transactionType, subscriptionId, date, status });
        res.status(200).json({ status: true, message: "get transaction by id", data: transaction });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ status: false, error: 'Transaction not found' });
        }
        await transaction.destroy();
        res.status(200).json({ status: true, message: 'Transaction deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionById,
    updateTransaction,
    newReq,
    deleteTransaction,
};
