const express = require('express');
const { authenticateToken } = require('../middleware/auth_middelware');

const {
  createCoin,
  getAllCoins,
  getCoinById,
  updateCoin,
  deleteCoin,
} = require('../controllers/coin_controller');

const router = express.Router();
router.post('/',authenticateToken, createCoin);
router.post('/get',authenticateToken, getAllCoins);
router.post('/:id',authenticateToken, getCoinById);
router.put('/:id',authenticateToken, updateCoin);
router.delete('/:id',authenticateToken, deleteCoin);

module.exports = router;
