const User = require('../models/user_model');

// Sign Up
exports.signUp = async (req, res) => {
  const { name, mobile_no, email, password } = req.body;

  if (!name || !mobile_no || !email || !password) {
    return res.status(400).json({ status: false, message: 'All fields are required for signup.' });
  }

  try {
    const user = await User.create({ name, mobile_no, email, password });
    res.status(201).json({ status: true, message: 'User signed up successfully.', user });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error signing up user.', error });
  }
};

// Sign In
exports.signIn = async (req, res) => {
  const { mobile_no, password } = req.body;

  if (!mobile_no || !password) {
    return res.status(400).json({ status: false, message: 'Mobile number and password are required.' });
  }

  try {
    const user = await User.findOne({ where: { mobile_no, password } });

    if (!user) {
      return res.status(404).json({ status: false, message: 'Invalid credentials.' });
    }

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
    const users = await User.findAll();
    res.status(200).json(users);
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

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ status: false, message: 'Error retrieving user.', error });
  }
};
