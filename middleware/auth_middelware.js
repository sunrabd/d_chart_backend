const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/user_model')

const authenticateToken2 = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    
    return res.status(401).json({ status: false, message: 'Invalid or expired token' });
  }

  jwt.verify(token, process.env.API_SECRET, (err, user) => {
    if (err) {
      // if (err.name === 'TokenExpiredError') {
      //   return res.status(401).json({ status: false, message: 'Access token expired.' });
      // }
      return res.status(403).json({ status: false, message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

const authenticateToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ status:false, message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.API_SECRET);
    req.userId = decoded.id;

    const user = await User.findOne({
      where: { id: req.userId },
      attributes: ["jwt_api_token", "is_active"]
    });

    if (!user) {
      return res.status(401).json({status:false, message: "User not found." });
    }

    

    console.log(token);
    console.log(user.jwt_api_token);

    if (token !== user.jwt_api_token) {
      return res.status(401).json({status:false, message: "Session expired. Please log in again." });
    }

    await User.update({ is_active: true }, { where: { id: req.userId } });

    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({status:false, message: "Invalid token." });
  }
};

const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: false, message: 'Access denied for this role.' });
    }
    next();
  };
}
module.exports = { authenticateToken2, verifyRole, authenticateToken};