const express = require('express');
const router = express.Router();
const {
    createAdminSetting,
    getAllAdminSettings,
    getAdminSettingById,
    updateAdminSetting,
    deleteAdminSetting,
} = require('../controllers/setting_controller');

router.post('/', createAdminSetting);

router.get('/', getAllAdminSettings);

router.get('/:id', getAdminSettingById);

router.put('/:id', updateAdminSetting);

router.delete('/:id', deleteAdminSetting);

module.exports = router;
