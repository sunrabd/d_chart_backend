// File: routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/add_video_controller');
const upload = require('../middleware/upload');

router.post('/', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), videoController.createVideo);

router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);
router.put('/:id', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);

module.exports = router;
