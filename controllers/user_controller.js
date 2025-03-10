const User = require('../models/user_model');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const upload = require('../middleware/upload');
const SubscriptionModel = require('../models/subscription_model');
// const moment = require('moment');
const cron = require('node-cron');
const GlobalNotification = require('../models/global_notification_model');
const SubscriptionHistoryModel = require('../models/subscription_history_model');
const Message = require('../config/message');
const AdminSetting = require('../models/setting_model'); // Ensure this is correctly imported
const moment = require('moment-timezone');

exports.registerUser = async (req, res) => {
  try {
    const { mobile_no} = req.body;

    // Check if the mobile number already exists
    const existingUser = await User.findOne({ where: { mobile_no , is_deleted: false } });
    if (existingUser) {
      return res.status(400).json({ status: false, message: 'Mobile number already exists' });
    }

    res.status(200).json({ status: true, message: 'mobile number not found ' });

  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

exports.adminSignUp = async (req, res) => {
  const uploadSingle = upload.single('profilePicture');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    try {
      const {
        name, mobile_no, email, permissions, refer_code, show_global_notifications,
        app_version, password, is_first_time_user, deviceId, deviceToken,
        join_date, global_notification_id, active_date, role
      } = req.body;
      
      const profilePicture = req.file ? req.file.path : null;

      if (!name || !mobile_no || !password || !email || !role) {
        return res.status(400).json({ status: false, message: 'All required fields must be provided.' });
      }

      if (role === 'admin') {
        const existingAdmin = await User.findOne({ where: { role: 'admin' } });
        if (existingAdmin) {
          return res.status(400).json({
            status: false,
            message: 'An admin already exists. Cannot create another admin',
          });
        }
      }

      if (role === 'sub-admin') {
        const existingSubAdmin = await User.findOne({ where: { email, role: 'sub-admin' } });
        if (existingSubAdmin) {
          return res.status(400).json({
            status: false,
            message: 'A sub-admin with this email already exists.',
          });
        }
      }

      const existingUser = await User.findOne({ where: { mobile_no } });
      if (existingUser) {
        return res.status(400).json({
          status: false,
          message: 'Mobile number already in use.',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({
        name,
        mobile_no,
        email,
        password: hashedPassword,
        deviceId,
        deviceToken,
        deviceIds: [deviceId],
        role,
        profile_picture: profilePicture,
        global_notification_id,
        active_date,
        is_first_time_user,
        show_global_notifications,
        permissions,
        join_date,
        app_version,
      });

      res.status(201).json({
        status: true,
        message: `${role} registered successfully.`,
        data: newUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  });
};

exports.signUp = async (req, res) => {
  const uploadSingle = upload.single('profilePicture');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    const { name, mobile_no, email, permissions, refer_code,show_global_notifications, app_version, password, is_first_time_user, deviceId, deviceToken, join_date, global_notification_id, active_date } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    if (!name) {
      return res.status(400).json({ status: false, message: 'name is required for signup.' });
    }

    if (!mobile_no) {
      return res.status(400).json({ status: false, message: 'mobile_no is required for signup.' });
    }

    if (!password) {
      return res.status(400).json({ status: false, message: 'password is required for signup.' });
    }

    try {
      let existingUser = await User.findOne({
        where: {
          [Op.or]: [{ mobile_no }],
        },
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      if (existingUser) {
        // Check if user is deleted
        if (existingUser.is_deleted) {
          // Reactivate user and update details
          await existingUser.update({
            name,
            password: hashedPassword,
            deviceId,
            deviceToken,
            deviceIds: [...(existingUser.deviceIds || []), deviceId],
            role:'user',
            profile_picture: profilePicture,
            global_notification_id,
            active_date,
            is_first_time_user,
            show_global_notifications,
            permissions,
            join_date,
            app_version,
            is_deleted: false, // Reactivate user
          });

          return res.status(200).json({ status: true, message: 'User reactivated successfully.', user: existingUser });
        }

        return res.status(400).json({ status: false, message: 'mobile number already in use.' });
      }

      // Create new user if not found
      const user = await User.create({
        name,
        mobile_no,
        email,
        password: hashedPassword,
        deviceId,
        deviceToken,
        // deviceTokens: [deviceToken],
        deviceIds: [deviceId],
        role:'user',
        profile_picture: profilePicture,
        global_notification_id,
        active_date,
        is_first_time_user,
        show_global_notifications,
        permissions,
        join_date,
        app_version,
      });

      if (refer_code) {
        const referrer = await User.findOne({ where: { refer_and_earn_code: refer_code } });

        if (referrer) {
          const adminSetting = await AdminSetting.findOne();
          let bonus = adminSetting?.refer_bouns_coin || 0;


          // let bonus = 0;
          // if (adminSetting && adminSetting.refer_bouns_coin) {
          //   bonus = adminSetting.refer_bouns_coin;
          // }
          // Update the referrer's super_coins by adding the bonus value
                 await referrer.update({ super_coins: referrer.super_coins + bonus });
        }
      }

      res.status(201).json({ status: true, message: 'User signed up successfully.', user });

      try {
        const message = "https://www.youtube.com/watch?v=BTvozDcDNjA";
        await Message.sendNotificationToUserDevice(message, deviceToken, 'check market laod on dchart💸🤑👇');
      } catch (error) {
        console.log("Failed to send notification");
      }

    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ status: false, message: 'Error signing up user.', error: error.message });
    }
  });
};

// Sign In
exports.signIn = async (req, res) => {
  const { email, mobile_no, password, deviceId, deviceToken, active_date } = req.body;

  if ((!email && !mobile_no) || !password) {
    return res.status(400).json({ status: false, message: 'Email or mobile number and password are required.' });
  }

  try {
    let user;
    if (mobile_no) {
      user = await User.findOne({ where: { mobile_no, is_deleted: false } });
    } else if (email) {
      user = await User.findOne({ where: { email, is_deleted: false } });
    }


    if (!user) {
      return res.status(404).json({ status: false, message: 'Invalid credentials.' });
    }

    // Role-based restriction
    if ((mobile_no && user.role !== 'user') || (email && !['admin', 'sub-admin'].includes(user.role))) {
      return res.status(403).json({ status: false, message: 'Access denied for this role.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: false, message: 'Invalid credentials.' });
    }

    // Add deviceId at the start of the array if not already present
    const updatedDeviceIds = user.deviceIds && !user.deviceIds.includes(deviceId) ? [deviceId, ...user.deviceIds] : user.deviceIds;

    // Update only the fields that have new values
    const updatedFields = {};
    if (deviceId) updatedFields.deviceId = deviceId;
    if (deviceToken) updatedFields.deviceToken = deviceToken;
    if (active_date) updatedFields.active_date = active_date;
    updatedFields.deviceIds = updatedDeviceIds;

    await user.update(updatedFields);

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, username: user.name },
      process.env.API_SECRET,
    );

    const updatedFields2 = {
      jwt_api_token: accessToken,
    };

    await user.update(updatedFields2);

    res.status(200).json({
      status: true,
      message: 'Sign-in successful.',
      accessToken: accessToken,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error signing in.', error });
  }
};


exports.verifyToken = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: false, message: 'Token is required.' });
  }

  jwt.verify(token, process.env.API_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ status: false, message: 'Invalid or expired token.' });
    }

    res.status(200).json({
      status: true,
      message: 'Token is valid.',
      user: decodedUser,
    });
  });
};


exports.updateUser = async (req, res) => {
  const uploadSingle = upload.single('profilePicture');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    const { id } = req.params;
    const { subscription_id,is_first_time_user,app_version, active_date,permissions, join_date, deviceToken, is_free_user, show_logout_user, show_global_notifications, global_notification_is_visible,mobile_number_check_count, set_mobile_number_check_count, password, ...updates } = req.body; // Added global_notification_is_visible
    const profilePicture = req.file ? req.file.path : null;
    const token = req.headers.authorization;

    try {
      if (!token) {
        return res.status(401).json({ status: false, message: 'Token not provided.' });
      }
      const decoded = jwt.verify(token, process.env.API_SECRET);
      console.log(`********${decoded.role}`);
      if (decoded.role !== 'admin' && id != decoded.id) {
        return res.status(403).json({ status: false, message: 'Unauthorized access.' });
      }
      const user = await User.findOne({
        where: {
          id: id,
          is_deleted: false, 
        },
        include: {
          model: GlobalNotification,
          as: 'global_notification',
        },
      });
    
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found.' });
      }

      if (profilePicture) {
        updates.profile_picture = profilePicture;
      }

      if (deviceToken) {
        updates.deviceToken = deviceToken;
      }
 
      if (app_version) {
        updates.app_version = app_version;
      }
      if (mobile_number_check_count != null) {
        updates.mobile_number_check_count = mobile_number_check_count;
      } else {
        updates.mobile_number_check_count = 0;
      }
      
      if (set_mobile_number_check_count != null) {
        updates.set_mobile_number_check_count = set_mobile_number_check_count;
      } else {
        updates.set_mobile_number_check_count = 0;
      }

      if (subscription_id) {
        const subscription = await SubscriptionModel.findByPk(subscription_id);
        if (!subscription) {

          return res.status(404).json({ status: false, message: 'Subscription not found.' });
        }
        updates.subscriptionCount = (user.subscriptionCount || 0) + 1;
        updates.subscription_id = subscription_id;
        updates.is_paid_member = true;


        const timeValidation = subscription.time_validation;
        let expiryDate;

        switch (timeValidation) {
          case 'month':
            expiryDate = moment().add(1, 'month').toDate();
            break;
          case 'week':
            expiryDate = moment().add(1, 'week').toDate();
            break;
          case 'year':
            expiryDate = moment().add(1, 'year').toDate();
            break;
          default:
            return res.status(400).json({ status: false, message: 'Invalid time_validation value.' });
        }

        updates.expiry_date = expiryDate;

        // console.log('Creating subscription history with the following details:', {
        //   userId: id,
        //   subscription_id,
        //   start_date: new Date(),
        //   end_date: expiryDate,
        // });

        await SubscriptionHistoryModel.create({
          userId: id,
          subscription_id,
          start_date: new Date(),
          end_date: expiryDate,
        });

        // Schedule a cron job to reset the subscription on expiry_date
        const cronJob = cron.schedule(moment(expiryDate).format('ss mm HH DD MM *'), async () => {
          const updatedUser = await User.findByPk(id);
          if (updatedUser && updatedUser.subscription_id === subscription_id) {
            await updatedUser.update({
              subscription_id: null,
              is_paid_member: false,
              expiry_date: null,
            });
            console.log(`Subscription expired for user with ID: ${id}`);
          }
          cronJob.stop(); // Stop the cron job after execution
        });
      }

      // Update global_notification is_visible
      if (global_notification_is_visible !== undefined && user.global_notification) {
        await user.global_notification.update({ is_visible: global_notification_is_visible });
      }

      if (show_global_notifications !== undefined) {
        updates.show_global_notifications = show_global_notifications;
      }
      if (show_logout_user !== undefined) {
        updates.show_logout_user = show_logout_user;
      }

      if (is_free_user!== undefined) {
        updates.is_free_user = is_free_user;
      }

      if (is_first_time_user!== undefined) {
        updates.is_first_time_user = is_first_time_user;
      }
      if (active_date !== undefined) {
        updates.active_date = active_date;
      }
      if (join_date !== undefined) {
        updates.join_date = join_date;
      }
      
      if (password) {
        // Hash the password before updating
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.password = hashedPassword;
      }

      if (permissions) {
        let updatedPermissions = user.permissions || {};
    
        // List of available permissions with default values (false)
        const validPermissions = [
            'game-type', 'guess-screen', 'videos', 'cupon', 'market', 'winners',
            'advertisement', 'social-media', 'user', 'notification', 'live-result',
            'add-load', 'subscription', 'transactions', 'admin-setting', 'coin', 'permission',
             'ticker','payment-error-tab','payment-success-tab','show-deleted-user','show_mobile_number','active_user_ads'
        ];
    
        // Ensure all permissions exist in the object with a default value of false
        let finalPermissions = {};
        validPermissions.forEach((perm) => {
            finalPermissions[perm] = updatedPermissions[perm] || false; // Default false if not present
        });
    
        // Update only the sent permissions
        for (let key in permissions) {
            if (validPermissions.includes(key)) {
                finalPermissions[key] = permissions[key];
            }
        }
    
        updates.permissions = finalPermissions;
    }
      await user.update(updates);
      res.status(200).json({ status: true, message: 'User updated successfully.', user });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ status: false, message: 'Error updating user.', error: error.message });
    }
  });
};

// Delete User
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;

  try {
    if (!token) {
      return res.status(401).json({ status: false, message: 'Token not provided.' });
    }
    const decoded = jwt.verify(token, process.env.API_SECRET);
    console.log(`******** ${decoded.role}`);
    if (decoded.role !== 'admin' && id != decoded.id) {
      return res.status(403).json({ status: false, message: 'Unauthorized access.' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found.' });
    }

    await user.update({is_deleted: true});
    res.status(200).json({ status: true, message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error deleting user.', error });
  }
};
// Get All Users
exports.getAllMembers = async (req, res) => {
  try {
    const { name } = req.query;
    const users = await User.findAll({
      where: {
        is_deleted: false, 
        ...(name && { name: { [Op.like]: `%${name}%` } }) 
      },
      include: [
        { model: SubscriptionModel, as: 'subscription', required: false },
        { model: GlobalNotification, as: 'global_notification', required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    users.forEach(user => {
      user.createdAt = moment(user.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');
    });

    res.status(200).json({ status: true, message: 'Fetched users successfully', users });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving users.', error });
  }
};

// Get User By ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  const token = req.headers.authorization;


  try {
    
    if (!token) {
      return res.status(401).json({ status: false, message: 'Token not provided.' });
    }
    const decoded = jwt.verify(token, process.env.API_SECRET);
    console.log(`****1**** ${decoded.role}`);
    console.log(`****2**** ${decoded.id}`);
    console.log(`****3**** ${decoded}`);
    if (id != decoded.id) {
      return res.status(403).json({ status: false, message: 'Unauthorized access.' });
    }

    const user = await User.findOne({
      where: { id, is_deleted: false }, // Filter only active users
      include: [
        { model: SubscriptionModel, as: 'subscription', required: false },
        { model: GlobalNotification, as: 'global_notification', required: false },
      ],
    });

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found.' });
    }

    user.createdAt = moment(user.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');

    res.status(200).json({ status: true, message: 'User found Successfully', user });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving user.', error });
  }
};

// Get All Admins
exports.getAllAdmins = async (req, res) => {
  try {
    const { name } = req.query;
    const admins = await User.findAll({
      where: {
        role: 'admin',
        is_deleted: false,
        ...(name && { name: { [Op.like]: `%${name}%` } }),
      },
      include: [
        { model: SubscriptionModel, as: 'subscription', required: false },
        { model: GlobalNotification, as: 'global_notification', required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    admins.forEach(admin => {
      admin.createdAt = moment(admin.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');
    });

    res.status(200).json({ status: true, message: 'Admins retrieved successfully.', admins });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving admins.', error });
  }
};

// Get All Sub-Admins
exports.getAllSubAdmins = async (req, res) => {
  try {
    const { name } = req.query;
    const subAdmins = await User.findAll({
      where: {
        role: 'sub-admin',
        is_deleted: false,
        ...(name && { name: { [Op.like]: `%${name}%` } }),
      },
      include: [
        { model: SubscriptionModel, as: 'subscription', required: false },
        { model: GlobalNotification, as: 'global_notification', required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    subAdmins.forEach(subAdmin => {
      subAdmin.createdAt = moment(subAdmin.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD hh:mm:ss A');
    });

    res.status(200).json({ status: true, message: 'Sub-Admins retrieved successfully.', subAdmins });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving sub-admins.', error });
  }
};
// Get All Users with Filters & Pagination
exports.getAllUsers = async (req, res) => {
  try {
    const { name, mobile, isPaidMember, notPaidMember, isActive, inactive, page = 1, limit = 10, startDate, endDate } = req.query;

    const whereConditions = {
      role: 'user',
      is_deleted: false,
      ...(name && { name: { [Op.like]: `%${name}%` } }),
      ...(mobile && { mobile_no: { [Op.like]: `%${mobile}%` } }),
      ...(isPaidMember && { is_paid_member: true }),
      ...(notPaidMember && { is_paid_member: false }),
      ...(isActive && { is_active: true }),
      ...(inactive && { is_active: false }),
      ...(startDate && endDate && {
        createdAt: {
          [Op.between]: [
            moment(startDate).startOf('day').toDate(),
            moment(endDate).endOf('day').toDate()
          ]
        }
      }),
    };

    let paginationOptions = {};
    if (page && limit) {
      const offset = (parseInt(page) - 1) * parseInt(limit);
      paginationOptions = { limit: parseInt(limit), offset };
    }

    // Fetch users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      include: [
        { model: SubscriptionModel, as: 'subscription', required: false },
        { model: GlobalNotification, as: 'global_notification', required: false },
      ],
      order: [['createdAt', 'DESC']],
      ...paginationOptions,
    });

    // Count yesterday's users
    const yesterdayUserCount = await User.count({
      where: {
        createdAt: {
          [Op.between]: [
            moment().subtract(1, 'days').startOf('day').toDate(),
            moment().subtract(1, 'days').endOf('day').toDate(),
          ],
        },
        role: 'user',
        is_deleted: false,
      },
    });

    // Count today's users
    const todayUserCount = await User.count({
      where: {
        createdAt: {
          [Op.between]: [
            moment().startOf('day').toDate(),
            moment().endOf('day').toDate(),
          ],
        },
        role: 'user',
        is_deleted: false,
      },
    });

      // Additional Counts
      const [activeUsers, inactiveUsers, paidUsers, unpaidUsers, todaySubscribers, todayJoinedUsers, activeButUnpaidUsers, totalUserSuperCoinCount] = await Promise.all([
        User.count({ where: { is_active: true, role: 'user' } }),
        User.count({ where: { is_active: false, role: 'user' } }),
        User.count({ where: { is_paid_member: true, role: 'user' } }),
        User.count({ where: { is_paid_member: false, role: 'user' } }),
        User.count({ where: { join_date: { [Op.gte]: moment().tz('Asia/Kolkata').startOf('day').toDate() }, role: 'user' } }),
        User.count({ where: { createdAt: { [Op.gte]: moment().tz('Asia/Kolkata').startOf('day').toDate() }, role: 'user' } }),
        User.count({ where: { is_active: true, is_paid_member: false, role: 'user' } }),
        User.sum('super_coins'),
      ]);

    const formattedUser = users.map(user => ({
      ...user.toJSON(),
      createdAt: moment(user.createdAt).tz('Asia/Kolkata').format('dddd, YYYY-MM-DD hh:mm:ss A')
    }));

    res.status(200).json({
      status: true,
      message: 'Users retrieved successfully.',
      totalUsers: count,
      totalPages: page && limit ? Math.ceil(count / limit) : 1,
      currentPage: page ? parseInt(page) : 1,
      yesterday_user_count:yesterdayUserCount,
      today_user_count: todayUserCount,
      counts: {
        activeUsers,
        inactiveUsers,
        paidUsers,
        unpaidUsers,
        todaySubscribers,
        todayJoinedUsers,
        activeButUnpaidUsers,
      },
      totalUserSuperCoinCount: totalUserSuperCoinCount || 0,
      formattedUser,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving users.', error });
  }
};

exports.getAllUsersForCSV = async (req, res) => {
  try {
    const { startDate, endDate, paidUsers, unPaidUsers, activeUsers, inactiveUsers } = req.query;

    // Get today's and yesterday's date
    const todayStart = moment().startOf('day').toDate();
    const todayEnd = moment().endOf('day').toDate();
    const yesterdayStart = moment().subtract(1, 'day').startOf('day').toDate();
    const yesterdayEnd = moment().subtract(1, 'day').endOf('day').toDate();

    // Base conditions
    const whereConditions = {
      role: 'user',
      is_deleted: false,
      ...(startDate && endDate && {
        createdAt: {
          [Op.between]: [
            moment(startDate).startOf('day').toDate(),
            moment(endDate).endOf('day').toDate()
          ]
        }
      }),
      ...(paidUsers && { is_paid_member: paidUsers === 'true' }),
      ...(unPaidUsers && {is_paid_member:unPaidUsers === 'false' }),
      ...(activeUsers && { is_active: activeUsers === 'true' }),
      ...(inactiveUsers && { is_active: inactiveUsers === 'false' }),
    };

    // Fetch filtered users
    const users = await User.findAll({
      where: whereConditions,
      include: [
        { model: SubscriptionModel, as: 'subscription', required: false },
        { model: GlobalNotification, as: 'global_notification', required: false },
      ],
      order: [['createdAt', 'DESC']],
    });

    // Format response
    const formattedUsers = users.map(user => ({
      ...user.toJSON(),
      createdAt: moment(user.createdAt).tz('Asia/Kolkata').format('dddd, YYYY-MM-DD hh:mm:ss A')
    }));

    res.status(200).json({
      status: true,
      message: 'Users retrieved successfully.',
      totalUsers: users.length,
      formattedUsers,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving users.', error });
  }
};

exports.getAllDeletedUsers = async (req, res) => {
  try {
    const { name } = req.query;
    const deleteUser = await User.findAll({
      where: {
        role: 'user',
        is_deleted:true,
        ...(name && { name: { [Op.like]: `%${name}%` } }),
      },
      // include: [
      //   { model: SubscriptionModel, as: 'subscription', required: false },
      //   { model: GlobalNotification, as: 'global_notification', required: false },
      // ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ status: true, message: 'Get deleted user successfully.', deleteUser });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving delete user.', error });
  }
};

exports.generateReferralCodesForAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ where: { refer_and_earn_code: null } });

    for (let user of users) {
      user.refer_and_earn_code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await user.save();
    }

    return res.status(200).json({ message: 'Referral codes generated for all users' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

