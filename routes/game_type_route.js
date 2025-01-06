const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const gameTypeController = require('../controllers/game_type_controller');

const { authenticateToken } = require('../middleware/auth_middelware');

router.post('/game-type',authenticateToken,  upload.single('icon'), gameTypeController.createGameType);
router.put('/game-type/:id',authenticateToken,  upload.single('icon'), gameTypeController.updateGameType);

router.get('/game-type',authenticateToken,  gameTypeController.getAllGameTypes);
router.get('/game-type/:id',authenticateToken,  gameTypeController.getGameTypeById);
router.delete('/game-type/:id',authenticateToken,  gameTypeController.deleteGameType);

module.exports = router;
