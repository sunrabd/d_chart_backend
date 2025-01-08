const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const gameTypeController = require('../controllers/game_type_controller');

const { authenticateToken } = require('../middleware/auth_middelware');

router.post('/game-type', gameTypeController.createGameType);
router.put('/game-type/:id', gameTypeController.updateGameType);

router.get('/game-type', gameTypeController.getAllGameTypes);
router.get('/game-type/:id', gameTypeController.getGameTypeById);
router.delete('/game-type/:id', gameTypeController.deleteGameType);

module.exports = router;
