const Advertisement = require('../models/advertisement_model');
const upload = require('../middleware/upload');

// Create an advertisement
exports.createAdvertisement = async (req, res) => {
    const uploadFields = upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'video', maxCount: 1 },
    ]);

    uploadFields(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, message: err.message });
        }

        const { url, button_text,button_text_color,button_backround_color } = req.body;
        const photo = req.files['photo'] ? `/uploads/${req.files['photo'][0].filename}` : null;
        const video = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

        try {
            const newAdvertisement = await Advertisement.create({
                photo,
                video,
                url,
                button_text,
                button_text_color,
                button_backround_color,
            });

            res.status(201).json({
                status: true,
                message: 'Advertisement created successfully',
                data: newAdvertisement,
            });
        } catch (error) {
            console.error('Error creating advertisement:', error);
            res.status(500).json({ status: false, message: 'Error creating advertisement', error: error.message });
        }
    });
};

// Get all advertisements
exports.getAdvertisements = async (req, res) => {
    try {
        const advertisements = await Advertisement.findAll();
        res.status(200).json({ status: true, data: advertisements });
    } catch (error) {
        console.error('Error fetching advertisements:', error);
        res.status(500).json({ status: false, message: 'Error fetching advertisements', error: error.message });
    }
};

// Get advertisement by ID
exports.getAdvertisementById = async (req, res) => {
    const { id } = req.params;

    try {
        const advertisement = await Advertisement.findByPk(id);
        if (!advertisement) {
            return res.status(404).json({ status: false, message: 'Advertisement not found' });
        }

        res.status(200).json({ status: true, data: advertisement });
    } catch (error) {
        console.error('Error fetching advertisement:', error);
        res.status(500).json({ status: false, message: 'Error fetching advertisement', error: error.message });
    }
};

// Update an advertisement
exports.updateAdvertisement = async (req, res) => {
    const { id } = req.params;

    const uploadFields = upload.fields([
        { name: 'photo', maxCount: 1 },
        { name: 'video', maxCount: 1 },
    ]);

    uploadFields(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, message: err.message });
        }

        const { url, button_text,button_text_color, button_backround_color } = req.body;
        const photo = req.files['photo'] ? `/uploads/${req.files['photo'][0].filename}` : null;
        const video = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : null;

        try {
            const advertisement = await Advertisement.findByPk(id);
            if (!advertisement) {
                return res.status(404).json({ status: false, message: 'Advertisement not found' });
            }

            await advertisement.update({
                photo: photo || advertisement.photo,
                video: video || advertisement.video,
                url,
                button_text,
                button_text_color,
                button_backround_color,
            });

            res.status(200).json({
                status: true,
                message: 'Advertisement updated successfully',
                data: advertisement,
            });
        } catch (error) {
            console.error('Error updating advertisement:', error);
            res.status(500).json({ status: false, message: 'Error updating advertisement', error: error.message });
        }
    });
};

// Delete an advertisement
exports.deleteAdvertisement = async (req, res) => {
    const { id } = req.params;

    try {
        const advertisement = await Advertisement.findByPk(id);
        if (!advertisement) {
            return res.status(404).json({ status: false, message: 'Advertisement not found' });
        }

        await advertisement.destroy();
        res.status(200).json({ status: true, message: 'Advertisement deleted successfully' });
    } catch (error) {
        console.error('Error deleting advertisement:', error);
        res.status(500).json({ status: false, message: 'Error deleting advertisement', error: error.message });
    }
};
