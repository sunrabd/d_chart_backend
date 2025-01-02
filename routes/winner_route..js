const express = require('express');
const {
    createWinner,
    getAllWinners,
    getWinnerById,
    updateWinner,
    deleteWinner,
} = require('../controllers/winner_controller');

const router = express.Router();

// Routes
router.post('/winner', createWinner);
router.get('/winners', getAllWinners);
router.get('/winner/:id', getWinnerById);
router.put('/winner/:id', updateWinner);
router.delete('/winner/:id', deleteWinner);

module.exports = router;
