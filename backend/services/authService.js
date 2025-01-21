const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
const registerUser = async (username, email, password) => {
    console.log("Registering user...");
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already registered!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);
    const newUser = new User({ username, email, password: hashedPassword });
    console.log("New User:", newUser);
    
    try {
        await newUser.save();
        console.log("User saved to DB");
    } catch (error) {
        console.error("Error saving user:", error.message);
        throw new Error("Failed to save user to database.");
    }
    return newUser;
};

// Login user and generate JWT token
const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Invalid email or password');
    }

    const accessToken = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );
    return accessToken;
};

module.exports = { registerUser, loginUser };
