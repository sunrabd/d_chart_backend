const Winner = require('../models/winner_model');
const upload = require('../middleware/upload');

// Create Winner

// Create Winner
const createWinner = async (req, res) => {
    const uploadSingle = upload.single('profile_picture');

    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, message: err.message });
        }

        const { name, win_price } = req.body;
        const profile_picture = req.file ? `/uploads/${req.file.filename}` : null;

        try {
            const newWinner = await Winner.create({
                profile_picture,
                name,
                win_price,
            });

            res.status(201).json({
                status: true,
                message: 'Winner created successfully',
                data: newWinner,
            });
        } catch (error) {
            console.error('Error in createWinner:', error);
            res.status(500).json({ status: false, message: 'Error creating winner', error: error.message });
        }
    });
};

// Update Winner
const updateWinner = async (req, res) => {
    const uploadSingle = upload.single('profile_picture');

    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, message: err.message });
        }

        const { id } = req.params;
        const { name, win_price } = req.body;
        const profile_picture = req.file ? `/uploads/${req.file.filename}` : null;

        try {
            const winner = await Winner.findByPk(id);
            if (!winner) {
                return res.status(404).json({ status: false, message: 'Winner not found' });
            }

            winner.name = name || winner.name;
            winner.win_price = win_price || winner.win_price;
            if (profile_picture) {
                winner.profile_picture = profile_picture;
            }

            await winner.save();

            res.status(200).json({
                status: true,
                message: 'Winner updated successfully',
                data: winner,
            });
        } catch (error) {
            console.error('Error in updateWinner:', error);
            res.status(500).json({ status: false, message: 'Error updating winner', error: error.message });
        }
    });
};

// Get All Winners
const getAllWinners = async (req, res) => {
    try {
        const winners = await Winner.findAll({
            order: [['createdAt', 'DESC']], 
        });
        res.status(200).json({
            status: true,
            message: 'Winners fetched successfully',
            data: winners,
        });
    } catch (error) {
        console.error('Error in getAllWinners:', error);
        res.status(500).json({ message: 'Error fetching winners', error: error.message });
    }
};

// Get Winner by ID
const getWinnerById = async (req, res) => {
    try {
        const { id } = req.params;
        const winner = await Winner.findByPk(id);

        if (!winner) {
            return res.status(404).json({ status: false, message: 'Winner not found' });
        }

        res.status(200).json({
            status: true,
            message: 'Winner fetched successfully',
            data: winner,
        });
    } catch (error) {
        console.error('Error in getWinnerById:', error);
        res.status(500).json({ message: 'Error fetching winner by ID', error: error.message });
    }
};


// Delete Winner
const deleteWinner = async (req, res) => {
    try {
        const { id } = req.params;
        const winner = await Winner.findByPk(id);

        if (!winner) {
            return res.status(404).json({ status: false, message: 'Winner not found' });
        }

        await winner.destroy();

        res.status(200).json({
            status: true,
            message: 'Winner deleted successfully',
        });
    } catch (error) {
        console.error('Error in deleteWinner:', error);
        res.status(500).json({ message: 'Error deleting winner', error: error.message });
    }
};

module.exports = {
    createWinner,
    getAllWinners,
    getWinnerById,
    updateWinner,
    deleteWinner,
};
