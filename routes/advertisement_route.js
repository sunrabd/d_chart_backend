const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisement_controller');
const { authenticateToken } = require('../middleware/auth_middelware');


router.post('/advertisements', advertisementController.createAdvertisement);
router.get('/advertisements', advertisementController.getAdvertisements);
router.get('/advertisements/:id', advertisementController.getAdvertisementById);
router.put('/advertisements/:id', advertisementController.updateAdvertisement);
router.delete('/advertisements/:id', advertisementController.deleteAdvertisement);

module.exports = router;
