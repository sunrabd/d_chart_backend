const express = require('express');
const router = express.Router();
const marketTypeController = require('../controllers/market_type_controller');
const upload = require('../middleware/upload'); 

const { authenticateToken } = require('../middleware/auth_middelware');

router.post('/market-type',authenticateToken, marketTypeController.createMarketType);
router.get('/market-type',authenticateToken, marketTypeController.getAllMarketTypes);
router.get('/market-type/:id',authenticateToken, marketTypeController.getMarketTypeById);
router.put('/market-type/:id',authenticateToken, marketTypeController.updateMarketType);
router.delete('/market-type/:id',authenticateToken, marketTypeController.deleteMarketType);
router.get('/market-types/:market_type_id/game-types',authenticateToken, marketTypeController.getAllGameTypesByMarketTypeId);
router.post('/api/upload-market-types' ,upload.single('file'), marketTypeController.uploadMarketTypesCSV);
router.get('/market-types-not-in-live-results',authenticateToken, marketTypeController.getMarketTypesNotInLiveResults);
router.get('/market-types-getall-live-results',authenticateToken, marketTypeController.getAllLiveResultsm);

module.exports = router;
