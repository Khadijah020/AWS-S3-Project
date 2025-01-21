// Server initialization and startup

const express = require('express');
const cors = require("cors");
const dotenv = require('dotenv').config();
const connectDb = require('./config/db.js');
const errorHandler = require('./middlewares/errorHandler');
const userRoutes = require('./routes/authRoutes');

const app = express();
const port = process.env.PORT || 5001;

connectDb();
app.use(cors({ origin: "http://localhost:3000" }));

app.use(express.json());
app.use('/api/users', userRoutes);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
