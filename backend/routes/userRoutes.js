const express = require('express');
const router = express.Router();
const User = require('../db/User');
const bcrypt = require('bcrypt');
const adminAuthenticate = require('../adminAuthenticate');

// Add a new user
router.post('/add-user', adminAuthenticate, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User added successfully!', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove a user
router.delete('/remove-user/:userId', adminAuthenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User removed successfully!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
