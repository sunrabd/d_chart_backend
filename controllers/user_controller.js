const User = require('../models/user_model');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const upload = require('../middleware/upload');
const SubscriptionModel = require('../models/subscription_model');
const moment = require('moment');
const cron = require('node-cron');
const GlobalNotification = require('../models/global_notification_model');
const SubscriptionHistoryModel = require('../models/subscription_history_model');
const Message = require('../config/message');
const AdminSetting = require('../models/setting_model'); // Ensure this is correctly imported

exports.signUp = async (req, res) => {
  const uploadSingle = upload.single('profilePicture');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    const { name, mobile_no, email,permissions,refer_code,app_version, password,is_first_time_user, deviceId, deviceToken, join_date, role, global_notification_id, active_date } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    if (!name || !mobile_no || !email || !password) {
      return res.status(400).json({ status: false, message: 'All fields are required for signup.' });
    }

    try {
        const existingUser = await User.findOne({
          where: {
            [Op.or]: [{ email }, { mobile_no }],
          },
        });
  
        if (existingUser) {
          return res.status(400).json({
            status: false,
            message: 'Email or mobile number already in use.',
          });
        }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        mobile_no,
        email,
        password: hashedPassword,
        deviceId,
        deviceToken,
        // deviceTokens: [deviceToken],
        deviceIds: [deviceId],
        role: role || 'user',
        profile_picture: profilePicture,
        global_notification_id,
        active_date,
        is_first_time_user,
        permissions,
        join_date,
        app_version,
      });

      if (refer_code) {
        const referrer = await User.findOne({ where: { refer_and_earn_code: refer_code } });

        if (referrer) {
          // Get the referral bonus amount from admin settings
          const adminSetting = await AdminSetting.findOne();
          let bonus = 0;
          if (adminSetting && adminSetting.refer_bouns_coin) {
            bonus = adminSetting.refer_bouns_coin;
          }
          // Update the referrer's super_coins by adding the bonus value
          await referrer.update({ super_coins: referrer.super_coins + bonus });
        }
      }


      res.status(201).json({ status: true, message: 'User signed up successfully.', user });
      
      try {
        const message = "https://www.youtube.com/watch?v=BTvozDcDNjA";
        await Message.sendNotificationToUserDevice(
           message,
           deviceToken,
          'check market laod on dchart💸🤑👇'
      );
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
// Sign In
exports.signIn = async (req, res) => {
  const { email, mobile_no, password, deviceId, deviceToken, active_date } = req.body;

  if ((!email && !mobile_no) || !password) {
    return res.status(400).json({ status: false, message: 'Email or mobile number and password are required.' });
  }

  try {
    let user;
    if (mobile_no) {
      user = await User.findOne({ where: { mobile_no } });
    } else if (email) {
      user = await User.findOne({ where: { email } });
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
      { id: user.id, role: user.role, email: user.email, mobile_no: user.mobile_no, username: user.name },
      process.env.API_SECRET,
    );

    res.status(200).json({
      status: true,
      message: 'Sign-in successful.',
      accessToken: accessToken,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error signing in.', error });
  }
};


exports.updateUser = async (req, res) => {
  const uploadSingle = upload.single('profilePicture');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    const { id } = req.params;
    const { subscription_id,is_first_time_user,app_version, active_date,permissions, join_date, deviceToken, is_free_user, show_logout_user, show_global_notifications, global_notification_is_visible, password, ...updates } = req.body; // Added global_notification_is_visible
    const profilePicture = req.file ? req.file.path : null;

    try {
      const user = await User.findByPk(id, {
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
            'add-load', 'subscription', 'transactions', 'admin-setting', 'coin', 'permission'
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

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found.' });
    }

    await user.destroy();
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
      where: name ? { name: { [Op.like]: `%${name}%` } } : {},
      include: [{
        model: SubscriptionModel,
        as: 'subscription',
        required: false,
      }, {
        model: GlobalNotification,
        as: 'global_notification',
        required: false,
      },],
      order: [['createdAt', 'DESC']], // Order by 'createdAt' descending
    });
    res.status(200).json({ status: true, message: 'Fetched users successfully', users });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving users.', error });
  }
};

// Get User By ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, {
      include: [{
        model: SubscriptionModel,
        as: 'subscription',
        required: false,
      },
      {
        model: GlobalNotification,
        as: 'global_notification',
        required: false,
      },],
    });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found.' });
    }

    res.status(200).json({ status: true, message: 'User found Successfully', user: user });
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
        ...(name && { name: { [Op.like]: `%${name}%` } }),
      },
      include: [{
        model: SubscriptionModel,
        as: 'subscription',
        required: false,
      },
      {
        model: GlobalNotification,
        as: 'global_notification',
        required: false,
      }],
      order: [['createdAt', 'DESC']], // Order by createdAt descending
    });
    res.status(200).json({ status: true, message: 'Admins retrieved successfully.', admins });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving admins.', error });
  }
};


exports.getAllSubAdmins = async (req, res) => {
  try {
    const { name } = req.query;
    const SubAdmins = await User.findAll({
      where: {
        role: 'sub-admin',
        ...(name && { name: { [Op.like]: `%${name}%` } }),
      },
      include: [{
        model: SubscriptionModel,
        as: 'subscription',
        required: false,
      },
      {
        model: GlobalNotification,
        as: 'global_notification',
        required: false,
      }],
      order: [['createdAt', 'DESC']], // Order by createdAt descending
    });
    res.status(200).json({ status: true, message: 'Sub-Admins retrieved successfully.', SubAdmins });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving admins.', error });
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { name, mobile, isPaidMember, notPaidMember, isActive, inactive } = req.query;

    const whereConditions = {
      role: 'user',
      ...(name && { name: { [Op.like]: `%${name}%` } }),
      ...(mobile && { mobile_no: { [Op.like]: `%${mobile}%` } }),
      ...(isPaidMember && { is_paid_member: true }),
      ...(notPaidMember && { is_paid_member: false }),
      ...(isActive && { is_active: true }),
      ...(inactive && { is_active: false }),
    };

    const users = await User.findAll({
      where: whereConditions,
      include: [
        {
          model: SubscriptionModel,
          as: 'subscription',
          required: false,
        },
        {
          model: GlobalNotification,
          as: 'global_notification',
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ status: true, message: 'Users retrieved successfully.', users });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving users.', error });
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