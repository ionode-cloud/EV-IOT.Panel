const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { protect, admin } = require('../middleware/authMiddleware');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/device-data', dataController.receiveData); // Open API for ESP32
router.get('/history/:deviceId', dataController.getHistory); // Used by dashboard charts
router.get('/download', dataController.downloadExcel);
router.post('/upload-xlsx', protect, upload.single('file'), dataController.uploadExcel);

module.exports = router;
