const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisement_controller');
const { authenticateToken } = require('../middleware/auth_middelware');


router.post('/advertisements',authenticateToken, advertisementController.createAdvertisement);
router.get('/advertisements',authenticateToken, advertisementController.getAdvertisements);
router.get('/advertisements/:id',authenticateToken, advertisementController.getAdvertisementById);
router.put('/advertisements/:id',authenticateToken, advertisementController.updateAdvertisement);
router.delete('/advertisements/:id',authenticateToken, advertisementController.deleteAdvertisement);

module.exports = router;