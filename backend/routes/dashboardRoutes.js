const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', dashboardController.getDashboards);
router.get('/:id', dashboardController.getDashboardById);

// Authenticated routes
router.post('/', protect, admin, dashboardController.createDashboard);
router.put('/:id', protect, admin, dashboardController.updateDashboard);
router.delete('/:id', protect, admin, dashboardController.deleteDashboard);

module.exports = router;
