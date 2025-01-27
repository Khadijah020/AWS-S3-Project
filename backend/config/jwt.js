//JWTconfiguration
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
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

        console.log('Token generated with exp at:', new Date(Date.now() + 10 * 1000).toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
        console.log('JWT Expiry Time:', token.exp); // This is a log of the 'exp' claim in the token

        return token;
    };

};

module.exports = { generateToken };
