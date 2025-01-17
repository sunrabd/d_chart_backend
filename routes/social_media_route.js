const express = require('express');
const {
  createSocialMedia,
  getSocialMedia,
  getSocialMediaById,
  updateSocialMedia,
  deleteSocialMedia,
} = require('../controllers/social_media_controller');

const router = express.Router();

router.post('/', createSocialMedia);
router.get('/', getSocialMedia);
router.get('/:id', getSocialMediaById);
router.put('/:id', updateSocialMedia);
router.delete('/:id', deleteSocialMedia);

module.exports = router;
