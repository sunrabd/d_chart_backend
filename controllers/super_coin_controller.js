const User = require('../models/user_model');
const CoinTransaction = require('../models/coin_transaction_model');
const { Op } = require('sequelize');

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
        const { start_date, end_date } = req.query;

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

        const coinTransaction = await CoinTransaction.findAll({
            where: whereCondition,
            include: {
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email'], 
            },
            order: [['createdAt', 'DESC']], 
        });

        if (!coinTransaction.length) {
            return res.status(404).json({
                status: false,
                message: 'No coin transactions found for the given date range',
            });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        let todayCount = 0, 
            yesterdayCount = 0, 
            todayIncreaseCount = 0, 
            todayDeductCount = 0, 
            yesterdayIncreaseCount = 0, 
            yesterdayDeductCount = 0;

        coinTransaction.forEach(tx => {
            const txDate = new Date(tx.createdAt);
            if (txDate >= today) {
                todayCount++;
                if (tx.transaction_type === 'increase') {
                    todayIncreaseCount++;
                } else if (tx.transaction_type === 'deduct') {
                    todayDeductCount++;
                }
            } else if (txDate >= yesterday && txDate < today) {
                yesterdayCount++;
                if (tx.transaction_type === 'increase') {
                    yesterdayIncreaseCount++;
                } else if (tx.transaction_type === 'deduct') {
                    yesterdayDeductCount++;
                }
            }
        });

        res.status(200).json({
            status: true,
            message: "Coin transactions fetched successfully",
            total_count: coinTransaction.length,
            today_count: todayCount,
            yesterday_count: yesterdayCount,
            today_increase_count: todayIncreaseCount,
            today_deduct_count: todayDeductCount,
            yesterday_increase_count: yesterdayIncreaseCount,
            yesterday_deduct_count: yesterdayDeductCount,
            data: coinTransaction,
        });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed to fetch coin transactions', error: error.message });
    }
};

module.exports = { increaseCoin, deductCoin, getCoinHistory,getAllCoinHistoryToAdmin222 };