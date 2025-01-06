const express = require('express');

const { authenticateToken } = require('../middleware/auth_middelware');
const { getOpenResultFrequency, getCloseResultFrequency, getOpenPannaDigitFrequency, getClosePannaDigitFrequency, getJodiFrequency } = require('../controllers/ai_guess_controller');

const router = express.Router();

router.get('/open-result-frequency', getOpenResultFrequency);
router.get('/close-result-frequency', getCloseResultFrequency);
router.get('/open-panna-frequency', getOpenPannaDigitFrequency);
router.get('/close-panna-frequency', getClosePannaDigitFrequency);
router.get('/jodi-frequency', getJodiFrequency);

module.exports = router;        