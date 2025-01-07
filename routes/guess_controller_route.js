const express = require('express');
const router = express.Router();
const addGuessController = require('../controllers/guess_controller');

const { authenticateToken } = require('../middleware/auth_middelware');

// Create a new AddGuess
router.post('/add-guess',  addGuessController.createAddGuess);

// Get all AddGuesses
router.get('/add-guess',  addGuessController.getAllAddGuesses);

// Get AddGuess by id,  market_type,  or game_type
router.get('/add-guess/:id',  addGuessController.getAddGuessByIdAndTypes);

// Update an AddGuess by id
router.put('/add-guess/:id',  addGuessController.updateAddGuess);

// Delete an AddGuess by id
router.delete('/add-guess/:id',  addGuessController.deleteAddGuess);

module.exports = router;
