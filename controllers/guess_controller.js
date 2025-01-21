const AddGuess = require('../models/add_guess_model');
const MarketType = require('../models/market_type_model');
const LiveResult = require('../models/live_result_model');
const moment = require('moment');
 // Adjust according to your file structure

const { Op } = require('sequelize');


// Create a new AddGuess
exports.createAddGuess = async (req, res) => {
  try {
    const addGuess = await AddGuess.create(req.body);
    res.status(201).json({
      status: true,
      message: "AddGuess created successfully",
      data: addGuess,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};
exports.getAllAddGuesses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Get today's date
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Construct the `createdAt` filter
    const whereCondition = {};
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt[Op.gte] = startDate; // Start date filter
      if (endDate) whereCondition.createdAt[Op.lte] = endDate;   // End date filter
    }

    // Fetch AddGuesses with the optional date filter
    const addGuesses = await AddGuess.findAll({
      where: whereCondition, // Apply the constructed filter
      include: [
        {
          model: MarketType,
          as: 'marketType', // Include associated MarketType data
        },
      ],
    });

    // Fetch LiveResults based on market_type ids for today
    const marketTypeIds = addGuesses.map((addGuess) => addGuess.market_type);
    const liveResults = await LiveResult.findAll({
      where: {
        market_type: {
          [Op.in]: marketTypeIds,
        },
        // Filter for today's live results
        date: {
          [Op.startsWith]: today, // Match today's date (yyyy-mm-dd)
        },
      },
      order: [['date', 'DESC']], // Sorting live results by date (descending)
    });

    // Map the live results into the addGuesses data
    const result = addGuesses.map((addGuess) => {
      const marketTypeLiveResults = liveResults.filter(
        (liveResult) => liveResult.market_type === addGuess.market_type
      );

      return {
        ...addGuess.toJSON(),
        marketType: {
          ...addGuess.marketType.toJSON(),
          liveResults: marketTypeLiveResults.map((result) => ({
            id: result.id,
            openPanna: result.open_panna || null,
            openResult: result.open_result || null,
            closePanna: result.close_panna || null,
            closeResult: result.close_result || null,
            jodi: result.jodi || null,
            day: result.day || null,
            date: result.date ? moment(result.date).format('YYYY/MM/DD') : null,
            createdAt: moment(result.createdAt).format('YYYY-MM-DD HH:mm:ss'),
          })),
        },
      };
    });

    res.status(200).json({
      status: true,
      message: 'AddGuesses fetched successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in getAllAddGuesses:', error);
    res.status(500).json({
      status: false,
      message: 'Error fetching AddGuesses',
      error: error.message,
    });
  }
};

exports.getAddGuessByIdAndTypes = async (req, res) => {
  try {
    const { id } = req.params;
    const { market_type, game_type } = req.query;

    const whereCondition = { 
      ...(id && { id }), 
      ...(market_type && { market_type }), 
      ...(game_type && { game_type }) 
    };

    const addGuess = await AddGuess.findOne({
      where: whereCondition,
      include: [
        {
          model: MarketType,
          as: 'marketType',
        },
      ],
    });

    if (!addGuess) {
      return res.status(404).json({
        status: false,
        message: "AddGuess not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "AddGuess fetched successfully",
      data: addGuess,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

// Update AddGuess by ID
exports.updateAddGuess = async (req, res) => {
  try {
    const addGuess = await AddGuess.findByPk(req.params.id);
    if (!addGuess) {
      return res.status(404).json({
        status: false,
        message: "AddGuess not found",
      });
    }

    await addGuess.update(req.body);
    res.status(200).json({
      status: true,
      message: "AddGuess updated successfully",
      data: addGuess,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

// Delete AddGuess by ID
exports.deleteAddGuess = async (req, res) => {
  try {
    const addGuess = await AddGuess.findByPk(req.params.id);
    if (!addGuess) {
      return res.status(404).json({
        status: false,
        message: "AddGuess not found",
      });
    }

    await addGuess.destroy();
    res.status(200).json({
      status: true,
      message: "AddGuess deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};
