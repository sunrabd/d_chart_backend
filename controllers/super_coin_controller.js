const User = require('../models/user_model');
const CoinTransaction = require('../models/coin_transaction_model');

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

module.exports = { increaseCoin, deductCoin, getCoinHistory };