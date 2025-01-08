const GameType = require('../models/game_type_model');

const upload = require('../middleware/upload');
exports.createGameType = async (req, res) => {
    const uploadSingle = upload.single('icon'); // File field name is 'icon'

    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, message: err.message });
        }

        const { name, is_active } = req.body; // Assuming additional fields like 'name' and 'description'
        const icon = req.file ? `/uploads/${req.file.filename}` : null;

        try {
            const gameType = await GameType.create({
                icon,
                name,
                is_active,
            });

            res.status(201).json({
                status: true,
                message: 'GameType created successfully',
                data: gameType,
            });
        } catch (error) {
            console.error('Error in createGameType:', error);
            res.status(500).json({ status: false, message: 'Error creating game type', error: error.message });
        }
    });
};

exports.getAllGameTypes = async (req, res) => {
    try {
        const gameTypes = await GameType.findAll();
        res.status(200).json({
            status: true,
            message: "All GameTypes fetched successfully",
            data: gameTypes,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
};

// Get a GameType by ID
exports.getGameTypeById = async (req, res) => {
    try {
        const gameType = await GameType.findByPk(req.params.id);
        if (!gameType) {
            return res.status(404).json({
                status: false,
                message: "GameType not found",
                data: null,
            });
        }
        res.status(200).json({
            status: true,
            message: "GameType fetched successfully",
            data: gameType,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
};

// Update a GameType
exports.updateGameType = async (req, res) => {
    const uploadSingle = upload.single('icon');
    uploadSingle(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, message: err.message });
        }
    
        const { id } = req.pramas;
        const {name , is_active} = req.body;
        const icon = req.file ? `/uploads/${req.file.filename}` : null;

        try {
        const gameType = await GameType.findByPk(req.params.id);
        if (!gameType) {
            return res.status(404).json({ status: false, message: 'Gametype not found' });
        }

        gameType.name = name || gameType.name;
        gameType.is_active = is_active || gameType.is_active;
        if (icon) {
            gameType.icon = icon;
        }

        await gameType.save();
        res.status(200).json({
            status: true,
            message: 'GameType updated successfully',
            data: gameType,
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: null,
      });
   
    }
});
}

// Delete a GameType
exports.deleteGameType = async (req, res) => {
    try {
        const gameType = await GameType.findByPk(req.params.id);
        if (!gameType) {
            return res.status(404).json({
                status: false,
                message: "GameType not found",
                data: null,
            });
        }
        await gameType.destroy();
        res.status(200).json({
            status: true,
            message: "GameType deleted successfully",
            data: null,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
};
