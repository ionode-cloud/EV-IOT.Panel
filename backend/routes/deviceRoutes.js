const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, deviceController.addDevice);
router.get('/', deviceController.getDevices);
router.put('/:id', protect, admin, deviceController.updateDevice);
router.post('/status', deviceController.updateDeviceStatus);
router.delete('/:id', protect, admin, deviceController.deleteDevice);

module.exports = router;
