const jwt = require('jsonwebtoken');

// Generating token for every user log
const generateToken = (user) => {
    const token = jwt.sign(
        {
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );

    console.log('Token generated with exp at:', new Date(Date.now() + 15 * 1000).toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
    
    const decoded = jwt.decode(token); 
    console.log('JWT Expiry Time (decoded):', decoded.exp);

    return token;
};

module.exports = { generateToken };