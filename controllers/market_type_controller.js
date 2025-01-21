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
    const { name, start_time, market_heading_color,open_close_time,is_loading, position, close_close_time, is_active, is_selected, jodi_background, color, jodi_url, pannel_background, pannel_url } = req.body;



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
      market_heading_color,
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
    // Extract the query parameter
    const {isSelected, isLoading} = req.query;

    // Build the `where` condition based on the query parameter
    const whereCondition = {};
    if (isSelected !== undefined) {
      whereCondition.is_selected = isSelected === 'true'; // Convert to boolean
    }
    if (isLoading !== undefined) {
      whereCondition.is_loading = isLoading === 'true'; // Convert to boolean
    }

    const marketTypes = await MarketType.findAll({
      where: whereCondition,
      order: [
        [sequelize.literal('ISNULL(position), position ASC')], // `NULL` values go last, others sorted ascending
        ['createdAt', 'DESC'], // Secondary ordering by `createdAt`
      ],
    });


    res.status(200).json({
      status: true,
      message: "MarketTypes fetched successfully",
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

exports.getAllMarketTypes2 = async (req, res) => {
  try {
    const { isSelected, isLoading, start_date, end_date } = req.query;

    // Build the `where` condition for market types
    const whereCondition = {};
    if (isSelected !== undefined) {
      whereCondition.is_selected = isSelected === 'true'; // Convert to boolean
    }
    if (isLoading !== undefined) {
      whereCondition.is_loading = isLoading === 'true'; // Convert to boolean
    }

    // Fetch all market types
    const marketTypes = await MarketType.findAll({
      where: whereCondition,
      order: [
        [sequelize.literal('ISNULL(position), position ASC')], // NULL values last, others ascending
        ['createdAt', 'DESC'], // Secondary ordering
      ],
    });

    // Prepare the date filter condition
    const dateFilter = {};
    const format = 'YYYY-MM-DD'; // Date format

    if (start_date) {
      dateFilter[Op.gte] = moment(start_date, format).startOf('day').toDate(); // Greater than or equal to start_date
    }
    if (end_date) {
      dateFilter[Op.lte] = moment(end_date, format).endOf('day').toDate(); // Less than or equal to end_date
    }

    // Fetch live results for each market type, applying the date filter
    const marketTypesWithResults = await Promise.all(
      marketTypes.map(async (marketType) => {
        const liveResults = await LiveResult.findAll({
          where: {
            market_type: marketType.id, // Match the market_type ID
            ...(Object.keys(dateFilter).length && { date: dateFilter }), // Apply the date filter if available
          },
          order: [['date', 'DESC']], // Sort results by date descending
        });

        return {
          ...marketType.toJSON(),
          liveResults: liveResults.map((result) => ({
            id: result.id,
            openPanna: result.open_panna || null,
            openResult: result.open_result || null,
            closePanna: result.close_panna || null,
            closeResult: result.close_result || null,
            jodi: result.jodi || null,
            day: result.day || null,
            date: result.date ? moment(result.date).format('YYYY/MM/DD') : null, // Format date
            createdAt: moment(result.createdAt).format('YYYY-MM-DD HH:mm:ss'), // Format createdAt
          })),
        };
      })
    );

    // Response with market types and their live results
    res.status(200).json({
      status: true,
      message: "MarketTypes with LiveResults fetched successfully",
      data: marketTypesWithResults,
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

exports.getMarketTypesNotInLiveResults2 = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { is_loading } = req.query; // Fetch the `is_loading` query parameter

    let whereCondition;

    if (is_loading === "true") {
      // Fetch all MarketTypes where is_loading is true
      whereCondition = {
        is_loading: true,
      };
    } else {
      // Logic: Fetch MarketTypes where no relevant field in live_result has a value for today
      whereCondition = {
        id: {
          [Op.notIn]: sequelize.literal(`
            SELECT DISTINCT market_type
            FROM live_result
            WHERE DATE(date) = '${today}'
            AND (
              open_panna IS NOT NULL AND open_panna != '' OR
              open_result IS NOT NULL AND open_result != '' OR
              close_panna IS NOT NULL AND close_panna != '' OR
              close_result IS NOT NULL AND close_result != '' OR
              jodi IS NOT NULL AND jodi != ''
            )
          `),
        },
        is_selected: true,
      };
    }

    const marketTypes = await MarketType.findAll({
      where: whereCondition,
      order: [
        [sequelize.literal('CASE WHEN position IS NULL THEN 1 ELSE 0 END'), 'ASC'], // Null positions last
        ['position', 'ASC'], // Order by position ascending
      ],
    });

    res.status(200).json({
      status: true,
      message: is_loading === "true" 
        ? "MarketTypes with is_loading: true fetched successfully" 
        : "MarketTypes without today's LiveResult with specified fields fetched successfully",
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

exports.getMarketTypesNotInLiveResults = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { is_loading } = req.query;

    let whereCondition;

    if (is_loading === "true") {
      // Fetch all MarketTypes where is_loading is true
      whereCondition = {
        is_loading: true,
      };
    } else {
      // Original logic: Fetch MarketTypes not in today's live_result
      whereCondition = {
        id: {
          [Op.notIn]: sequelize.literal(`
            (SELECT DISTINCT market_type 
             FROM live_result 
             WHERE DATE(date) = '${today}')
          `),
        },
      };
    }

    const marketTypes = await MarketType.findAll({
      where: whereCondition,
      order: [
        [sequelize.literal('CASE WHEN position IS NULL THEN 1 ELSE 0 END'), 'ASC'], // Null positions last
        ['position', 'ASC'], // Order by position ascending
      ],
    });

    res.status(200).json({
      status: true,
      message: is_loading === "true" 
        ? "MarketTypes with is_loading: true fetched successfully" 
        : "MarketTypes without today's LiveResult fetched successfully",
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