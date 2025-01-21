//JWT authentication middleware
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = await User.findById(decoded.user.id).select('-password');
        next();
    } catch (error) {
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
});

module.exports = { protect };
