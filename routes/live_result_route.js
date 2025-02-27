const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); 

const { authenticateToken } = require('../middleware/auth_middelware');// Import the upload middleware

const liveResultController = require('../controllers/live_result_controller_');

router.post('/live-chart',authenticateToken,  liveResultController.createLiveResult);
router.post('/live-chart/get',authenticateToken,  liveResultController.getAllLiveResults);
// router.get('/live-chart-date',  liveResultController.getLiveResultsByDate);
router.post('/live-chart/:id',authenticateToken,  liveResultController.getLiveResultById);
router.put('/live-chart/:id',authenticateToken,  liveResultController.updateLiveResult);
router.delete('/live-chart/:id',authenticateToken,  liveResultController.deleteLiveResult);
router.post('/live-results/market-type/:market_type_id',authenticateToken,  liveResultController.getLiveResultsByMarketTypeId);

router.post('/upload-csv', upload.single('file'), liveResultController.uploadLiveResultsCSV);

module.exports = router;
