const MarketType = require('../models/market_type_model');
const GameType = require('../models/game_type_model');
const LiveResult = require('../models/live_result_model');
const Message = require('../config/message');
const cron = require('node-cron');
const fs = require('fs');
const csvParser = require('csv-parser');
const User = require('../models/user_model');
const { Op } = require('sequelize');
// const moment = require('moment');
const moment = require('moment-timezone');
const { sequelize } = require('../config/db');


// // Hardcoded times for testing in "hh:mm A" format
// const HARD_CODED_OPEN_CLOSE_TIME = '03:28 PM'; // Start time
// const HARD_CODED_CLOSE_CLOSE_TIME = '03:34 PM'; // Close time

// // Flags to track if notifications have already been sent
// let startNotificationSent = false;
// let closeNotificationSent = false;

// // Function to send notifications for markets 5 minutes before start and end times
// async function sendNotificationsBeforeMarketTimes() {
//   try {
//     // Fetch the admin user to get their device token
//     const adminUser = await User.findOne({ where: { role: 'admin' } });

//     if (adminUser && adminUser.deviceToken) {
//       // Hardcode 5 minutes before the specified times
//       const fiveMinutesBeforeOpen = moment(HARD_CODED_OPEN_CLOSE_TIME, 'hh:mm A').subtract(5, 'minutes');
//       const fiveMinutesBeforeClose = moment(HARD_CODED_CLOSE_CLOSE_TIME, 'hh:mm A').subtract(5, 'minutes');

//       // Log the hardcoded times for clarity during testing
//       console.log('Five minutes before open:', fiveMinutesBeforeOpen.format('hh:mm A'));
//       console.log('Five minutes before close:', fiveMinutesBeforeClose.format('hh:mm A'));

//       const markets = await MarketType.findAll();

//       if (markets.length > 0) {
//         for (const market of markets) {
//           // Check if the current time matches the hardcoded notification times
//           const now = moment();

//           if (now.isSame(fiveMinutesBeforeOpen, 'minute') && !startNotificationSent) {
//             const message = `Market ID: ${market.id} will start at ${HARD_CODED_OPEN_CLOSE_TIME}.`;
//             console.log(`Sending start notification: ${message}`);
//             await Message.sendNotificationToUserDevice(
//               message,
//               "fICapRfcTmiRuecwuzBORI:APA91bHIpgceQS6Mie0xGeZ3tXzMSPpfhax9UMuQAPflISXL_yBvS3Fy5kyy3Vysi89eqQHi5lOazQ7hhcHcvLyS9jdAJqz58f1SGz1SUasAxdeKpD90N-I",
//               'Market Start Notification'
//             );
//             startNotificationSent = true; // Mark notification as sent
//           }

//           if (now.isSame(fiveMinutesBeforeClose, 'minute') && !closeNotificationSent) {
//             const message = `Market ID: ${market.id} will close at ${HARD_CODED_CLOSE_CLOSE_TIME}.`;
//             console.log(`Sending close notification: ${message}`);
//             await Message.sendNotificationToUserDevice(
//               message,
//               "fICapRfcTmiRuecwuzBORI:APA91bHIpgceQS6Mie0xGeZ3tXzMSPpfhax9UMuQAPflISXL_yBvS3Fy5kyy3Vysi89eqQHi5lOazQ7hhcHcvLyS9jdAJqz58f1SGz1SUasAxdeKpD90N-I",

//               // adminUser.deviceToken, // Replace with actual device token
//               'Market Close Notification'
//             );
//             closeNotificationSent = true; // Mark notification as sent
//           }
//         }
//       } else {
//         console.log('No markets found for notification at this time.');
//       }
//     } else {
//       console.warn('Admin user not found or does not have a device token.');
//     }
//   } catch (error) {
//     console.error('Error sending notification:', error);
//   }
// }

// // Schedule the function to run every minute
// cron.schedule('* * * * *', sendNotificationsBeforeMarketTimes);

// Flags to track if notifications have already been sent for each market

let notificationStatus = new Map();

async function sendNotificationsBeforeMarketTimes() {
  try {
    const adminAndSubAdmins = await User.findAll({
      where: {
        role: ['admin', 'sub-admin'],
      },
    });

    if (adminAndSubAdmins.length > 0) {
      const deviceTokens = adminAndSubAdmins
        .filter(user => user.deviceToken)
        .map(user => user.deviceToken);

      const markets = await MarketType.findAll({ where: { is_active: true } });

      if (markets.length > 0) {
        const now = moment().tz('Asia/Kolkata'); // भारतीय वेळेसाठी टाइमझोन सेट

        for (const market of markets) {
          const marketId = market.id;
          const openCloseTime = moment.tz(market.open_close_time, 'hh:mm A', 'Asia/Kolkata');
          const closeCloseTime = moment.tz(market.close_close_time, 'hh:mm A', 'Asia/Kolkata');
          const fiveMinutesBeforeOpen = openCloseTime.clone().subtract(5, 'minutes');
          const fiveMinutesBeforeClose = closeCloseTime.clone().subtract(5, 'minutes');

          if (!notificationStatus.has(marketId)) {
            notificationStatus.set(marketId, { start: false, close: false });
          }

          const status = notificationStatus.get(marketId);

          if (now.isSame(fiveMinutesBeforeOpen, 'minute') && !status.start) {
            const message = `Market name: ${market.name} will start at ${market.open_close_time}.`;
            console.log(`Sending start notification: ${message}`);
            for (const deviceToken of deviceTokens) {
              await Message.sendNotificationToUserDevice(message, deviceToken, 'Market Start Notification');
            }
            status.start = true;
          }

          if (now.isSame(fiveMinutesBeforeClose, 'minute') && !status.close) {
            const message = `Market name: ${market.name} will close at ${market.close_close_time}.`;
            console.log(`Sending close notification: ${message}`);
            for (const deviceToken of deviceTokens) {
              await Message.sendNotificationToUserDevice(message, deviceToken, 'Market Close Notification');
            }
            status.close = true;
          }

          if (now.isAfter(closeCloseTime, 'minute')) {
            notificationStatus.set(marketId, { start: false, close: false });
          }
        }
      } else {
        console.log('No active markets found for notification.');
      }
    } else {
      console.warn('No admin or sub-admin users found with device tokens.');
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Run the function every minute using cron
cron.schedule('* * * * *', sendNotificationsBeforeMarketTimes);

exports.createMarketType = async (req, res) => {
  try {
    const { name, start_time, market_heading_color, open_close_time, is_loading, position, close_close_time, is_active, is_selected, jodi_background, color, jodi_url, pannel_background, pannel_url } = req.body;

    // Check if market name already exists
    const existingMarketByName = await MarketType.findOne({ where: { name } });
    if (existingMarketByName) {
      return res.status(400).json({
        status: false,
        message: `Market '${name}' already exists`,
      });
    }

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
    const { isSelected, isLoading } = req.query;

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


exports.getAllLiveResultsForAllMarket = async (req, res) => {
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
        // where: {
        //   is_selected: true,
        // },
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

exports.getMarketTypesNotInLiveResultsAllMarket = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const whereCondition = {
      id: {
        [Op.notIn]: sequelize.literal(`
          (SELECT DISTINCT market_type 
           FROM live_result 
           WHERE DATE(date) = '${today}'
           AND (
             open_panna NOT IN ('X', 'XXX') 
             AND open_result NOT IN ('X', 'XXX') 
             AND close_panna NOT IN ('X', 'XXX') 
             AND close_result NOT IN ('X', 'XXX') 
             AND jodi NOT IN ('X', 'XXX')
           )
          )
        `),
      },
    };

    const marketTypes = await MarketType.findAll({
      where: whereCondition,
      order: [
        [sequelize.literal('CASE WHEN position IS NULL THEN 1 ELSE 0 END'), 'ASC'], // Null positions last
        ['position', 'ASC'], // Order by position ascending
      ],
    });

    res.status(200).json({
      status: true,
      message: "MarketTypes with is_selected: true and not in today's LiveResult fetched successfully",
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

    const whereCondition = {
      is_selected: true, // Only fetch MarketTypes where is_selected is true
      id: {
        [Op.notIn]: sequelize.literal(`
          (SELECT DISTINCT market_type 
           FROM live_result 
           WHERE DATE(date) = '${today}')
        `),
      },
    };

    const marketTypes = await MarketType.findAll({
      where: whereCondition,
      order: [
        [sequelize.literal('CASE WHEN position IS NULL THEN 1 ELSE 0 END'), 'ASC'], // Null positions last
        ['position', 'ASC'], // Order by position ascending
      ],
    });

    res.status(200).json({
      status: true,
      message: "MarketTypes with is_selected: true and not in today's LiveResult fetched successfully",
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