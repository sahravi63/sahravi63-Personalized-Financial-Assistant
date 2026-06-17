const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();
const adminAuthenticate = require('../adminAuthenticate');
const User = require('../db/User');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '8h',
      algorithm: 'HS256',
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await User.findByIdAndUpdate(user._id, {
      refreshTokenHash,
      refreshTokenExpiresAt,
    });

    return res.json({
      success: true,
      accessToken,
      refreshToken,
      admin: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Failed to sign in as admin' });
  }
});

router.post('/refresh-token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'Refresh token is required' });

  const hashedRefreshToken = crypto.createHash('sha256').update(token).digest('hex');

  try {
    const user = await User.findOne({
      refreshTokenHash: hashedRefreshToken,
      role: 'admin',
      refreshTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(403).json({ error: 'Invalid or expired admin refresh token' });
    }

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '8h',
      algorithm: 'HS256',
    });

    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const refreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await User.findByIdAndUpdate(user._id, {
      refreshTokenHash: newRefreshTokenHash,
      refreshTokenExpiresAt,
    });

    return res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Admin refresh-token error:', err);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// All routes in this file are admin-protected
router.use(adminAuthenticate);

router.post('/logout', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $unset: { refreshTokenHash: '', refreshTokenExpiresAt: '' },
    });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Admin logout error:', err);
    res.status(500).json({ error: 'Failed to log out' });
  }
});

// GET /admin/dashboard
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Welcome to Admin Dashboard', admin: req.user });
});

// GET /admin/users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password -refreshTokenHash -refreshTokenExpiresAt -resetToken -resetTokenExpiration');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id, '-password -refreshTokenHash -refreshTokenExpiresAt -resetToken -resetTokenExpiration');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// PUT /admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    // Prevent escalating own role via this endpoint if desired — for now allow admin to manage roles
    const { password, resetToken, resetTokenExpiration, ...safeUpdate } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.params.id, safeUpdate, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
