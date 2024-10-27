const express = require('express');
const router = express.Router();
const User = require('../db/User');
const bcrypt = require('bcrypt'); // Ensure bcrypt is imported for password hashing

// Add a new user
router.post('/add-user', async (req, res) => {
  try {
    const {  email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User added successfully!', user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove a user
router.delete('/remove-user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User removed successfully!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
