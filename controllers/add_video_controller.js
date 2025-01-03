// File: controllers/videoController.js
const AddVideo = require('../models/add_video_model');

exports.createVideo = async (req, res) => {
    try {
        const { title, category, url } = req.body;
        const thumbnail = req.files.thumbnail ? req.files.thumbnail[0].path : null;
        const video = req.files.video ? req.files.video[0].path : null;

        if (!thumbnail || !video) {
            return res.status(400).json({ status: false, message: 'Thumbnail and video are required.' });
        }

        const newVideo = await AddVideo.create({ title, category, thumbnail, url, video });
        res.status(201).json({ status: true, message: "video uploaded successfully", data: newVideo });
    } catch (error) {
        res.status(500).json({ status: false, message: "video uploaded unsuccessfully", error: error.message });
    }
};

exports.getAllVideos = async (req, res) => {
    try {
        const videos = await AddVideo.findAll({
            order: [['createdAt', 'DESC']], 
        });
        res.status(200).json({ status: true, message: "get all video's", data: videos });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

exports.getVideoById = async (req, res) => {
    try {
        const video = await AddVideo.findByPk(req.params.id);

        if (!video) {
            return res.status(404).json({ status: false, error: 'Video not found.' });
        }

        res.status(200).json({ status: true, message: "get video successfully", data: video });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

exports.updateVideo = async (req, res) => {
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
        res.status(200).json({ status: true, message: "video update successfully",data:video});
    } catch (error) {
        res.status(500).json({status: false, error: error.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        const video = await AddVideo.findByPk(req.params.id);

        if (!video) {
            return res.status(404).json({status: false, error: 'Video not found.' });
        }

        await video.destroy();
        res.status(200).json({ status: true, message: 'Video deleted successfully.' });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};
