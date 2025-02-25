// File: routes/videoRoutes.js
const express = require('express');
const router = express.Router();
const activeUserAddController = require('../controllers/active_user_add_controller');
const cron = require('node-cron');


const { authenticateToken } = require('../middleware/auth_middelware');
const upload = require('../middleware/upload');

router.post('/', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), activeUserAddController.createActiveUserAdd);

router.get('/',activeUserAddController.getAllActiveUserAdd);
router.get('/:id', activeUserAddController.getActiveUserAddId);
router.put('/:id', upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'video', maxCount: 1 },
]), activeUserAddController.updateActiveUserAddId);
router.delete('/:id', activeUserAddController.deleteActiveUserAddId);

module.exports = router;