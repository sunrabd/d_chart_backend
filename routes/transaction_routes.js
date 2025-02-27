const express = require('express');
const { authenticateToken } = require('../middleware/auth_middelware');

const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transaction_controller');

const router = express.Router();

router.post('/',authenticateToken, createTransaction);
router.post('/get',authenticateToken, getAllTransactions);
router.post('/:id',authenticateToken, getTransactionById);
router.put('/:id',authenticateToken, updateTransaction);
router.delete('/:id',authenticateToken, deleteTransaction);

module.exports = router;
