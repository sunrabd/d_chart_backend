// checkload_controller.js
const CheckLoad = require('../models/load_check_model');
const MarketType = require('../models/market_type_model');
const User = require('../models/user_model');
const { Op } = require('sequelize');

const createCheckLoad = async (req, res) => {
    try {
        const { market_type, user_id, open_digit, close_digit, jodi_digit, open_panna_digit, close_panna_digit } = req.body;

        // User role check (Assuming you have a User model)
        const user = await User.findByPk(user_id);
        const isAdmin = user && (user.role === 'admin' || user.role === 'subadmin');

        if (!isAdmin) {
            const existingCheckLoads = await CheckLoad.findAll({ where: { market_type, user_id } });

            const hasDuplicate = (arr1, arr2) => {
                if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
                return arr1.some(value => arr2.includes(value));
            };

            let duplicateNumbers = [];

            for (let record of existingCheckLoads) {
                if (hasDuplicate(record.open_digit, open_digit)) {
                    duplicateNumbers.push(`open_digit: ${open_digit}`);
                }
                if (hasDuplicate(record.close_digit, close_digit)) {
                    duplicateNumbers.push(`close_digit: ${close_digit}`);
                }
                if (hasDuplicate(record.jodi_digit, jodi_digit)) {
                    duplicateNumbers.push(`jodi_digit: ${jodi_digit}`);
                }
                if (hasDuplicate(record.open_panna_digit, open_panna_digit)) {
                    duplicateNumbers.push(`open_panna_digit: ${open_panna_digit}`);
                }
                if (hasDuplicate(record.close_panna_digit, close_panna_digit)) {
                    duplicateNumbers.push(`close_panna_digit: ${close_panna_digit}`);
                }
            }

            if (duplicateNumbers.length > 0) {
                return res.status(201).json({
                    status: true,
                    message: `Numbers already exist ${duplicateNumbers.join(', ')}`
                });
            }
        }

        const data = await CheckLoad.create(req.body);
        res.status(201).json({ status: true, message: 'CheckLoad created successfully', data });

    } catch (error) {
        res.status(500).json({ status: false, message: 'Error creating CheckLoad', error: error.message });
    }
};

// Get all open checkloads
const getAllCheckLoadsOpen = async (req, res) => {
    try {
        const { market_type, start_date, end_date } = req.query;

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
        let openPannaDigitCounts = {};
        let closePannaDigitCounts = {};
        let jodiDigitCounts = {};

        data.forEach((checkLoad) => {
            // Count for open_digit
            if (checkLoad.open_digit) {
                checkLoad.open_digit.forEach((digit) => {
                    const incrementValue = checkLoad.open_digit_count || 1;
                    const decrementValue = checkLoad.open_digit_decrement_count || 0;
                    const finalValue = incrementValue - decrementValue;
        
                    openDigitCounts[digit] = (openDigitCounts[digit] || 0) + finalValue;
                });
            }
        
            // Count for close_digit
            if (checkLoad.close_digit) {
                checkLoad.close_digit.forEach((digit) => {
                    const incrementValue = checkLoad.close_digit_count || 1;
                    const decrementValue = checkLoad.close_digit_decrement_count || 0;
                    const finalValue = incrementValue - decrementValue;
        
                    closeDigitCounts[digit] = (closeDigitCounts[digit] || 0) + finalValue;
                });
            }
        
            // Count for jodi_digit
            if (checkLoad.jodi_digit) {
                checkLoad.jodi_digit.forEach((digit) => {
                    const incrementValue = checkLoad.jodi_digit_count || 1;
                    const decrementValue = checkLoad.jodi_digit_decrement_count || 0;
                    const finalValue = incrementValue - decrementValue;
        
                    jodiDigitCounts[digit] = (jodiDigitCounts[digit] || 0) + finalValue;
                });
            }
        
            // Count for open_panna_digit
            if (checkLoad.open_panna_digit) {
                checkLoad.open_panna_digit.forEach((digit) => {
                    const incrementValue = checkLoad.open_panna_digit_count || 1;
                    const decrementValue = checkLoad.open_panna_decrement_count || 0;
                    const finalValue = incrementValue - decrementValue;
        
                    openPannaDigitCounts[digit] = (openPannaDigitCounts[digit] || 0) + finalValue;
                });
            }
        
            // Count for close_panna_digit
            if (checkLoad.close_panna_digit) {
                checkLoad.close_panna_digit.forEach((digit) => {
                    const incrementValue = checkLoad.close_panna_digit_count || 1;
                    const decrementValue = checkLoad.close_panna_decrement_count || 0;
                    const finalValue = incrementValue - decrementValue;
        
                    closePannaDigitCounts[digit] = (closePannaDigitCounts[digit] || 0) + finalValue;
                });
            }
        });

        // Convert to sorted results
        const openDigitsResult = Object.keys(openDigitCounts)
            .map((key) => ({ [key]: openDigitCounts[key] }))
            .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

        const closeDigitsResult = Object.keys(closeDigitCounts)
            .map((key) => ({ [key]: closeDigitCounts[key] }))
            .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

        const openPannaDigitsResult = Object.keys(openPannaDigitCounts)
            .map((key) => ({ [key]: openPannaDigitCounts[key] }))
            .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

        const closePannaDigitsResult = Object.keys(closePannaDigitCounts)
            .map((key) => ({ [key]: closePannaDigitCounts[key] }))
            .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

        const jodiDigitsResult = Object.keys(jodiDigitCounts)
            .map((key) => ({ [key]: jodiDigitCounts[key] }))
            .sort((a, b) => Object.values(b)[0] - Object.values(a)[0]);

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


const getLoadCheckByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Fetch CheckLoad data based on the user_id
        const data = await CheckLoad.findAll({
            where: { user_id },
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

        if (!data || data.length === 0) {
            return res.status(404).json({ status: false, message: 'No CheckLoads found for this user.' });
        }

        res.status(200).json({
            status: true,
            message: 'CheckLoads fetched successfully for user',
            data,
        });
    } catch (error) {
        console.error('Error in getLoadCheckByUserId:', error);
        res.status(500).json({ status: false, message: 'Error fetching CheckLoads by user', error: error.message });
    }
};


module.exports = {
    createCheckLoad,
    getAllCheckLoadsOpen,
    getLoadCheckByUserId,
    updateCheckLoad,
    deleteCheckLoad,
};


