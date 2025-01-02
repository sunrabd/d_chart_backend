// checkload_controller.js
const CheckLoad = require('../models/load_check_model');
const MarketType = require('../models/market_type_model');
const User = require('../models/user_model');
const { Op } = require('sequelize');

// Create a new CheckLoad
const createCheckLoad = async (req, res) => {
    try {
        const data = await CheckLoad.create(req.body);
        res.status(201).json({ status: true, message: 'CheckLoad created successfully', data });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Error creating CheckLoad', error: error.message });
    }
};


const getAllCheckLoadsOpen = async (req, res) => {
    try {
        const { market_type ,start_date, end_date} = req.query;

        // Build where condition dynamically
        const whereCondition = {};
        if (market_type) {
            whereCondition.market_type = market_type;
        }
        if (start_date || end_date) {
            whereCondition.createdAt = {};
            if (start_date) {
                whereCondition.createdAt[Op.gte] = start_date; // Greater than or equal to start_date
            }
            if (end_date) {
                whereCondition.createdAt[Op.lte] = end_date; // Less than or equal to end_date
            }
        }


        const data = await CheckLoad.findAll({
            where: whereCondition,
            include: [
                {
                    model: MarketType,
                    as: 'marketType',
                },
                {
                    model: User,
                    as: 'user',
                },
            ],
        });

        let openDigitCounts = {};
        let closeDigitCounts = {};
        let openPannaDigitCount = {};
        let closePannaDigitCount = {};
        let jodiDigitCount = {};

        data.forEach(checkLoad => {
            // Count for open_digit
            if (checkLoad.open_digit) {
                checkLoad.open_digit.forEach(digit => {
                    if (openDigitCounts[digit]) {
                        openDigitCounts[digit]++;
                    } else {
                        openDigitCounts[digit] = 1;
                    }
                });
            }

            // Count for close_digit
            if (checkLoad.close_digit) {
                checkLoad.close_digit.forEach(digit => {
                    if (closeDigitCounts[digit]) {
                        closeDigitCounts[digit]++;
                    } else {
                        closeDigitCounts[digit] = 1;
                    }
                });
            }

            // Count for close_digit
            if (checkLoad.open_panna_digit) {
                checkLoad.open_panna_digit.forEach(digit => {
                    if (openPannaDigitCount[digit]) {
                        openPannaDigitCount[digit]++;
                    } else {
                        openPannaDigitCount[digit] = 1;
                    }
                });
            }

            if (checkLoad.close_panna_digit) {
                checkLoad.close_panna_digit.forEach(digit => {
                    if (closePannaDigitCount[digit]) {
                        closePannaDigitCount[digit]++;
                    } else {
                        closePannaDigitCount[digit] = 1;
                    }
                });
            }

            if (checkLoad.jodi_digit) {
                checkLoad.jodi_digit.forEach(digit => {
                    if (jodiDigitCount[digit]) {
                        jodiDigitCount[digit]++;
                    } else {
                        jodiDigitCount[digit] = 1;
                    }
                });
            }
        });

        const openDigitsResult = Object.keys(openDigitCounts).map(key => ({ [key]: openDigitCounts[key] }));
        const closeDigitsResult = Object.keys(closeDigitCounts).map(key => ({ [key]: closeDigitCounts[key] }));
        const openPannaDigitsResult = Object.keys(openPannaDigitCount).map(key => ({ [key]: openPannaDigitCount[key] }));
        const closePannaDigitsResult = Object.keys(closePannaDigitCount).map(key => ({ [key]: closePannaDigitCount[key] }));
        const jodiDigitsResult = Object.keys(jodiDigitCount).map(key => ({ [key]: jodiDigitCount[key] }));

        openDigitsResult.sort((a, b) => {
            const countA = Object.values(a)[0];
            const countB = Object.values(b)[0];
            return countB - countA;
        });

        closeDigitsResult.sort((a, b) => {
            const countA = Object.values(a)[0];
            const countB = Object.values(b)[0];
            return countB - countA;
        });

        openPannaDigitsResult.sort((a, b) => {
            const countA = Object.values(a)[0];
            const countB = Object.values(b)[0];
            return countB - countA;
        });

        closePannaDigitsResult.sort((a, b) => {
            const countA = Object.values(a)[0];
            const countB = Object.values(b)[0];
            return countB - countA;
        });

        jodiDigitsResult.sort((a, b) => {
            const countA = Object.values(a)[0];
            const countB = Object.values(b)[0];
            return countB - countA;
        });


        res.status(200).json({
            status: true,
            message: 'All CheckLoads fetched successfully',
            data: {
                openDigits: openDigitsResult,
                closeDigits: closeDigitsResult,
                openPannaDigits: openPannaDigitsResult,
                closePannaDigits: closePannaDigitsResult,
                jodiDigits: jodiDigitsResult,
            },
        });
    } catch (error) {
        console.error('Error in getAllCheckLoadsOpen:', error);
        res.status(500).json({ message: 'Error fetching CheckLoads', error: error.message });
    }
};


// Update a CheckLoad by id
const updateCheckLoad = async (req, res) => {
    try {
        const { id } = req.params;
        const [updated] = await CheckLoad.update(req.body, {
            where: { id },
        });

        if (updated) {
            const updatedCheckLoad = await CheckLoad.findByPk(id);
            res.status(200).json({
                status: true,
                message: 'CheckLoad updated successfully',
                data: updatedCheckLoad,
            });
        } else {
            res.status(404).json({
                status: false,
                message: 'CheckLoad not found for update',
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error updating CheckLoad',
            error: error.message,
        });
    }
};


const deleteCheckLoad = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await CheckLoad.destroy({
            where: { id },
        });

        if (deleted) {
            res.status(200).json({
                status: true,
                message: 'CheckLoad deleted successfully',
            });
        } else {
            res.status(404).json({
                status: false,
                message: 'CheckLoad not found for deletion',
            });
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Error deleting CheckLoad',
            error: error.message,
        });
    }
};





module.exports = {
    createCheckLoad,
    getAllCheckLoadsOpen,
    // getCheckLoadById,
    updateCheckLoad,
    deleteCheckLoad,
};


