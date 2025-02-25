// File: controllers/videoController.js
const AddVideo = require('../models/active_user_add_model');

exports.createActiveUserAdd = async (req, res) => {
    try {
        const { title, category, url } = req.body;
        const thumbnail = req.files.thumbnail ? req.files.thumbnail[0].path : null;
        const video = req.files.video ? req.files.video[0].path : null;

        // if (!thumbnail || !video) {
        //     return res.status(400).json({ status: false, message: 'Thumbnail and video are required.' });
        // }

        const newVideo = await AddVideo.create({ title, category, thumbnail, url, video });
        res.status(201).json({ status: true, message: "created active user add  successfully", data: newVideo });
    } catch (error) {
        res.status(500).json({ status: false, message: "active user add uploaded unsuccessfully", error: error.message });
    }
};

exports.getAllActiveUserAdd = async (req, res) => {
    try {
        const videos = await AddVideo.findAll({
            order: [['createdAt', 'DESC']], 
        });
        res.status(200).json({ status: true, message: "get all active user add", data: videos });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

exports.getActiveUserAddId = async (req, res) => {
    try {
        const video = await AddVideo.findByPk(req.params.id);

        if (!video) {
            return res.status(404).json({ status: false, error: 'Video not found.' });
        }

        res.status(200).json({ status: true, message: "get active user add successfully", data: video });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.updateActiveUserAddId = async (req, res) => {
    try {
        const { title, category, url } = req.body;
        const video = await AddVideo.findByPk(req.params.id);

        if (!video) {
            return res.status(404).json({status: false, error: 'Video not found.' });
        }

        const updatedFields = {
            title,
            category,
            url,
            thumbnail: req.files.thumbnail ? req.files.thumbnail[0].path : video.thumbnail,
            video: req.files.video ? req.files.video[0].path : video.video,
        };

        await video.update(updatedFields);
        res.status(200).json({ status: true, message: "active user add update successfully",data:video});
    } catch (error) {
        res.status(500).json({status: false, error: error.message });
    }
};

exports.deleteActiveUserAddId = async (req, res) => {
    try {
        const video = await AddVideo.findByPk(req.params.id);

        if (!video) {
            return res.status(404).json({status: false, error: 'Video not found.' });
        }

        await video.destroy();
        res.status(200).json({ status: true, message: 'active user add deleted successfully.' });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};
