const express = require('express');
const router = express.Router();
const tickerController = require('../controllers/ticker_controller');

router.post('/tickers', tickerController.createTicker);
router.get('/tickers', tickerController.getAllTickers);
router.get('/tickers/:id', tickerController.getTickerById);
router.put('/tickers/:id', tickerController.updateTicker);
router.delete('/tickers/:id', tickerController.deleteTicker);

module.exports = router;
