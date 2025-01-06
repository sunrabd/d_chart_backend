const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload'); 

const { authenticateToken } = require('../middleware/auth_middelware');// Import the upload middleware

const liveResultController = require('../controllers/live_result_controller_');

router.post('/live-chart',  liveResultController.createLiveResult);
router.get('/live-chart',  liveResultController.getAllLiveResults);
// router.get('/live-chart-date',  liveResultController.getLiveResultsByDate);
router.get('/live-chart/:id',  liveResultController.getLiveResultById);
router.put('/live-chart/:id',  liveResultController.updateLiveResult);
router.delete('/live-chart/:id',  liveResultController.deleteLiveResult);
router.get('/live-results/market-type/:market_type_id',  liveResultController.getLiveResultsByMarketTypeId);

router.post('/upload-csv', upload.single('file'), liveResultController.uploadLiveResultsCSV);

module.exports = router;
