//JWTconfiguration
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
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
};

module.exports = { generateToken };
