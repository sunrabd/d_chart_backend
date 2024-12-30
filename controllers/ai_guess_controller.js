
const { Op } = require('sequelize');
const moment = require('moment');

const LiveResult = require('../models/live_result_model');

exports.getOpenResultFrequency = async (req, res) => {
    try {
        const { market_type, start_date, end_date } = req.query;

        // Build the where clause with optional filters
        const whereClause = {};
        if (market_type) {
            whereClause.market_type = market_type;
        }
        const whereCondition = {};
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

        const combinedWhere = {
            [Op.and]: [whereClause, whereCondition],
        };
        // Fetch data by applying filters
        const liveResults = await LiveResult.findAll({
            attributes: ['open_result'],
            where: combinedWhere,
        });

        const frequency = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
        };

        liveResults.forEach((result) => {
            const openResult = result.open_result;
            if (openResult) {
                [...openResult].forEach((char) => {
                    const num = parseInt(char, 10);
                    if (!isNaN(num)) {
                        frequency[num]++;
                    }
                });
            }
        });

        res.status(200).json({
            status: true,
            message: 'Frequency of open_result calculated successfully',
            data: frequency,
        });
    } catch (error) {
        console.error('Error calculating open_result frequency:', error);
        res.status(500).json({
            status: false,
            message: 'An error occurred while calculating the frequency',
        });
    }
};

// Function to calculate frequency for close_result, filtered by market_type
exports.getCloseResultFrequency = async (req, res) => {
    try {
        const { market_type ,start_date, end_date } = req.query;

        const whereClause = {};
        if (market_type) {
            whereClause.market_type = market_type;
        }
        const whereCondition = {};

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

        const combinedWhere = {
            [Op.and]: [whereClause, whereCondition],
        };


        // Filter data by market_type if provided
        const liveResults = await LiveResult.findAll({
            attributes: ['close_result'],
            where:combinedWhere,
        });

        const frequency = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
            9: 0,
        };

        liveResults.forEach((result) => {
            const closeResult = result.close_result;
            if (closeResult) {
                [...closeResult].forEach((char) => {
                    const num = parseInt(char, 10);
                    if (!isNaN(num)) {
                        frequency[num]++;
                    }
                });
            }
        });

        res.status(200).json({
            status: true,
            message: 'Frequency of close_result calculated successfully',
            data: frequency,
        });
    } catch (error) {
        console.error('Error calculating close_result frequency:', error);
        res.status(500).json({
            status: false,
            message: 'An error occurred while calculating the frequency',
        });
    }
};

exports.getOpenPannaDigitFrequency = async (req, res) => {
    try {
        const { sum, market_type  ,start_date, end_date} = req.query;

        const whereClause = {};
        if (market_type) {
            whereClause.market_type = market_type;
        }

        const whereCondition = {};
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

        const combinedWhere = {
            [Op.and]: [whereClause, whereCondition],
        };

        
        // Validate the sum query parameter
        if (sum === undefined || isNaN(sum)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid query parameter. Please provide a valid sum value.',
            });
        }

        const targetSum = parseInt(sum, 10);
        const result = [];

        

        // Generate all 3-digit numbers
        for (let i = 100; i <= 999; i++) {
            const digits = String(i).split('').map(Number);
            const digitSum = digits.reduce((a, b) => a + b, 0);

            // Include numbers whose digit sum matches targetSum or where the unit digit of sum matches targetSum
            if (digitSum === targetSum || digitSum % 10 === targetSum) {
                result.push({ [i]: 0 }); // Initialize count as 0
            }
        }


        // Fetch all open_panna values filtered by market_type
        const liveResults = await LiveResult.findAll({
            where: combinedWhere,
            attributes: ['open_panna'],
        });

        // Count the frequency of matching open_panna
        liveResults.forEach((row) => {
            const openPanna = row.open_panna;

            result.forEach((item) => {
                const number = parseInt(Object.keys(item)[0], 10);
                if (number === parseInt(openPanna, 10)) {
                    item[number] += 1; // Increment count
                }
            });
        });

        res.status(200).json({
            status: true,
            message: `Numbers with digit sum ${targetSum} or unit digit ${targetSum} generated successfully`,
            data: result,
        });
    } catch (error) {
        console.error('Error generating numbers:', error);
        res.status(500).json({
            status: false,
            message: 'An error occurred while generating the numbers',
        });
    }
};

exports.getClosePannaDigitFrequency = async (req, res) => {
    try {
        const { sum, market_type  ,start_date, end_date} = req.query;

        // const { sum, market_type  ,start_date, end_date} = req.query;

        const whereClause = {};
        if (market_type) {
            whereClause.market_type = market_type;
        }

        const whereCondition = {};
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

        const combinedWhere = {
            [Op.and]: [whereClause, whereCondition],
        };


        // Validate the sum query parameter
        if (sum === undefined || isNaN(sum)) {
            return res.status(400).json({
                status: false,
                message: 'Invalid query parameter. Please provide a valid sum value.',
            });
        }

        const targetSum = parseInt(sum, 10);
        const result = [];

        // Generate all 3-digit numbers
        for (let i = 100; i <= 999; i++) {
            const digits = String(i).split('').map(Number);
            const digitSum = digits.reduce((a, b) => a + b, 0);

            // Include numbers whose digit sum matches targetSum or where the unit digit of sum matches targetSum
            if (digitSum === targetSum || digitSum % 10 === targetSum) {
                result.push({ [i]: 0 }); // Initialize count as 0
            }
        }

        // Query conditions for filtering by market_type if provided
        // const whereCondition = market_type ? { market_type } : {};

        // Fetch all close_panna values filtered by market_type
        const liveResults = await LiveResult.findAll({
            where: combinedWhere,
            attributes: ['close_panna'],
        });

        // Count the frequency of matching close_panna
        liveResults.forEach((row) => {
            const closePanna = row.close_panna;

            result.forEach((item) => {
                const number = parseInt(Object.keys(item)[0], 10);
                if (number === parseInt(closePanna, 10)) {
                    item[number] += 1;
                }
            });
        });

        res.status(200).json({
            status: true,
            message: `Numbers with digit sum ${targetSum} or unit digit ${targetSum} generated successfully for close_panna`,
            data: result,
        });
    } catch (error) {
        console.error('Error generating numbers for close_panna:', error);
        res.status(500).json({
            status: false,
            message: 'An error occurred while generating the numbers for close_panna',
        });
    }
};

exports.getJodiFrequency = async (req, res) => {
    try {
        const { sum, market_type ,start_date, end_date} = req.query;

        // const { sum, market_type  ,start_date, end_date} = req.query;

        const whereClause = {};
        if (market_type) {
            whereClause.market_type = market_type;
        }

        const whereCondition = {};
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

        const combinedWhere = {
            [Op.and]: [whereClause, whereCondition],
        };

        // Validate the sum parameter
        if (sum === undefined || isNaN(sum) || sum < 0 || sum > 9) {
            return res.status(400).json({
                status: false,
                message: 'Invalid query parameter. Please provide a valid sum (0-9).',
            });
        }

        const digit = parseInt(sum, 10);

        // Generate the list of Jodis based on the sum
        const jodiList = [];
        for (let i = 0; i <= 9; i++) {
            jodiList.push(`${i}${digit}`); // Prefix sum
            jodiList.push(`${digit}${i}`); // Suffix sum
        }

        // Initialize frequency object
        const frequency = {};
        jodiList.forEach((jodi) => {
            frequency[jodi] = 0; // Initialize count as 0
        });

        // Query conditions for filtering by market_type if provided
        // const whereCondition = market_type ? { market_type } : {};

        // Fetch all open_result and close_result values filtered by market_type
        const liveResults = await LiveResult.findAll({
            where: combinedWhere,
            attributes: ['open_result', 'close_result'],
        });

        // Calculate Jodi and count matches
        liveResults.forEach((row) => {
            const { open_result, close_result } = row;

            if (open_result && close_result) {
                const jodi = `${open_result}${close_result}`; // Form the Jodi, e.g., "47"

                if (frequency[jodi] !== undefined) {
                    frequency[jodi]++; // Increment count for matching Jodi
                }
            }
        });

        // Convert frequency object into desired format
        const formattedData = Object.entries(frequency).map(([key, value]) => ({
            [key]: value,
        }));

        res.status(200).json({
            status: true,
            message: `Numbers with digit sum ${digit} or unit digit ${digit} generated successfully`,
            data: formattedData,
        });
    } catch (error) {
        console.error('Error calculating Jodi frequency:', error);
        res.status(500).json({
            status: false,
            message: 'An error occurred while calculating the Jodi frequency',
        });
    }
};