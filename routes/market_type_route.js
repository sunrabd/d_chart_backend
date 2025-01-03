const express = require('express');
const router = express.Router();
const marketTypeController = require('../controllers/market_type_controller');
const upload = require('../middleware/upload'); 

router.post('/market-type', marketTypeController.createMarketType);
router.get('/market-type', marketTypeController.getAllMarketTypes);
router.get('/market-type/:id', marketTypeController.getMarketTypeById);
router.put('/market-type/:id', marketTypeController.updateMarketType);
router.delete('/market-type/:id', marketTypeController.deleteMarketType);
router.get('/market-types/:market_type_id/game-types', marketTypeController.getAllGameTypesByMarketTypeId);
router.post('/api/upload-market-types' ,upload.single('file'), marketTypeController.uploadMarketTypesCSV);
router.get('/market-types-not-in-live-results', marketTypeController.getMarketTypesNotInLiveResults);
router.get('/market-types-getall-live-results', marketTypeController.getAllLiveResultsm);

module.exports = router;
