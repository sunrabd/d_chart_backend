const User = require('../models/user_model');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const upload = require('../middleware/upload');
const SubscriptionModel = require('../models/subscription_model');
const moment = require('moment');
const cron = require('node-cron');
const GlobalNotification = require('../models/global_notification_model');

// const ACCESS_TOKEN_EXPIRATION = '5m';
// const REFRESH_TOKEN_EXPIRATION = '180d';

const refreshTokens = [];
exports.signUp = async (req, res) => {
  const uploadSingle = upload.single('profilePicture');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    const { name, mobile_no, email, password, deviceId, deviceToken, join_date,role, global_notification_id, active_date } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    if (!name || !mobile_no || !email || !password) {
      return res.status(400).json({ status: false, message: 'All fields are required for signup.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        mobile_no,
        email,
        password: hashedPassword,
        deviceId,
        deviceToken,
        role: role || 'user',
        profile_picture: profilePicture,
        global_notification_id,
        active_date,
        join_date,
      });

      res.status(201).json({ status: true, message: 'User signed up successfully.', user });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Error signing up user.', error });
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
      user = await User.findOne({ where: { mobile_no } });
    } else if (email) {
      user = await User.findOne({ where: { email } });
    }

    if (!user) {
      return res.status(404).json({ status: false, message: 'Invalid credentials.' });
    }

    // Role-based restriction
    if ((mobile_no && user.role !== 'user') || (email && user.role !== 'admin')) {
      return res.status(403).json({ status: false, message: 'Access denied for this role.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: false, message: 'Invalid credentials.' });
    }

    await user.update({
      deviceId: deviceId || user.deviceId,
      deviceToken: deviceToken || user.deviceToken,
      active_date: active_date || user.active_date,
      
    });

    const accessToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email, mobile_no: user.mobile_no, username: user.name },
      process.env.API_SECRET,
    );

    // const refreshToken = jwt.sign(
    //   { id: user.id },
    //   process.env.API_SECRET,
    // );

    // // Save refresh token
    // refreshTokens.push(refreshToken);

    res.status(200).json({
      status: true,
      message: 'Sign in successful.',
      accessToken : accessToken,
      // user: {
      //   id: user.id,
      //   name: user.name,
      //   email: user.email,
      //   mobile_no: user.mobile_no,
      //   role: user.role,
      //   deviceId: user.deviceId,
      //   deviceToken: user.deviceToken,
      //   active_date: user.active_date,
      // },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error signing in.', error });
  }
};

// Refresh Token
// exports.refreshToken = async (req, res) => {
//   const { token } = req.body;

//   if (!token) {
//     return res.status(401).json({ status: false, message: 'Refresh token is required.' });
//   }

//   if (!refreshTokens.includes(token)) {
//     return res.status(403).json({ status: false, message: 'Invalid refresh token.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.API_SECRET);

//     const newAccessToken = jwt.sign(
//       { id: decoded.id },
//       process.env.API_SECRET,
//     );

//     res.status(200).json({
//       status: true,
//       message: 'Access token refreshed successfully.',
//       accessToken: newAccessToken,
//     });
//   } catch (error) {
//     res.status(403).json({ status: false, message: 'Invalid or expired refresh token.', error });
//   }
// };

// // Logout
// exports.logout = (req, res) => {
//   const { token } = req.body;

//   if (!token) {
//     return res.status(400).json({ status: false, message: 'Refresh token is required for logout.' });
//   }

//   const index = refreshTokens.indexOf(token);
//   if (index > -1) {
//     refreshTokens.splice(index, 1);
//   }

//   res.status(200).json({ status: true, message: 'User logged out successfully.' });
// };

exports.updateUser = async (req, res) => {
  const uploadSingle = upload.single('profilePicture');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    const { id } = req.params;
    const { subscription_id,active_date,join_date,deviceToken, show_global_notifications, global_notification_is_visible,password, ...updates } = req.body; // Added global_notification_is_visible
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
      
      if (subscription_id) {
        const subscription = await SubscriptionModel.findByPk(subscription_id);
        if (!subscription) {

          return res.status(404).json({ status: false, message: 'Subscription not found.' });
        }
        updates.subscriptionCount = (user.subscriptionCount || 0)+1;
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
      include: {
        model: SubscriptionModel,
        as: 'subscription',
        required: false,
      },
      include: {
        model: GlobalNotification,
        as: 'global_notification',
        required: false,
      },
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

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const { name } = req.query;
    const users = await User.findAll({
      where: {
        role: 'user',
        ...(name && { name: { [Op.like]: `%${name}%` } }),
      },
      include: [{
        model: SubscriptionModel,
        as: 'subscription',
        required: false,
      }, {
        model: GlobalNotification,
        as: 'global_notification',
        required: false,
      },],
      order: [['createdAt', 'DESC']], // Order by createdAt descending
    });
    res.status(200).json({ status: true, message: 'Users retrieved successfully.', users });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving users.', error });
  }
};
