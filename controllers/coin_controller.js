const CoinModel = require('../models/coin_model');

// Create a new coin entry
const createCoin = async (req, res) => {
    try {
        const { plan_name, join_date, amount } = req.body;

        const newCoin = await CoinModel.create({
            plan_name,
            join_date,
            amount,
        });

        res.status(201).json({
            status: true,
            message: 'Coin entry created successfully',
            coin: newCoin,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
    }
};

// Get all coin entries
const getAllCoins = async (req, res) => {
    try {
        const coins = await CoinModel.findAll();

        res.status(200).json({
            status: true,
            message: 'Coins fetched successfully',
            coins,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
    }
};

// Get a specific coin entry by ID
const getCoinById = async (req, res) => {
    try {
        const { id } = req.params;

        const coin = await CoinModel.findByPk(id);

        if (!coin) {
            return res.status(404).json({ status: false, message: 'Coin not found' });
        }

        res.status(200).json({
            status: true,
            message: 'Coin fetched successfully',
            coin,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
    }
};

// Update a coin entry by ID
const updateCoin = async (req, res) => {
    try {
        const { id } = req.params;
        const { plan_name, join_date, amount } = req.body;

        const coin = await CoinModel.findByPk(id);

        if (!coin) {
            return res.status(404).json({ status: false, message: 'Coin not found' });
        }

        coin.plan_name = plan_name || coin.plan_name;
        coin.join_date = join_date || coin.join_date;
        coin.amount = amount || coin.amount;

        await coin.save();

        res.status(200).json({
            status: true,
            message: 'Coin updated successfully',
            coin,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
    }
};

// Delete a coin entry by ID
const deleteCoin = async (req, res) => {
    try {
        const { id } = req.params;

        const coin = await CoinModel.findByPk(id);

        if (!coin) {
            return res.status(404).json({ message: 'Coin not found' });
        }

        await coin.destroy();

        res.status(200).json({
            status: true,
            message: 'Coin deleted successfully',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error', error: error.message });
    }
};

module.exports = {
    createCoin,
    getAllCoins,
    getCoinById,
    updateCoin,
    deleteCoin,
};
