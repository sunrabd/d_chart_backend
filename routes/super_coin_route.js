const express = require('express');
const { increaseCoin, deductCoin } = require('../controllers/super_coin_controller');

const router = express.Router();

// Route to increase coins for a user
router.post('/increase-coin', increaseCoin);

// Route to deduct coins for a user
router.post('/deduct-coin', deductCoin);

module.exports = router;