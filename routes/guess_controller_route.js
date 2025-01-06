const express = require('express');
const router = express.Router();
const addGuessController = require('../controllers/guess_controller');

const { authenticateToken } = require('../middleware/auth_middelware');

// Create a new AddGuess
router.post('/add-guess',authenticateToken,  addGuessController.createAddGuess);

// Get all AddGuesses
router.get('/add-guess',authenticateToken,  addGuessController.getAllAddGuesses);

// Get AddGuess by id,  market_type,  or game_type
router.get('/add-guess/:id',authenticateToken,  addGuessController.getAddGuessByIdAndTypes);

// Update an AddGuess by id
router.put('/add-guess/:id',authenticateToken,  addGuessController.updateAddGuess);

// Delete an AddGuess by id
router.delete('/add-guess/:id',authenticateToken,  addGuessController.deleteAddGuess);

module.exports = router;
