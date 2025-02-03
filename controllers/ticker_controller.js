const Ticker = require('../models/ticker_model');

exports.createTicker = async (req, res) => {
    try {
        const ticker = await Ticker.create(req.body);
        res.status(201).json({status : false , message : "ticker created successfully. " , ticker});
    } catch (error) {
        res.status(500).json({status : false, error: error.message });
    }
};

exports.getAllTickers = async (req, res) => {
    try {
        const tickers = await Ticker.findAll();
        res.json({status : true , message : "Get all Ticker SuccessFully", tickers});
    } catch (error) {
        res.status(500).json({status:false, error: error.message });
    }
};

exports.getTickerById = async (req, res) => {
    try {
        const ticker = await Ticker.findByPk(req.params.id);
        if (!ticker) return res.status(404).json({status : false, message: 'Ticker not found' });
        res.json({status : true ,message : "Get ticker successfully", ticker});
    } catch (error) {
        res.status(500).json({status: false, error: error.message });
    }
};

exports.updateTicker = async (req, res) => {
    try {
        const [updated] = await Ticker.update(req.body, { where: { id: req.params.id } });
        if (!updated) return res.status(404).json({status : false, message: 'Ticker not found' });
        res.json({status:true, message: 'Ticker updated successfully' });
    } catch (error) {
        res.status(500).json({status: true, error: error.message });
    }
};

exports.deleteTicker = async (req, res) => {
    try {
        const deleted = await Ticker.destroy({ where: { id: req.params.id } });
        if (!deleted) return res.status(404).json({status: false, message: 'Ticker not found' });
        res.json({status: true, message: 'Ticker deleted successfully' });
    } catch (error) {
        res.status(500).json({status: false, error: error.message });
    }
};