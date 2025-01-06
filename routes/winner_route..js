const express = require('express');
const { authenticateToken } = require('../middleware/auth_middelware');
const {
    createWinner,
    getAllWinners,
    getWinnerById,
    updateWinner,
    deleteWinner,
} = require('../controllers/winner_controller');

const router = express.Router();

// Routes
router.post('/winner',authenticateToken, createWinner);
router.get('/winners', authenticateToken,getAllWinners);
router.get('/winner/:id',authenticateToken, getWinnerById);
router.put('/winner/:id',authenticateToken, updateWinner);
router.delete('/winner/:id',authenticateToken, deleteWinner);

module.exports = router;
