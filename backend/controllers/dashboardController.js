const asyncHandler = require('express-async-handler');
const { getDashboardStats } = require('../services/dashboardService');

const fetchDashboardStats = asyncHandler(async (req, res) => {
    try {
        const email = req.user.email;
        const stats = await getDashboardStats(email);
        res.status(200).json(stats);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ 
            message: error.message || 'Failed to fetch dashboard statistics'
        });
    }
});

module.exports = { fetchDashboardStats };
