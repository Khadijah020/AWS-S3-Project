const jwt = require('jsonwebtoken');

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('All fields are required');
  }

  const token = await loginUser(email, password);
  res.status(200).json({ token });
});

module.exports = { register, login, currentUser };
