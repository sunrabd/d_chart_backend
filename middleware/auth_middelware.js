const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
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
const verifyRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: false, message: 'Access denied for this role.' });
    }
    next();
  };
}
module.exports = { authenticateToken, verifyRole };