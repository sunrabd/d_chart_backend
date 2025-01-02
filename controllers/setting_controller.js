const AdminSetting = require('../models/setting_model');

// Create a new AdminSetting
const createAdminSetting = async (req, res) => {
    try {
        const { current_version, admin_upi, admin_contact_no, apk } = req.body;
        const newAdminSetting = await AdminSetting.create({
            current_version,
            admin_upi,
            admin_contact_no,
            apk
        });
        res.status(201).json({
            status: true,
            message: 'AdminSetting created successfully',
            data: newAdminSetting,
        });
    } catch (error) {
        console.error('Error in createAdminSetting:', error);
        res.status(500).json({ message: 'Error creating AdminSetting', error: error.message });
    }
};

// Get all AdminSettings
const getAllAdminSettings = async (req, res) => {
    try {
        const adminSettings = await AdminSetting.findAll();
        res.status(200).json({
            status: true,
            message: 'AdminSettings fetched successfully',
            data: adminSettings,
        });
    } catch (error) {
        console.error('Error in getAllAdminSettings:', error);
        res.status(500).json({ message: 'Error fetching AdminSettings', error: error.message });
    }
};

// Get a single AdminSetting by ID
const getAdminSettingById = async (req, res) => {
    try {
        const { id } = req.params;
        const adminSetting = await AdminSetting.findByPk(id);
        if (!adminSetting) {
            return res.status(404).json({
                status: false,
                message: 'AdminSetting not found',
                data: null,
            });
        }
        res.status(200).json({
            status: true,
            message: 'AdminSetting fetched successfully',
            data: adminSetting,
        });
    } catch (error) {
        console.error('Error in getAdminSettingById:', error);
        res.status(500).json({ message: 'Error fetching AdminSetting', error: error.message });
    }
};

// Update an existing AdminSetting
const updateAdminSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const { current_version, admin_upi, admin_contact_no, apk } = req.body;
        const adminSetting = await AdminSetting.findByPk(id);
        if (!adminSetting) {
            return res.status(404).json({
                status: false,
                message: 'AdminSetting not found',
                data: null,
            });
        }
        adminSetting.current_version = current_version || adminSetting.current_version;
        adminSetting.admin_upi = admin_upi || adminSetting.admin_upi;
        adminSetting.admin_contact_no = admin_contact_no || adminSetting.admin_contact_no;
        adminSetting.apk = apk || adminSetting.apk;

        await adminSetting.save();
        res.status(200).json({
            status: true,
            message: 'AdminSetting updated successfully',
            data: adminSetting,
        });
    } catch (error) {
        console.error('Error in updateAdminSetting:', error);
        res.status(500).json({ message: 'Error updating AdminSetting', error: error.message });
    }
};

// Delete an AdminSetting by ID
const deleteAdminSetting = async (req, res) => {
    try {
        const { id } = req.params;
        const adminSetting = await AdminSetting.findByPk(id);
        if (!adminSetting) {
            return res.status(404).json({
                status: false,
                message: 'AdminSetting not found',
                data: null,
            });
        }
        await adminSetting.destroy();
        res.status(200).json({
            status: true,
            message: 'AdminSetting deleted successfully',
            data: null,
        });
    } catch (error) {
        console.error('Error in deleteAdminSetting:', error);
        res.status(500).json({ message: 'Error deleting AdminSetting', error: error.message });
    }
};

module.exports = {
    createAdminSetting,
    getAllAdminSettings,
    getAdminSettingById,
    updateAdminSetting,
    deleteAdminSetting,
};
