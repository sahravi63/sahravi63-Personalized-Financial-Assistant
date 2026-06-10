const express = require('express');
const router = express.Router();
const User = require('../db/User');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  },
});

// Update profile endpoint
router.post('/updateProfile', authenticateToken, upload.single('profilePic'), async (req, res) => {
  const { name } = req.body;
  const profilePic = req.file ? req.file.path : null;

  try {
    const updateData = { name };
    if (profilePic) {
      updateData.profilePic = profilePic;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Fetch current user profile
router.get('/current-user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ name: user.name, profilePic: user.profilePic });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

module.exports = router;
