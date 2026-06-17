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

const emailUser = process.env.EMAIL_USER?.trim();
const emailPass = process.env.EMAIL_PASS?.trim();
const emailMode = process.env.EMAIL_MODE?.trim().toLowerCase() || 'smtp';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

const isEmailConfigured = () => emailMode === 'console' || Boolean(emailUser && emailPass);

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
      if (!isEmailConfigured()) {
        return res.status(503).json({
          error: 'Password reset email is not configured. Set EMAIL_USER and EMAIL_PASS in backend/.env.',
        });
      }

      const user = await User.findOne({ email });
      // Don't reveal whether the email exists
      if (!user) return res.status(200).json({ message: 'If that email exists, a reset link has been sent.' });

      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
      user.resetToken = hashedToken;
      user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

      if (emailMode === 'console') {
        console.log(`Password reset link for ${email}: ${resetUrl}`);
        return res.status(200).json({ message: 'Reset link generated. Check the backend console.' });
      }

      try {
        await transporter.sendMail({
          from: emailUser,
          to: email,
          subject: 'Password Reset Request',
          text: `Click the following link to reset your password (expires in 1 hour): ${resetUrl}`,
        });
      } catch (mailError) {
        console.error(
          'Reset email could not be sent:',
          mailError.code || 'SMTP_ERROR',
          mailError.response || mailError.message
        );
        return res.status(503).json({
          error: 'Password reset email could not be sent. Check EMAIL_USER and EMAIL_PASS (Gmail requires an app password).',
        });
      }

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
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const user = await User.findOne({
        resetToken: hashedToken,
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
