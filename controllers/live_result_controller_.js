const LiveResult = require('../models/live_result_model');
const MarketType = require('../models/market_type_model');
const fs = require('fs');
const { Op } = require('sequelize');
const moment = require('moment'); 
const csvParser = require('csv-parser');

// Create a new LiveResult
// Create a new LiveResult
exports.createLiveResult = async (req, res) => {
    try {
        if (req.body.date) {
            req.body.date = moment(req.body.date, 'DD/MM/YYYY').format('YYYY-MM-DD');
        }

        const liveResult = await LiveResult.create(req.body);

        res.status(201).json({
            status: true,
            message: "LiveResult created successfully",
            data: liveResult,
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
};

// Get all LiveResults
exports.getAllLiveResults = async (req, res) => {
    try {
        const { market_type, start_date, end_date } = req.query;
        const whereCondition = {};

        // Add market_type filter if provided
        if (market_type) {
            whereCondition.market_type = market_type;
        }

        // Add date range filter if start_date and end_date are provided
        if (start_date && end_date) {
            whereCondition.date = {
                [Op.between]: [
                    moment(start_date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
                    moment(end_date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
                ],
            };
        } else if (start_date) {
            // Add filter for start_date only
            whereCondition.date = {
                [Op.gte]: moment(start_date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
            };
        } else if (end_date) {
            // Add filter for end_date only
            whereCondition.date = {
                [Op.lte]: moment(end_date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
            };
        }

        console.log('Filter Condition:', whereCondition);

        // Fetch data with the conditions
        const liveResults = await LiveResult.findAll({
            where: whereCondition,
            include: {
                model: MarketType,
                as: 'marketType',
            },
        });

        res.status(200).json({
            status: true,
            message: 'All LiveResults fetched successfully',
            data: liveResults,
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
};


// Get a LiveResult by ID
exports.getLiveResultById = async (req, res) => {
    try {
        const { market_type } = req.query;
        const { id } = req.params;

        const whereCondition = market_type ? { id, market_type } : { id };

        const liveResult = await LiveResult.findOne({
            where: whereCondition,
            include: {
                model: MarketType,
                as: 'marketType',
            },
        });

        if (!liveResult) {
            return res.status(404).json({
                status: false,
                message: "LiveResult not found",
                data: null,
            });
        }
        res.status(200).json({
            status: true,
            message: "LiveResult fetched successfully",
            data: liveResult,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
};

// Update a LiveResult
exports.updateLiveResult = async (req, res) => {
    try {
        const liveResult = await LiveResult.findByPk(req.params.id);
        if (!liveResult) {
            return res.status(404).json({
                status: false,
                message: "LiveResult not found",
                data: null,
            });
        }

        // Ensure the date is in the correct format before updating
        const liveResultData = req.body;
        if (liveResultData.date) {
            liveResultData.date = moment(liveResultData.date, 'DD/MM/YYYY').format('YYYY-MM-DD');
        }

        await liveResult.update(liveResultData);
        res.status(200).json({
            status: true,
            message: "LiveResult updated successfully",
            data: liveResult,
        });
    } catch (error) {
        res.status(400).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
};


exports.getLiveResultsByMarketTypeId = async (req, res) => {
    try {
        const { market_type_id } = req.params;

        const liveResults = await LiveResult.findAll({
            where: { market_type: market_type_id },
            include: {
                model: MarketType,
                as: 'marketType',// Fetch only id and name
            },
        });

        if (liveResults.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No LiveResults found for the specified market_type_id",
                data: null,
            });
        }

        res.status(200).json({
            status: true,
            message: "LiveResults fetched successfully",
            data: liveResults,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
};

// Delete a LiveResult
exports.deleteLiveResult = async (req, res) => {
    try {
        const liveResult = await LiveResult.findByPk(req.params.id);
        if (!liveResult) {
            return res.status(404).json({
                status: false,
                message: "LiveResult not found",
                data: null,
            });
        }
        await liveResult.destroy();
        res.status(200).json({
            status: true,
            message: "LiveResult deleted successfully",
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

// Upload LiveResults CSV
exports.uploadLiveResultsCSV = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: false,
                message: "Please upload a CSV file",
                data: null,
            });
        }

        const liveResults = [];
        const filePath = req.file.path;

        // Read and parse the CSV file
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (row) => {
                liveResults.push({
                    market_type: row.market_type,
                    open_panna: row.open_panna,
                    open_result: row.open_result,
                    close_panna: row.close_panna,
                    close_result: row.close_result,
                    jodi: row.jodi,
                    day: row.day,
                    date: moment(row.date, 'DD/MM/YYYY').format('YYYY-MM-DD'), // Convert date format
                });
            })
            .on('end', async () => {
                // Bulk insert into the database
                await LiveResult.bulkCreate(liveResults);
                res.status(201).json({
                    status: true,
                    message: "CSV file processed and LiveResults created successfully",
                    data: liveResults,
                });
            })
            .on('error', (error) => {
                res.status(500).json({
                    status: false,
                    message: error.message,
                    data: null,
                });
            });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message,
            data: null,
        });
    }
};
