const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const s3 = require('../config/aws');

// Register a new user
const registerUser = async (username, email, password) => {
    console.log("Registering user...");

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('User already registered!');
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed Password:", hashedPassword);
    const newUser = new User({ username, email, password: hashedPassword });
    console.log("New User:", newUser);

    try {
        // Save user to database
        await newUser.save();
        console.log("User saved to DB");

        // Create a folder in S3 for the user
        const folderName = `${email}`; // S3 uses "/" for folder-like structures
        const params = {
            Bucket: "awsproj-1",
            Key: folderName,
        };

        await s3.putObject(params).promise();
        console.log(`S3 folder created for user: ${folderName}`);
    } catch (error) {
        console.error("Error during user registration:", error.message);
        throw new Error("Failed to register user.");
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
