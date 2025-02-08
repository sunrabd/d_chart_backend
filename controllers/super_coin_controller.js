const User = require('../models/user_model');
const CoinTransaction = require('../models/coin_transaction_model');
const { Op } = require('sequelize');
const moment = require('moment-timezone');


// Increase coins for a specific user
const increaseCoin = async (req, res) => {
    try {
        const { userId, coins } = req.body;
        if (!userId || !coins || coins <= 0) {
            return res.status(400).json({ status: false, message: 'Invalid payload' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        user.super_coins += coins;
        await user.save();

        await CoinTransaction.create({
            user_id: userId,
            transaction_type: 'increase',
            coins,
        });

        res.status(200).json({
            status: true,
            message: 'Coins increased successfully',
            user: { id: user.id, name: user.name, super_coins: user.super_coins },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
    }
};

// Deduct coins for a specific user
const deductCoin = async (req, res) => {
    try {
        const { userId, coins } = req.body;

        if (!userId || !coins || coins <= 0) {
            return res.status(400).json({ status: false, message: 'Invalid payload' });
        }

        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        if (user.super_coins < coins) {
            return res.status(400).json({ status: false, message: 'Not enough coins' });
        }

        user.super_coins -= coins;
        await user.save();

        await CoinTransaction.create({
            user_id: userId,
            transaction_type: 'deduct',
            coins,
        });

        res.status(200).json({
            status: true,
            message: 'Coins deducted successfully',
            user: { id: user.id, super_coins: user.super_coins },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
    }

}
// Get coin history
const getCoinHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ status: false, message: 'User ID is required' });
        }

        const history = await CoinTransaction.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
        });

        if (!history.length) {
            return res.status(404).json({ status: false, message: 'No transaction history found' });
        }

        res.status(200).json({
            status: true,
            message: 'Coin transaction history fetched successfully',
            history,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
    }
};

const getAllCoinHistoryToAdmin222 = async (req, res) => {
    try {
        const { start_date, end_date, transaction_type } = req.query;

        const whereCondition = {};

        if (start_date && end_date) {
            whereCondition.createdAt = {
                [Op.between]: [
                    new Date(start_date).setHours(0, 0, 0, 0),
                    new Date(end_date).setHours(23, 59, 59, 999),
                ],
            };
        } else if (start_date) {
            whereCondition.createdAt = {
                [Op.gte]: new Date(start_date).setHours(0, 0, 0, 0),
            };
        } else if (end_date) {
            whereCondition.createdAt = {
                [Op.lte]: new Date(end_date).setHours(23, 59, 59, 999),
            };
        }

        const allTransactions = await CoinTransaction.findAll({
            where: whereCondition,
            include: {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email', 'mobile_no'], 
            },
            order: [['createdAt', 'DESC']], 
        });

        if (!allTransactions.length) {
            return res.status(404).json({
                status: false,
                message: 'No coin transactions found for the given date range',
            });
        }

        const today = moment().tz('Asia/Kolkata').startOf('day');  
        const yesterday = moment().tz('Asia/Kolkata').subtract(1, 'day').startOf('day');  

        let totalCount = 0, todayCount = 0, todayIncrease = 0, todayDeduct = 0;
        let yesterdayCount = 0, yesterdayIncrease = 0, yesterdayDeduct = 0;

        const formattedTransactions = allTransactions.map(tx => {
            const txDate = moment(tx.createdAt).tz('Asia/Kolkata'); // Convert to IST
            totalCount += tx.coins;

            if (txDate.isSameOrAfter(today)) {
                todayCount += tx.coins;
                if (tx.transaction_type === 'increase') todayIncrease += tx.coins;
                if (tx.transaction_type === 'deduct') todayDeduct += tx.coins;
            } else if (txDate.isSameOrAfter(yesterday) && txDate.isBefore(today)) {
                yesterdayCount += tx.coins;
                if (tx.transaction_type === 'increase') yesterdayIncrease += tx.coins;
                if (tx.transaction_type === 'deduct') yesterdayDeduct += tx.coins;
            }

            return {
                ...tx.toJSON(),
                createdAt: txDate.format('dddd, YYYY-MM-DD hh:mm:ss A'),
            };
        });

        let filteredTransactions = formattedTransactions;
        if (transaction_type) {
            filteredTransactions = formattedTransactions.filter(tx => tx.transaction_type === transaction_type);
        }

        res.status(200).json({
            status: true,
            message: "Coin transactions fetched successfully",
            total_count: totalCount,
            today_count: todayCount,
            today_increase: todayIncrease,
            today_deduct: todayDeduct,
            yesterday_count: yesterdayCount,
            yesterday_increase: yesterdayIncrease,
            yesterday_deduct: yesterdayDeduct,
            data: filteredTransactions,
        });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch coin transactions', error: error.message });
    }
};

module.exports = { increaseCoin, deductCoin, getCoinHistory,getAllCoinHistoryToAdmin222 };