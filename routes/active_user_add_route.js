// File: routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const activeUserAddController = require('../controllers/active_user_add_controller');
const cron = require('node-cron');


const { authenticateToken } = require('../middleware/auth_middelware');
const upload = require('../middleware/upload');

router.post('/active-user-ads',authenticateToken, activeUserAddController.createAdvertisement);
router.post('/active-user-ads/get',authenticateToken, activeUserAddController.getAdvertisements);
router.post('/active-user-ads/:id',authenticateToken, activeUserAddController.getAdvertisementById);
router.put('/active-user-ads/:id',authenticateToken, activeUserAddController.updateAdvertisement);
router.delete('/active-user-ads/:id',authenticateToken, activeUserAddController.deleteAdvertisement);

module.exports = router;