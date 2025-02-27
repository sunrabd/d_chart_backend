const express = require('express');

const { authenticateToken } = require('../middleware/auth_middelware');
const { getOpenResultFrequency, getCloseResultFrequency, getOpenPannaDigitFrequency, getClosePannaDigitFrequency, getJodiFrequency } = require('../controllers/ai_guess_controller');

const router = express.Router();

router.post('/open-result-frequency',authenticateToken, getOpenResultFrequency);
router.post('/close-result-frequency',authenticateToken, getCloseResultFrequency);
router.post('/open-panna-frequency',authenticateToken, getOpenPannaDigitFrequency);
router.post('/close-panna-frequency',authenticateToken, getClosePannaDigitFrequency);
router.post('/jodi-frequency',authenticateToken, getJodiFrequency);

module.exports = router;        