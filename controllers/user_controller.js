const User = require('../models/user_model');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const upload = require('../middleware/upload');
const SubscriptionModel= require('../models/subscription_model');
const moment = require('moment');
const cron = require('node-cron'); 

exports.signUp = async (req, res) => {
  const uploadSingle = upload.single('profilePicture');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    const { name, mobile_no, email, password, deviceId, deviceToken, role } = req.body;
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
        role: role || 'user', // Default to 'user' if not provided
        profile_picture: profilePicture,
      });

      res.status(201).json({ status: true, message: 'User signed up successfully.', user });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Error signing up user.', error });
    }
  });
};


// Sign In
exports.signIn = async (req, res) => {
  const { email, mobile_no, password } = req.body;

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

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.API_SECRET
    );
    res.status(200).json({ status: true, message: 'Sign in successful.', token });
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
    const { subscription_id, ...updates } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ status: false, message: 'User not found.' });
      }

      if (profilePicture) {
        updates.profile_picture = profilePicture;
      }

      if (subscription_id) {
        const subscription = await SubscriptionModel.findByPk(subscription_id);
        if (!subscription) {
          return res.status(404).json({ status: false, message: 'Subscription not found.' });
        }
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
      include: {
        model: SubscriptionModel,
        as: 'subscription',
        required: false,
      },
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
    const user = await User.findByPk(id ,{
      include: {
        model: SubscriptionModel,
        as: 'subscription',
        required: false,
      },
    });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found.' });
    }

    res.status(200).json({status: true, message: 'User found Successfully', user :user});
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
      include: {
        model: SubscriptionModel,
        as: 'subscription',
        required: false,
      },
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
      include: {
        model: SubscriptionModel,
        as: 'subscription',
        required: false,
      },
    });
    res.status(200).json({ status: true, message: 'Users retrieved successfully.', users });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving users.', error });
  }
};
