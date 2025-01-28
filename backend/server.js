const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const connectDb = require('./config/db.js');
const userRoutes = require('./routes/authRoutes.js');
const errorHandler = require('./middlewares/errorHandler.js');
const fileRoutes = require('./routes/fileRouteDB.js');
const S3_Operations = require('./routes/S3_Operations.js');
const dashboardRoutes = require('./routes/dashboardRoutes.js');

const app = express();
const port = process.env.PORT || 5000; 

// Debug middleware
app.use((req, res, next) => {
  console.log('\n--- Incoming Request ---');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Connect to database
console.log('Attempting database connection...');
connectDb();

// CORS configuration
app.use(cors({ 
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());

// Basic test route
app.get('/test', (req, res) => {
  console.log('Test route accessed');
  res.json({ message: 'Server is running!' });
});

// Register routes with logging
console.log('Registering routes...');

app.use('/api/users', (req, res, next) => {
  console.log('User route accessed');
  next();
}, userRoutes);

app.use('/api/file', (req, res, next) => {
  console.log('File route accessed');
  next();
}, fileRoutes);

app.use('/api/s3', (req, res, next) => {
  console.log('S3 route accessed');
  next();
}, S3_Operations);

app.use('/api/dashboard', (req, res, next) => {
  console.log('Dashboard route accessed');
  next();
}, dashboardRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({ 
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(port, () => {
  console.log('\n=== Server Configuration ===');
  console.log(`Server running on port ${port}`);
  console.log('\nRegistered Routes:');
  console.log('- GET /test');
  console.log('- GET /api/dashboard');
  console.log('- /api/users');
  console.log('- /api/file');
  console.log('- /api/s3');
});

// Error handling for unhandled promises
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});