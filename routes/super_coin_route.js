const express = require('express');
const { increaseCoin, deductCoin,getCoinHistory ,getAllCoinHistoryToAdmin222} = require('../controllers/super_coin_controller');
const { route } = require('./market_type_route');

const router = express.Router();

// Route to increase coins for a user
router.post('/increase-coin', increaseCoin);

router.post('/deduct-coin', deductCoin);

router.get('/history/:userId', getCoinHistory);


router.get('/history',getAllCoinHistoryToAdmin222);

module.exports = router;