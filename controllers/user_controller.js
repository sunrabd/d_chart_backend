const User = require('../models/user_model');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt'); // Import bcrypt
const upload = require('../middleware/upload');

// Sign Up
exports.signUp = async (req, res) => {
  const uploadSingle = upload.single('profilePicture');

  uploadSingle(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err.message });
    }

    const { name, mobile_no, email, password, deviceId, deviceToken } = req.body;
    const profilePicture = req.file ? req.file.path : null;

    if (!name || !mobile_no || !email || !password) {
      return res.status(400).json({ status: false, message: 'All fields are required for signup.' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password
      const user = await User.create({
        name,
        mobile_no,
        email,
        password: hashedPassword,
        deviceId,
        deviceToken,
        profilePicture,
      });

      res.status(201).json({ status: true, message: 'User signed up successfully.', user });
    } catch (error) {
      res.status(500).json({ status: false, message: 'Error signing up user.', error });
    }
  });
};

// Sign In
exports.signIn = async (req, res) => {
  const { mobile_no, password, deviceId, deviceToken } = req.body;

  if (!mobile_no || !password) {
    return res.status(400).json({ status: false, message: 'Mobile number and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { mobile_no } });
    if (!user) {
      return res.status(404).json({ status: false, message: 'Invalid credentials.' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: false, message: 'Invalid credentials.' });
    }

    // Update deviceId and deviceToken
    user.deviceId = deviceId || user.deviceId;
    user.deviceToken = deviceToken || user.deviceToken;
    await user.save();

    res.status(200).json({ status: true, message: 'Sign in successful.', user });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error signing in.', error });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found.' });
    }

    await user.update(updates);
    res.status(200).json({ status: true, message: 'User updated successfully.', user });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error updating user.', error });
  }
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
exports.getAllUsers = async (req, res) => {
  try {
    const { name } = req.query;
    const users = await User.findAll({
      where: name ? { name: { [Op.like]: `%${name}%` } } : {},
    });
    res.status(200).json({status: true, message: 'fetch user successfully',users});
  } catch (error) {
    res.status(500).json({ status: true, message: 'Error retrieving users.', error });
  }
};

// Get User By ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found.' });
    }

    res.status(200).json({status: true, message: 'User found Successfully', user :user});
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving user.', error });
  }
};
