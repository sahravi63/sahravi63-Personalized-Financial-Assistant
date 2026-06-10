/**
 * Admin authentication middleware.
 * Verifies the JWT and confirms the user has role === 'admin'.
 * Replaces the old no-op authenticate.js import.
 */
const jwt = require('jsonwebtoken');

const adminAuthenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    req.user = decoded;
    next();
  });
};

module.exports = adminAuthenticate;
