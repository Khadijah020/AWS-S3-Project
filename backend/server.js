const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();
const connectDb = require('./config/db.js');
const userRoutes = require('./routes/authRoutes.js');
const errorHandler = require('./middlewares/errorHandler.js');
const fileRoutes = require('./routes/fileRouteDB.js');
const presignedUrlRoutes = require('./routes/presignedUrl.js');

const app = express();
const port = process.env.PORT || 5000; 

connectDb();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/api/users', userRoutes);
app.use("/api/file", fileRoutes);
app.use('/api/presigned-url', presignedUrlRoutes);
app.use(errorHandler);
app.listen(port, () => console.log(`Server running on port ${port}`));