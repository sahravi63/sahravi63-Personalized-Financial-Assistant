const jwt = require('jsonwebtoken');
const User = require('../db/User');

/**
 * Verifies JWT and attaches the full User document to req.user.
 * Reads role from the token for a quick admin check without a DB hit,
 * then fetches the full user so controllers have access to all fields.
 */
const authenticateToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.sendStatus(403);
  }

  try {
    const user = await User.findById(decoded.id).select('-password -resetToken -resetTokenExpiration');
    if (!user) return res.sendStatus(404);
    req.user = user;
    next();
  } catch (error) {
    console.error('authenticateToken DB error:', error);
    return res.sendStatus(500);
  }
};

module.exports = authenticateToken;
