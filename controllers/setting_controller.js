const AdminSetting = require('../models/setting_model');
const upload = require('../middleware/upload'); // Import the multer middleware

// Create a new AdminSetting
const createAdminSetting = async (req, res) => {
    try {
        const { current_version, admin_upi, admin_contact_no, apk, insta_url, youtube_url, whatsapp_channel,phonepay_key,secret_key, payment_type, razorpay_key } = req.body;

        const existingSetting = await AdminSetting.findOne();

        if (existingSetting) {
            return res.status(400).json({
                status: false,
                message: 'AdminSetting already exists. Use the update endpoint to modify it.',
            });
        }

        const newAdminSetting = await AdminSetting.create({
            current_version,
            admin_upi,
            admin_contact_no,
            apk,
            insta_url,
            youtube_url,
            whatsapp_channel,
            payment_type,
            phonepay_key,
            secret_key, 
            razorpay_key
        });
        res.status(201).json({
            status: true,
            message: 'AdminSetting created successfully',
            data: newAdminSetting,
        });
    } catch (error) {
        console.error('Error in createAdminSetting:', error);
        res.status(500).json({
            status: false, message: 'Error creating AdminSetting', error: error.message
        });
    }
};

// Get all AdminSettings
const getAllAdminSettings = async (req, res) => {
    try {
        const adminSetting = await AdminSetting.findOne();

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
        console.error('Error in getAllAdminSettings:', error);
        res.status(500).json({ status: false, message: 'Error fetching AdminSettings', error: error.message });
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
        res.status(500).json({ status: false, message: 'Error fetching AdminSetting', error: error.message });
    }
};

// Update an existing AdminSetting
const updateAdminSetting = async (req, res) => {
    try {
        const uploadFields = upload.fields([
            { name: 'apk', maxCount: 1 },
            { name: 'qrCode', maxCount: 1 },
            { name: 'refer_img', maxCount:1 }
        ]);

        // Use multer to handle file uploads
        uploadFields(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    status: false,
                    message: 'File upload error',
                    error: err.message,
                });
            }

            const { id } = req.params;
            const {
                current_version,
                admin_upi,
                admin_contact_no,
                insta_url,
                youtube_url,
                whatsapp_channel,
                terms_and_condition,
                privacy_policy,
                payment_type,
                razorpay_key,
                jodiBgColor,
                jodiTextColor,
                pannelBgColor,
                ai_free,
                banner_id,
                interstitial_id,
                rewarded_id,
                native_id,
                about_us,
                check_load_free,
                guessing_free,
                signup_bonus_coin,
                show_subscriptions,
                show_coins,
                phonepay_key,
                secret_key, 
                phonepay_pay_salt_key,
                cashfree_client_secret_key,
                cashfree_client_id,
                playStore_link,
                refer_bouns_coin,
                show_amount_checkload,
                show_refer_screen,
                facebook_placement_id,
                whatsapp_contact_number,
                show_otp_option,
                show_wp_otp_option,
                show_email_field,
                native_live_ads,
                native_guess_ads,
                native_profile_ads,
                native_checkload_ads,
                show_firebase_otp_option
            } = req.body;

            const files = req.files;

            const adminSetting = await AdminSetting.findByPk(id);
            if (!adminSetting) {
                return res.status(404).json({
                    status: false,
                    message: 'AdminSetting not found',
                    data: null,
                });
            }

            // Update fields
            adminSetting.current_version = current_version || adminSetting.current_version;
            adminSetting.admin_upi = admin_upi || adminSetting.admin_upi;
            adminSetting.admin_contact_no = admin_contact_no || adminSetting.admin_contact_no;
            adminSetting.insta_url = insta_url || adminSetting.insta_url;
            adminSetting.youtube_url = youtube_url || adminSetting.youtube_url;
            adminSetting.whatsapp_channel = whatsapp_channel || adminSetting.whatsapp_channel;
            adminSetting.terms_and_condition = terms_and_condition || adminSetting.terms_and_condition;
            adminSetting.privacy_policy = privacy_policy || adminSetting.privacy_policy;
            adminSetting.payment_type = payment_type || adminSetting.payment_type;
            adminSetting.razorpay_key = razorpay_key || adminSetting.razorpay_key;
            adminSetting.jodiBgColor = jodiBgColor || adminSetting.jodiBgColor;
            adminSetting.pannelBgColor = pannelBgColor || adminSetting.pannelBgColor;
            adminSetting.jodiTextColor = jodiTextColor || adminSetting.jodiTextColor;
            adminSetting.ai_free = ai_free || adminSetting.ai_free;
            adminSetting.check_load_free = check_load_free || adminSetting.check_load_free;
            adminSetting.guessing_free = guessing_free || adminSetting.guessing_free;
            adminSetting.signup_bonus_coin = signup_bonus_coin || adminSetting.signup_bonus_coin;
            adminSetting.show_subscriptions = show_subscriptions || adminSetting.show_subscriptions;
            adminSetting.show_coins = show_coins || adminSetting.show_coins;
            adminSetting.about_us = about_us || adminSetting.about_us;
            adminSetting.banner_id = banner_id || adminSetting.banner_id;
            adminSetting.interstitial_id = interstitial_id || adminSetting.interstitial_id;
            adminSetting.rewarded_id = rewarded_id || adminSetting.rewarded_id;
            adminSetting.native_id = native_id || adminSetting.native_id;
            adminSetting.phonepay_key = phonepay_key || adminSetting.phonepay_key;
            adminSetting.secret_key = secret_key || adminSetting.secret_key;
            adminSetting.phonepay_pay_salt_key = phonepay_pay_salt_key || adminSetting.phonepay_pay_salt_key;
            adminSetting.cashfree_client_secret_key = cashfree_client_secret_key || adminSetting.cashfree_client_secret_key;
            adminSetting.cashfree_client_id = cashfree_client_id || adminSetting.cashfree_client_id;
            adminSetting.playStore_link = playStore_link || adminSetting.playStore_link;
            adminSetting.refer_bouns_coin = refer_bouns_coin || adminSetting.refer_bouns_coin;
            adminSetting.show_refer_screen = show_refer_screen || adminSetting.show_refer_screen;
            adminSetting.show_amount_checkload = show_amount_checkload || adminSetting.show_amount_checkload;
            adminSetting.facebook_placement_id = facebook_placement_id || adminSetting.facebook_placement_id;
            adminSetting.whatsapp_contact_number = whatsapp_contact_number || adminSetting.whatsapp_contact_number;
            adminSetting.show_otp_option = show_otp_option || adminSetting.show_otp_option;
            adminSetting.show_email_field = show_email_field || adminSetting.show_email_field;
            adminSetting.native_live_ads = native_live_ads || adminSetting.native_live_ads;
            adminSetting.native_guess_ads =native_guess_ads || adminSetting.native_guess_ads;
            adminSetting.native_profile_ads = native_profile_ads || adminSetting.native_profile_ads;
            adminSetting.native_checkload_ads = native_checkload_ads || adminSetting.native_checkload_ads;
            adminSetting.show_wp_otp_option = show_wp_otp_option || adminSetting.show_wp_otp_option;
            adminSetting.show_firebase_otp_option = show_firebase_otp_option || adminSetting.show_firebase_otp_option;

            // Update apk file path if uploaded
            if (files?.apk) {
                adminSetting.apk = files.apk[0].path; // Store the APK file path
            }

            // Update qrCode file path if uploaded
            if (files?.qrCode) {
                adminSetting.qrCode = files.qrCode[0].path; // Store the QR code file path
            }

            if (files?.refer_img) {
                adminSetting.refer_img = files.refer_img[0].path;
            }

            await adminSetting.save();

            res.status(200).json({
                status: true,
                message: 'AdminSetting updated successfully',
                data: adminSetting,
            });
        });
    } catch (error) {
        console.error('Error in updateAdminSetting:', error);
        res.status(500).json({
            status: false,
            message: 'Error updating AdminSetting',
            error: error.message,
        });
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
        res.status(500).json({ status: false, message: 'Error deleting AdminSetting', error: error.message });
    }
};

module.exports = {
    createAdminSetting,
    getAllAdminSettings,
    getAdminSettingById,
    updateAdminSetting,
    deleteAdminSetting,
};
