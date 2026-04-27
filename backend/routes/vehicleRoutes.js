const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

// Telemetry data (from ESP32/IoT device)
router.post('/data', vehicleController.storeVehicleData);        // POST   — store telemetry
router.get('/history', vehicleController.getVehicleHistory);     // GET    — history log
router.get('/latest', vehicleController.getLatestVehicleData);  // GET    — latest record
router.get('/last-hour', vehicleController.getLastHourStatus);  // GET    — last 60 min records
router.delete('/data', protect, vehicleController.deleteVehicleData);    // DELETE — clear device data

// Switch control (from dashboard UI or external system)
router.get('/switch', vehicleController.getSwitchState);         // GET    — current switch state
router.post('/switch', protect, vehicleController.toggleSwitch);          // POST   — toggle ON/OFF
router.put('/switch', protect, vehicleController.setSwitch);              // PUT    — force set state

module.exports = router;
