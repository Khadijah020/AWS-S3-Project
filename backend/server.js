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

// Connecting to database
connectDb();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Debugging for middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/s3', S3_Operations);
app.use('/api/dashboard', dashboardRoutes);

// Testing
app.get('/test', (req, res) => res.json({ message: 'Server is running!' }));

// Error handling
app.use(errorHandler);
app.use('*', (req, res) => res.status(404).json({ error: `Route ${req.originalUrl} not found` }));

// Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));

// Handling unhandled promise rejections
process.on('unhandledRejection', (error) => console.error('Unhandled Rejection:', error));
