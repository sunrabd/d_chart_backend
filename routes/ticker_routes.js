const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth_middelware');

const tickerController = require('../controllers/ticker_controller');

router.post('/tickers',authenticateToken, tickerController.createTicker);
router.post('/tickers/get', authenticateToken,tickerController.getAllTickers);
router.post('/tickers/:id',authenticateToken, tickerController.getTickerById);
router.put('/tickers/:id', authenticateToken,tickerController.updateTicker);
router.delete('/tickers/:id',authenticateToken, tickerController.deleteTicker);

module.exports = router;
