const path = require('path');
const bcrypt = require('bcrypt');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('./db/User');
const { listenWithFallback } = require('./utils/serverConfig');

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001,https://finance-tawny.vercel.app')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const summaryRoutes = require('./routes/summaryRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(express.static('uploads'));

// Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', expenseRoutes);
app.use('/api', incomeRoutes);
app.use('/api', summaryRoutes);
app.use('/api', insightsRoutes);
app.use('/admin', adminRoutes);
app.use('/api', userRoutes);

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username email');
    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Database initialization
async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    const adminEmail = 'admin@example.com';

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);

      await User.create({
        username: 'admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });

      console.log('Default admin user created');
    } else {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
      }
      console.log('Admin user already exists');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
  });
});

// Start application
async function startServer() {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb://localhost:27017/informations';

    await mongoose.connect(mongoUri);

    console.log('MongoDB connected');

    await initializeDatabase();

    const PORT = Number(process.env.PORT || 8080);

    await listenWithFallback(app, PORT);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
