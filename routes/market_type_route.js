const express = require('express');
const router = express.Router();
const marketTypeController = require('../controllers/market_type_controller');
const upload = require('../middleware/upload'); 

const { authenticateToken } = require('../middleware/auth_middelware');

router.post('/market-type',authenticateToken, marketTypeController.createMarketType);
router.post('/market-type/get',authenticateToken, marketTypeController.getAllMarketTypes);
router.post('/market-type2/get',authenticateToken, marketTypeController.getAllMarketTypes2);
router.post('/market-type/:id',authenticateToken, marketTypeController.getMarketTypeById);
router.put('/market-type/:id',authenticateToken, marketTypeController.updateMarketType);
router.delete('/market-type/:id',authenticateToken, marketTypeController.deleteMarketType);
router.post('/market-types/:market_type_id/game-types',authenticateToken, marketTypeController.getAllGameTypesByMarketTypeId);
router.post('/api/upload-market-types',upload.single('file'), marketTypeController.uploadMarketTypesCSV);
router.post('/market-types-not-in-live-results',authenticateToken, marketTypeController.getMarketTypesNotInLiveResults);
router.post('/market-types-not-in-live-results-all-market',authenticateToken, marketTypeController.getMarketTypesNotInLiveResultsAllMarket);
router.post('/market-types-getall-live-results',authenticateToken, marketTypeController.getAllLiveResultsm);
router.post('/market-types-getall-live-results-for-all-market',authenticateToken, marketTypeController.getAllLiveResultsForAllMarket);

module.exports = router;
