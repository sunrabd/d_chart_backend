const express = require('express');
const router = express.Router();
const {
    createAdminSetting,
    getAllAdminSettings,
    getAdminSettingById,
    updateAdminSetting,
    deleteAdminSetting,
} = require('../controllers/setting_controller');

// Create a new AdminSetting
router.post('/', createAdminSetting);

// Get all AdminSettings
router.get('/', getAllAdminSettings);

// Get an AdminSetting by ID
router.get('/:id', getAdminSettingById);

// Update an AdminSetting by ID
router.put('/:id', updateAdminSetting);

// Delete an AdminSetting by ID
router.delete('/:id', deleteAdminSetting);

module.exports = router;
