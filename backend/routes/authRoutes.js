// Routes for user authentication and Registration
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);

router.post('/login', login);

module.exports = router;
