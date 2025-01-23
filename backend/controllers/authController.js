const asyncHandler = require('express-async-handler');
const { registerUser, loginUser } = require('../services/authService');

const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const user = await registerUser(username, email, password);
    console.log("User registered:", user);
    res.status(201).json({ id: user._id, email: user.email });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('All fields are required');
    }

    const token = await loginUser(email, password);
    res.status(200).json({ token });
});

const currentUser = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

module.exports = { register, login, currentUser };
