const path = require('path');
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const multer = require('multer');
const User = require('./db/User'); // Ensure User model is imported

dotenv.config();

const app = express();
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');

// Middleware
app.use(cors({
  // origin: 'http://localhost:3000',
  origin: 'https://finance-tawny.vercel.app/',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));
app.use(bodyParser.json());
app.use(express.static('uploads')); // Serve uploaded files

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/informations', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', expenseRoutes);
app.use('/api', incomeRoutes);

// Get all users endpoint
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username email'); // Changed to 'username' to match your User schema
    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
