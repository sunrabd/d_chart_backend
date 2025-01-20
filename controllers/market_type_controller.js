const MarketType = require('../models/market_type_model');
const GameType = require('../models/game_type_model');
const LiveResult = require('../models/live_result_model');
const fs = require('fs');
const csvParser = require('csv-parser');
const { Op } = require('sequelize');
const moment = require('moment');
const { sequelize } = require('../config/db');


// Create a new MarketType
exports.createMarketType = async (req, res) => {
  try {
    const { name, start_time, open_close_time,is_loading, position, close_close_time, is_active, is_selected, jodi_background, color, jodi_url, pannel_background, pannel_url } = req.body;



    if (position) {
      const existingMarketType = await MarketType.findOne({
        where: { position },
      });

      if (existingMarketType) {
        return res.status(400).json({
          status: false,
          message: `Position already set for MarketType: ${existingMarketType.name}`,
          data: null,
        });
      }
    }

    // Create the MarketType entry with the new fields
    const marketType = await MarketType.create({
      name,
      start_time,
      open_close_time,
      close_close_time,
      is_active,
      is_selected,
      jodi_background,
      color,
      jodi_url,
      pannel_background,
      pannel_url,
      is_loading,
      position
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
        const { name, start_time, open_close_time, close_close_time, is_active, is_selected } = row;
        if (name && start_time && open_close_time && close_close_time && is_selected && is_active !== undefined) {
          marketTypes.push({
            name,
            start_time,
            open_close_time,
            close_close_time,
            is_active: is_active.toLowerCase() === 'true',
            is_selected: is_active.toLowerCase() === 'false',
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
    const marketTypes = await MarketType.findAll({
      order: [
        // order: [
        [
          sequelize.literal('ISNULL(position), position ASC'), // `NULL` values go last, others sorted ascending
        ],
        ['createdAt', 'DESC'], // Secondary ordering by `createdAt`
        // ],
      ],
    });
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

    // Check if the position already exists in another market type
    if (req.body.position) {
      const existingMarketType = await MarketType.findOne({
        where: { position: req.body.position },
      });

      if (existingMarketType && existingMarketType.id !== marketType.id) {
        return res.status(400).json({
          status: false,
          message: `Position already set for MarketType: ${existingMarketType.name}`,
          data: null,
        });
      }
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
          attributes: ['id', 'name', 'is_active', 'is_selected'], // Adjust attributes as needed
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


exports.getAllLiveResultsm = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    const whereCondition = {};


    if (start_date && end_date) {
      whereCondition.date = {
        [Op.between]: [
          moment(start_date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
          moment(end_date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        ],
      };
    } else if (start_date) {
      whereCondition.date = {
        [Op.gte]: moment(start_date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      };
    } else if (end_date) {
      whereCondition.date = {
        [Op.lte]: moment(end_date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
      };
    }

    console.log('Filter Condition:', whereCondition);


    const liveResults = await LiveResult.findAll({

      where: whereCondition,
      include: {
        model: MarketType,
        as: 'marketType',
        where: {
          is_selected: true,
        },
      },

      order: [
        [
          sequelize.literal('IFNULL(`marketType`.`position`, 999999)'),
          'ASC', // Sort first by position (put nulls last using IFNULL)
        ],
        ['createdAt', 'DESC'], // Then sort by createdAt in descending order
      ],

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

exports.getMarketTypesNotInLiveResults = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const marketTypes = await MarketType.findAll({
      where: {
        id: {
          [Op.notIn]: sequelize.literal(`
            (SELECT DISTINCT market_type 
             FROM live_result 
             WHERE DATE(date) = '${today}')
          `),
        },
        is_selected: true,
      },
      order: [
        [sequelize.literal('CASE WHEN position IS NULL THEN 1 ELSE 0 END'), 'ASC'], // Null positions last
        ['position', 'ASC'], // Order by position ascending
      ],
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
