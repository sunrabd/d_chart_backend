const express = require('express');
const {
  createCoin,
  getAllCoins,
  getCoinById,
  updateCoin,
  deleteCoin,
} = require('../controllers/coin_controller');

const router = express.Router();
router.post('/', createCoin);
router.get('/', getAllCoins);
router.get('/:id', getCoinById);
router.put('/:id', updateCoin);
router.delete('/:id', deleteCoin);

module.exports = router;
