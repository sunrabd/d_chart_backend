const express = require('express');
const {
    newReq
} = require('../controllers/transaction_controller');

const router = express.Router();

router.get('/new', newReq);
// router.get('/', getAllTransactions);
// router.get('/:id', getTransactionById);
// router.put('/:id', updateTransaction);
// router.delete('/:id', deleteTransaction);

module.exports = router;
