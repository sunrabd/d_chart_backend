const Transaction = require('../models/transaction_model');

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
        const { mobile, transactionType, subscriptionId, date } = req.body;
        const transaction = await Transaction.findByPk(id);
        if (!transaction) {
            return res.status(404).json({ status: false, error: 'Transaction not found' });
        }
        await transaction.update({ mobile, transactionType, subscriptionId, date });
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
