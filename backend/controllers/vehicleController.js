const DeviceData = require('../models/DeviceData');
const Device = require('../models/Device');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/vehicle/data  — ESP32 / IoT device sends telemetry
// ─────────────────────────────────────────────────────────────────────────────
exports.storeVehicleData = async (req, res) => {
    try {
        const {
            deviceId,
            switch: switchState
        } = req.body;

        if (!deviceId) {
            return res.status(400).json({ message: 'deviceId is required' });
        }

        // Check last record to detect state transitions
        const latest = await DeviceData.findOne({ deviceId }).sort({ timestamp: -1 });

        const currentSwitch = switchState !== undefined
            ? (switchState === 'true' || switchState === true || switchState === 1 || switchState === '1')
            : (latest ? latest.switch : false);

        const isStarting = currentSwitch === true && (!latest || latest.switch !== true);
        const isStopping = currentSwitch === false && latest && latest.switch === true;

        const newData = new DeviceData({
            deviceId,
            switch: currentSwitch,
            startTime: isStarting ? new Date() : (latest?.startTime || null),
            stopTime: isStopping ? new Date() : (latest?.stopTime || null),
        });

        await newData.save();
        await Device.findOneAndUpdate({ deviceId }, { lastSeen: new Date() });

        if (req.io) req.io.emit('newData', newData);

        res.status(201).json({ message: 'Vehicle data stored successfully', data: newData });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vehicle/switch?deviceId=xxx  — Get current switch state
// ─────────────────────────────────────────────────────────────────────────────
exports.getSwitchState = async (req, res) => {
    try {
        const { deviceId } = req.query;
        if (!deviceId) {
            return res.status(400).json({ message: 'deviceId is required' });
        }

        const latest = await DeviceData.findOne({ deviceId }).sort({ timestamp: -1 });

        if (!latest) {
            return res.status(200).json({
                deviceId,
                switch: false,
                startTime: null,
                stopTime: null,
                message: 'No data found — switch defaults to OFF (false)'
            });
        }

        res.status(200).json({
            deviceId,
            switch: latest.switch,
            startTime: latest.startTime,
            stopTime: latest.stopTime,
            timestamp: latest.timestamp,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/vehicle/switch  — Toggle switch ON(1) or OFF(0) from dashboard
// ─────────────────────────────────────────────────────────────────────────────
exports.toggleSwitch = async (req, res) => {
    try {
        const { deviceId, switchState } = req.body;

        if (!deviceId || switchState === undefined) {
            return res.status(400).json({ message: 'deviceId and switchState (0 or 1) are required' });
        }

        if (switchState !== true && switchState !== false && switchState !== 'true' && switchState !== 'false') {
            return res.status(400).json({ message: 'switchState must be true (ON) or false (OFF)' });
        }
        
        const val = switchState === true || switchState === 'true';

        const latest = await DeviceData.findOne({ deviceId }).sort({ timestamp: -1 });

        // Determine start/stop timestamps
        const isStarting = val === true && (!latest || latest.switch !== true);
        const isStopping = val === false && latest && latest.switch === true;

        const newData = new DeviceData({
            deviceId,
            switch: val,
            startTime: isStarting ? new Date() : (latest?.startTime || null),
            stopTime: isStopping ? new Date() : (latest?.stopTime || null),

        });

        await newData.save();
        await Device.findOneAndUpdate({ deviceId }, { lastSeen: new Date() });

        if (req.io) req.io.emit('switchUpdate', { deviceId, switch: val, timestamp: newData.timestamp });

        res.status(200).json({
            message: `Switch turned ${val ? 'ON' : 'OFF'} successfully`,
            data: {
                deviceId,
                switch: val,
                switchLabel: val ? 'START (true)' : 'STOP (false)',
                startTime: newData.startTime,
                stopTime: newData.stopTime,
                timestamp: newData.timestamp,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/vehicle/switch  — Force set switch to a specific state (admin/manual)
// ─────────────────────────────────────────────────────────────────────────────
exports.setSwitch = async (req, res) => {
    try {
        const { deviceId, switchState, reason } = req.body;

        if (!deviceId || switchState === undefined) {
            return res.status(400).json({ message: 'deviceId and switchState (0 or 1) are required' });
        }

        if (switchState !== true && switchState !== false && switchState !== 'true' && switchState !== 'false') {
            return res.status(400).json({ message: 'switchState must be true or false' });
        }
        
        const val = switchState === true || switchState === 'true';

        const latest = await DeviceData.findOne({ deviceId }).sort({ timestamp: -1 });
        const isStarting = val === true && (!latest || latest.switch !== true);
        const isStopping = val === false && latest && latest.switch === true;

        const newData = new DeviceData({
            deviceId,
            switch: val,
            startTime: isStarting ? new Date() : (latest?.startTime || null),
            stopTime: isStopping ? new Date() : (latest?.stopTime || null),

        });

        await newData.save();
        await Device.findOneAndUpdate({ deviceId }, { lastSeen: new Date() });

        if (req.io) req.io.emit('switchUpdate', { deviceId, switch: val, reason, timestamp: newData.timestamp });

        res.status(200).json({
            message: `Switch forcefully set to ${val ? 'ON (true)' : 'OFF (false)'}`,
            reason: reason || 'Manual override',
            data: {
                deviceId,
                switch: val,
                switchLabel: val ? 'START (true)' : 'STOP (false)',
                startTime: newData.startTime,
                stopTime: newData.stopTime,
                timestamp: newData.timestamp,
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vehicle/latest?deviceId=xxx  — Latest telemetry record
// ─────────────────────────────────────────────────────────────────────────────
exports.getLatestVehicleData = async (req, res) => {
    try {
        const { deviceId } = req.query;
        if (!deviceId) {
            return res.status(400).json({ message: 'deviceId is required' });
        }
        const latest = await DeviceData.findOne({ deviceId }).sort({ timestamp: -1 });
        res.status(200).json(latest || {});
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vehicle/history?deviceId=xxx&limit=100&startDate=&endDate=
// ─────────────────────────────────────────────────────────────────────────────
exports.getVehicleHistory = async (req, res) => {
    try {
        const { deviceId, limit = 100, startDate, endDate } = req.query;
        if (!deviceId) {
            return res.status(400).json({ message: 'deviceId is required' });
        }

        let query = { deviceId };
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.timestamp.$lte = end;
            }
        }

        const history = await DeviceData.find(query).sort({ timestamp: -1 }).limit(parseInt(limit));
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/vehicle/last-hour?deviceId=xxx  — All records from last 60 minutes
// ─────────────────────────────────────────────────────────────────────────────
exports.getLastHourStatus = async (req, res) => {
    try {
        const { deviceId } = req.query;
        if (!deviceId) {
            return res.status(400).json({ message: 'deviceId is required' });
        }
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const records = await DeviceData.find({
            deviceId,
            timestamp: { $gte: oneHourAgo }
        }).sort({ timestamp: 1 });

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/vehicle/data?deviceId=xxx  — Delete all data records for a device
// ─────────────────────────────────────────────────────────────────────────────
exports.deleteVehicleData = async (req, res) => {
    try {
        const { deviceId } = req.query;
        if (!deviceId) {
            return res.status(400).json({ message: 'deviceId is required as query param' });
        }
        const result = await DeviceData.deleteMany({ deviceId });
        res.status(200).json({
            message: `Deleted ${result.deletedCount} records for device ${deviceId}`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
