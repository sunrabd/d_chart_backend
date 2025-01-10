const express = require('express');

const { authenticateToken } = require('../middleware/auth_middelware');
const router = express.Router();
const {
    createAdminSetting,
    getAllAdminSettings,
    getAdminSettingById,
    updateAdminSetting,
    deleteAdminSetting,
} = require('../controllers/setting_controller');

router.post('/',authenticateToken, createAdminSetting);

router.get('/',authenticateToken, getAllAdminSettings);

router.get('/:id',authenticateToken, getAdminSettingById);

router.put('/:id',authenticateToken, updateAdminSetting);

router.delete('/:id',authenticateToken, deleteAdminSetting);

module.exports = router;
