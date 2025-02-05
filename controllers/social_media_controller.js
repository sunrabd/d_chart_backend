const SocialMedia = require('../models/social_media_model');
const upload = require('../middleware/upload');

// Create Social Media Entry
const createSocialMedia = async (req, res) => {
  const uploadSingle = upload.single('icon');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    const { title, link } = req.body;
    const icon = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const newEntry = await SocialMedia.create({ title, icon, link });
      res.status(201).json({
        status: true,
        message: 'Social media entry created successfully',
        data: newEntry,
      });
    } catch (error) {
      console.error('Error creating social media entry:', error);
      res.status(500).json({ status: false, message: 'Error creating entry', error: error.message });
    }
  });
};


// Get All Social Media Entries
const getSocialMedia = async (req, res) => {
  try {
    const entries = await SocialMedia.findAll();
    res.status(200).json({ status: true, data: entries });
  } catch (error) {
    console.error('Error fetching social media entries:', error);
    res.status(500).json({ status: false, message: 'Error fetching entries', error: error.message });
  }
};

// Get Single Social Media Entry
const getSocialMediaById = async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await SocialMedia.findByPk(id);
    if (!entry) {
      return res.status(404).json({ status: false, message: 'Entry not found' });
    }

    res.status(200).json({ status: true, data: entry });
  } catch (error) {
    console.error('Error fetching social media entry:', error);
    res.status(500).json({ status: false, message: 'Error fetching entry', error: error.message });
  }
};

// Update Social Media Entry
const updateSocialMedia = async (req, res) => {
  const uploadSingle = upload.single('icon');
  const { id } = req.params;

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    const { title, link } = req.body;
    const icon = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      const entry = await SocialMedia.findByPk(id);
      if (!entry) {
        return res.status(404).json({ status: false, message: 'Entry not found' });
      }

      await entry.update({ title, link, ...(icon && { icon }) });
      res.status(200).json({ status: true, message: 'Entry updated successfully', data: entry });
    } catch (error) {
      console.error('Error updating social media entry:', error);
      res.status(500).json({ status: false, message: 'Error updating entry', error: error.message });
    }
  });
};

// Delete Social Media Entry
const deleteSocialMedia = async (req, res) => {
  const { id } = req.params;

  try {
    const entry = await SocialMedia.findByPk(id);
    if (!entry) {
      return res.status(404).json({ status: false, message: 'Entry not found' });
    }

    await entry.destroy();
    res.status(200).json({ status: true, message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting social media entry:', error);
    res.status(500).json({ status: false, message: 'Error deleting entry', error: error.message });
  }
};

module.exports = {
  createSocialMedia,
  getSocialMedia,
  getSocialMediaById,
  updateSocialMedia,
  deleteSocialMedia,
};