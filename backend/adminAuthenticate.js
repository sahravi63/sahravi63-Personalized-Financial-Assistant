/**
 * Admin authentication middleware.
 * Verifies the JWT and confirms the user has role === 'admin'.
 * Replaces the old no-op authenticate.js import.
 */
const jwt = require('jsonwebtoken');
const User = require('./db/User');

const adminAuthenticate = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  if (decoded.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  try {
    const user = await User.findById(decoded.id).select('-password -refreshTokenHash -refreshTokenExpiresAt -resetToken -resetTokenExpiration');
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error('Admin authenticate DB error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = adminAuthenticate;
