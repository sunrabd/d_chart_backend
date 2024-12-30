const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const gameTypeController = require('../controllers/game_type_controller');

router.post('/game-type', upload.single('icon'), gameTypeController.createGameType);
router.put('/game-type/:id', upload.single('icon'), gameTypeController.updateGameType);

router.get('/game-type', gameTypeController.getAllGameTypes);
router.get('/game-type/:id', gameTypeController.getGameTypeById);
router.delete('/game-type/:id', gameTypeController.deleteGameType);

module.exports = router;
