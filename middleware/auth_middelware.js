const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: false, message: 'Access token is required.' });
  }

  jwt.verify(token, process.env.API_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ status: false, message: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };