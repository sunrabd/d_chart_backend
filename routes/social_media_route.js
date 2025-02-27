const express = require('express');
const { authenticateToken } = require('../middleware/auth_middelware');

const {
  createSocialMedia,
  getSocialMedia,
  getSocialMediaById,
  updateSocialMedia,
  deleteSocialMedia,
} = require('../controllers/social_media_controller');

const router = express.Router();

router.post('/',authenticateToken, createSocialMedia);
router.post('/get',authenticateToken, getSocialMedia);
router.post('/:id',authenticateToken, getSocialMediaById);
router.put('/:id',authenticateToken, updateSocialMedia);
router.delete('/:id',authenticateToken, deleteSocialMedia);

module.exports = router;
