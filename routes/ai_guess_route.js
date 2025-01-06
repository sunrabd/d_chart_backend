const express = require('express');

const { authenticateToken } = require('../middleware/auth_middelware');
const { getOpenResultFrequency, getCloseResultFrequency, getOpenPannaDigitFrequency, getClosePannaDigitFrequency, getJodiFrequency } = require('../controllers/ai_guess_controller');

const router = express.Router();

router.get('/open-result-frequency',authenticateToken, getOpenResultFrequency);
router.get('/close-result-frequency',authenticateToken, getCloseResultFrequency);
router.get('/open-panna-frequency',authenticateToken, getOpenPannaDigitFrequency);
router.get('/close-panna-frequency',authenticateToken, getClosePannaDigitFrequency);
router.get('/jodi-frequency',authenticateToken, getJodiFrequency);

module.exports = router;        