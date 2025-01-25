const User = require('../models/user_model');

// Increase coins for a specific user
const increaseCoin = async (req, res) => {
  try {
    const { userId, coins } = req.body;
    if (!userId || !coins || coins <= 0) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.super_coins += coins;
    await user.save();

    res.status(200).json({
      message: 'Coins increased successfully',
      user: { id: user.id,name : user.name, super_coins: user.super_coins },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Deduct coins for a specific user
const deductCoin = async (req, res) => {
  try {
    const { userId, coins } = req.body;

    if (!userId || !coins || coins <= 0) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.super_coins < coins) {
      return res.status(400).json({ message: 'Not enough coins' });
    }

    user.super_coins -= coins; // Deduct coins
    await user.save();

    res.status(200).json({
      message: 'Coins deducted successfully',
      user: { id: user.id, super_coins: user.super_coins },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { increaseCoin, deductCoin };