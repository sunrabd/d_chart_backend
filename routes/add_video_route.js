// File: routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/add_video_controller');
const cron = require('node-cron');


const { authenticateToken } = require('../middleware/auth_middelware');
const upload = require('../middleware/upload');

router.post('/',authenticateToken,  upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), videoController.createVideo);

router.get('/',authenticateToken, videoController.getAllVideos);
router.get('/:id',authenticateToken,  videoController.getVideoById);
router.put('/:id',authenticateToken,  upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), videoController.updateVideo);
router.delete('/:id',authenticateToken,  videoController.deleteVideo);

module.exports = router;
