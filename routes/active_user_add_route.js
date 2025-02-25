// File: routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const activeUserAddController = require('../controllers/active_user_add_controller');
const cron = require('node-cron');


const { authenticateToken } = require('../middleware/auth_middelware');
const upload = require('../middleware/upload');

router.post('/active-user-ads', activeUserAddController.createAdvertisement);
router.get('/active-user-ads', activeUserAddController.getAdvertisements);
router.get('/active-user-ads/:id', activeUserAddController.getAdvertisementById);
router.put('/active-user-ads/:id', activeUserAddController.updateAdvertisement);
router.delete('/active-user-ads/:id', activeUserAddController.deleteAdvertisement);

module.exports = router;