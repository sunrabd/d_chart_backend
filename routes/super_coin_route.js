const express = require('express');
const { increaseCoin, deductCoin,getCoinHistory ,getAllCoinHistoryToAdmin222} = require('../controllers/super_coin_controller');
const { route } = require('./market_type_route');
const { authenticateToken } = require('../middleware/auth_middelware');
const router = express.Router();

// Route to increase coins for a user
router.post('/increase-coin',authenticateToken, increaseCoin);

router.post('/deduct-coin',authenticateToken, deductCoin);

router.post('/history/:userId',authenticateToken, getCoinHistory);


router.post('/history',authenticateToken,getAllCoinHistoryToAdmin222);

module.exports = router;