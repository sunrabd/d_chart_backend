const express = require('express');
const { increaseCoin, deductCoin,getCoinHistory } = require('../controllers/super_coin_controller');

const router = express.Router();

// Route to increase coins for a user
router.post('/increase-coin', increaseCoin);

router.post('/deduct-coin', deductCoin);

router.get('/history/:userId', getCoinHistory);

module.exports = router;