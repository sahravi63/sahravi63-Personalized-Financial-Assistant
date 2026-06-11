const express = require('express');
const router = express.Router();
const User = require('../db/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// POST /api/register
router.post('/register', authLimiter,
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
  async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({ username, email, password: hashedPassword });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// POST /api/login
router.post('/login', authLimiter,
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return res.status(400).json({ error: 'Invalid credentials' });

      // Include role in JWT so admin middleware can verify it
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '8h', algorithm: 'HS256' }
      );

      res.status(200).json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

// POST /api/reset-password-request
router.post('/reset-password-request', authLimiter,
  body('email').isEmail().normalizeEmail(),
  validate,
  async (req, res) => {
    const { email } = req.body;
    try {
      const user = await User.findOne({ email });
      // Don't reveal whether the email exists
      if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetToken = resetToken;
      user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        text: `Click the following link to reset your password (expires in 1 hour): ${resetUrl}`,
      });

      res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
      console.error('Reset request error:', err);
      res.status(500).json({ error: 'Failed to process reset request' });
    }
  }
);

// POST /api/reset-password
router.post('/reset-password',
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
  async (req, res) => {
    const { token, newPassword } = req.body;
    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });
      if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

      user.password = await bcrypt.hash(newPassword, 12);
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }
);

module.exports = router;
