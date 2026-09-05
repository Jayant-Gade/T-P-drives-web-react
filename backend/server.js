const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();

const seedDatabase = require('./config/seed');

// Connect MongoDB Database and Seed initial data
connectDB().then(() => {
  seedDatabase();
});


// Core Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'T&P Cell Placement Management System API',
    timestamp: new Date().toISOString(),
  });
});

// Mount Domain Route Modules
app.use('/api/datasets', require('./routes/datasetRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/drives', require('./routes/driveRoutes'));
app.use('/api/eligibility', require('./routes/eligibilityRoutes'));

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[T&P Backend Server running on PORT ${PORT}]`);
  console.log(`[Health check available at http://localhost:${PORT}/api/health]`);
});
