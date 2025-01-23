const express = require('express');
const { register, login, currentUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/current', protect, currentUser); // Protected route

module.exports = router;
