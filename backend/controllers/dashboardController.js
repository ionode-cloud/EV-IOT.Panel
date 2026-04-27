const mongoose = require('mongoose');
const Dashboard = require('../models/Dashboard');
const Device = require('../models/Device');
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Auto-generate a unique particle-style ID
const generateParticleId = () => crypto.randomBytes(12).toString('hex');

exports.createDashboard = async (req, res) => {
    try {
        // Root Admin check
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access Denied. Root Admin only.' });
        }
        const { dashboardName, deviceId, email, password, enabledFeatures, description } = req.body;

        if (!dashboardName || !deviceId || !email || !password) {
            return res.status(400).json({ message: 'Dashboard name, Device ID, Email, and Password are required.' });
        }

        // Find or register the device
        let device = await Device.findOne({ deviceId });
        if (!device) {
            // Auto-register device if it doesn't exist
            const newParticleId = generateParticleId();
            device = new Device({
                deviceName: `${dashboardName} Device`,
                deviceId,
                particleId: newParticleId,
                createdBy: req.user ? req.user.email : 'admin'
            });
            await device.save();
        }

        // Handle User Assignment
        let user = await User.findOne({ email });

        if (!user) {
            // Create a new user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = new User({
                email,
                password: hashedPassword,
                plainPassword: password, // For admin visibility
                role: 'user',
                isVerified: true // Auto-verify
            });
            await user.save();
        } else {
            // User exists, verify password or update logic?
            // Since admin is assigning it, maybe they are setting a new password, or they just need to provide the correct one.
            let isMatch = false;
            if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
                isMatch = await bcrypt.compare(password, user.password);
            } else {
                isMatch = password === user.password;
            }

            if (!isMatch) {
                return res.status(400).json({ message: 'User already exists, but the provided password is incorrect.' });
            }
        }

        // Auto-generate particle ID
        const particleId = generateParticleId();

        const dashboard = new Dashboard({
            dashboardName,
            particleId,
            deviceId,
            enabledFeatures: enabledFeatures || ['batterySOC', 'batteryVoltage', 'batteryTemperature', 'motorTemperature', 'motorRPM', 'wheelRPM', 'loss', 'torque', 'gps'],
            description: description || '',
            user: user._id
        });

        await dashboard.save();
        res.status(201).json({ message: 'Dashboard created successfully', dashboard, user: { email: user.email, _id: user._id } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getDashboards = async (req, res) => {
    try {
        // Base query: if user filter is applicable (Standard User sees only their own)
        let query = (!req.user || req.user.role === 'admin' || req.user.role === 'operator') ? {} : { user: req.user._id };
        
        const dashboards = await Dashboard.find(query).populate('user', 'email');
        
        // Enrich dashboards with deviceName from the Device model
        const deviceIds = [...new Set(dashboards.map(d => d.deviceId).filter(Boolean))];
        const devices = await Device.find({ deviceId: { $in: deviceIds } });
        
        const deviceMap = devices.reduce((acc, dev) => {
            acc[dev.deviceId] = dev;
            return acc;
        }, {});

        const enrichedDashboards = dashboards.map(d => ({
            ...d.toObject(),
            deviceName: deviceMap[d.deviceId]?.deviceName || 'Unknown Device',
            location: deviceMap[d.deviceId]?.location || 'Unknown Location'
        }));

        res.status(200).json(enrichedDashboards);
    } catch (error) {
        console.error('GET ALL DASHBOARDS ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getDashboardById = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Dashboard ID format' });
        }

        let query = { _id: id };
        // Filter by user if not admin/operator
        if (req.user && req.user.role !== 'admin' && req.user.role !== 'operator') {
            query.user = req.user._id;
        }

        const dashboard = await Dashboard.findOne(query).populate('user', 'email');
        
        if (!dashboard) {
            return res.status(404).json({ message: 'Dashboard not found' });
        }

        // Enrich with device metadata
        const device = await Device.findOne({ deviceId: dashboard.deviceId });
        
        const enriched = {
            ...dashboard.toObject(),
            deviceName: device?.deviceName || 'Unknown Device',
            location: device?.location || 'Unknown Location'
        };

        res.status(200).json(enriched);
    } catch (error) {
        console.error('GET DASHBOARD BY ID ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteDashboard = async (req, res) => {
    try {
        const id = req.params.id || req.body.id || req.query.id;
        
        if (!id) {
            return res.status(400).json({ message: 'Dashboard ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Dashboard ID format' });
        }

        const deleted = await Dashboard.findByIdAndDelete(id);
        
        if (!deleted) {
            return res.status(404).json({ message: 'Dashboard not found' });
        }

        res.status(200).json({ message: 'Dashboard deleted successfully' });
    } catch (error) {
        console.error('CRITICAL DELETE ERROR:', error);
        res.status(500).json({ 
            message: 'Internal Server Error', 
            error: error.message
        });
    }
};

// PUT /api/dashboards - Update dashboard
exports.updateDashboard = async (req, res) => {
    try {
        // Root Admin check
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access Denied. Root Admin only.' });
        }
        
        const id = req.params.id || req.body.id || req.query.id;
        if (!id) {
            return res.status(400).json({ message: 'Dashboard ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Dashboard ID format' });
        }
        
        const { dashboardName, deviceId, description } = req.body;
        const updated = await Dashboard.findByIdAndUpdate(id, { 
            dashboardName, 
            deviceId, 
            description 
        }, { new: true });

        if (!updated) {
            return res.status(404).json({ message: 'Dashboard not found' });
        }

        res.status(200).json({ message: 'Dashboard updated successfully', data: updated });
    } catch (error) {
        console.error('UPDATE DASHBOARD ERROR:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

