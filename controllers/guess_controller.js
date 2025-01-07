const AddGuess = require('../models/add_guess_model');
const MarketType = require('../models/market_type_model');
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

    // Construct the `createdAt` filter
    const whereCondition = {};
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      if (startDate) whereCondition.createdAt[Op.gte] = startDate; // Start date filter
      if (endDate) whereCondition.createdAt[Op.lte] = endDate;   // End date filter
    }

    // Fetch data with optional date filtering and associations
    const addGuesses = await AddGuess.findAll({
      where: whereCondition, // Apply the constructed filter
      include: [
        {
          model: MarketType,
          as: 'marketType', // Include associated MarketType data
        },
      ],
    });

    res.status(200).json({
      status: true,
      message: 'AddGuesses fetched successfully',
      data: addGuesses,
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
// Get AddGuess by ID, Market Type, or Game Type
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
