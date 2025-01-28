const express = require('express');
const { fetchDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

console.log('Initializing dashboard routes...');

router.get('/', (req, res, next) => {
  console.log('Dashboard root route accessed');
  next();
}, protect, fetchDashboardStats);

module.exports = router;