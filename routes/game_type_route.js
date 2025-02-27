const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const gameTypeController = require('../controllers/game_type_controller');

const { authenticateToken } = require('../middleware/auth_middelware');

router.post('/game-type',authenticateToken, gameTypeController.createGameType);
router.put('/game-type/:id',authenticateToken, gameTypeController.updateGameType);

router.post('/game-type/get',authenticateToken, gameTypeController.getAllGameTypes);
router.post('/game-type/:id',authenticateToken, gameTypeController.getGameTypeById);
router.delete('/game-type/:id',authenticateToken, gameTypeController.deleteGameType);

module.exports = router;
