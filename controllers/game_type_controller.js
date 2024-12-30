const GameType = require('../models/game_type_model');

exports.createGameType = async (req, res) => {
    try {
        const { file } = req; // Access uploaded file
        const payload = req.body;

        if (file) {
            payload.icon = `/uploads/${file.filename}`; // Set file path
        }

        const gameType = await GameType.create(payload);
        res.status(201).json({
            status: true,
            message: 'GameType created successfully',
            data: gameType,
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
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
    try {
        const { file } = req;
        const payload = req.body;

        const gameType = await GameType.findByPk(req.params.id);
        if (!gameType) {
            return res.status(404).json({
                status: false,
                message: 'GameType not found',
                data: null,
            });
        }

        if (file) {
            payload.icon = `/uploads/${file.filename}`;
        }

        await gameType.update(payload);
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
};

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
