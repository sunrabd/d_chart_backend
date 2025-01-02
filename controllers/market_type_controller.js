const MarketType = require('../models/market_type_model');
const GameType = require('../models/game_type_model'); 
const fs = require('fs');
const csvParser = require('csv-parser'); 
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');


// Create a new MarketType
exports.createMarketType = async (req, res) => {
  try {
    const { name, start_time, open_close_time, close_close_time, is_active } = req.body;

    // Create the MarketType entry with the new fields
    const marketType = await MarketType.create({
      name,
      start_time,
      open_close_time,
      close_close_time,
      is_active,
    });

    res.status(201).json({
      status: true,
      message: "MarketType created successfully",
      data: marketType,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

//upload csv data
exports.uploadMarketTypesCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: false,
        message: 'No file uploaded',
        data: null,
      });
    }

    const marketTypes = [];
    const filePath = req.file.path;
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (row) => {
        const { name, start_time, open_close_time, close_close_time, is_active } = row;
        if (name && start_time && open_close_time && close_close_time && is_active !== undefined) {
          marketTypes.push({
            name,
            start_time,
            open_close_time,
            close_close_time,
            is_active: is_active.toLowerCase() === 'true',
          });
        }
      })
      .on('end', async () => {
        try {
          await MarketType.bulkCreate(marketTypes);

          res.status(201).json({
            status: true,
            message: 'MarketTypes uploaded and saved successfully',
            data: marketTypes,
          });
        } catch (error) {
          fs.unlinkSync(filePath); 
          res.status(500).json({
            status: false,
            message: error.message,
            data: null,
          });
        }
      })
      .on('error', (error) => {
        res.status(500).json({
          status: false,
          message: `Error parsing CSV file: ${error.message}`,
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

// Get all MarketTypes
exports.getAllMarketTypes = async (req, res) => {
  try {
    const marketTypes = await MarketType.findAll();
    res.status(200).json({
      status: true,
      message: "All MarketTypes fetched successfully",
      data: marketTypes,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

// Get a MarketType by ID
exports.getMarketTypeById = async (req, res) => {
  try {
    const marketType = await MarketType.findByPk(req.params.id);
    if (!marketType) {
      return res.status(404).json({
        status: false,
        message: "MarketType not found",
        data: null,
      });
    }
    res.status(200).json({
      status: true,
      message: "MarketType fetched successfully",
      data: marketType,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

// Update a MarketType
exports.updateMarketType = async (req, res) => {
  try {
    const marketType = await MarketType.findByPk(req.params.id);
    if (!marketType) {
      return res.status(404).json({
        status: false,
        message: "MarketType not found",
        data: null,
      });
    }

    // Update the market type with the new data
    await marketType.update(req.body);
    res.status(200).json({
      status: true,
      message: "MarketType updated successfully",
      data: marketType,
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};


exports.deleteMarketType = async (req, res) => {
  try {
    const { id } = req.params;
    const marketType = await MarketType.findByPk(id);

    if (!marketType) {
      return res.status(404).json({
        status: false,
        message: "MarketType not found",
        data: null,
      });
    }

    // Delete the MarketType
    await marketType.destroy();

    res.status(200).json({
      status: true,
      message: "MarketType deleted successfully",
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

// Get all GameTypes by MarketType ID
exports.getAllGameTypesByMarketTypeId = async (req, res) => {
  try {
    const { market_type_id } = req.params;

    // Fetch the MarketType with associated GameTypes
    const marketType = await MarketType.findOne({
      where: { id: market_type_id },
      include: [
        {
          model: GameType,
          as: 'gameTypes',
          attributes: ['id', 'name', 'is_active'], // Adjust attributes as needed
        },
      ],
    });

    if (!marketType) {
      return res.status(404).json({
        status: false,
        message: "MarketType not found",
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      message: "MarketType with associated GameTypes fetched successfully",
      data: marketType,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

// Get all GameTypes by MarketType ID
exports.getAllGameTypesByMarketTypeId = async (req, res) => {
  try {
    const { market_type_id } = req.params;

    // Fetch the MarketType with associated GameTypes
    const marketType = await MarketType.findOne({
      where: { id: market_type_id },
      include: [
        {
          model: GameType,
          as: 'gameTypes',
          attributes: ['id', 'name', 'is_active'],
        },
      ],
    });

    if (!marketType) {
      return res.status(404).json({
        status: false,
        message: "MarketType not found",
        data: null,
      });
    }

    res.status(200).json({
      status: true,
      message: "MarketType with associated GameTypes fetched successfully",
      data: marketType,
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};


exports.getMarketTypesNotInLiveResults = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Fetch market types not in today's live results
    const marketTypes = await MarketType.findAll({
      where: {
        id: {
          [Op.notIn]: sequelize.literal(`
            (SELECT DISTINCT market_type 
             FROM live_result 
             WHERE DATE(date) = '${today}')
          `),
        },
      },
    });

    res.status(200).json({
      status: true,
      message: "MarketTypes without today's LiveResult fetched successfully",
      data: marketTypes,
    });
  } catch (error) {
    console.error("Error fetching MarketTypes:", error);
    res.status(500).json({
      status: false,
      message: error.message,
      data: null,
    });
  }
};

exports.getAllMarketTypesWithLiveResults = async (req, res) => {
  try {
      const marketTypes = await MarketType.findAll({
          include: [
              {
                  model: LiveResult,
                  as: 'liveResults',
                  required: false,
              },
          ],
      });

      res.status(200).json({
          status: true,
          message: 'All MarketTypes with LiveResults fetched successfully',
          data: marketTypes,
      });
  } catch (error) {
      res.status(500).json({
          status: false,
          message: error.message,
          data: null,
      });
  }
};