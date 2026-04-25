const mongoose = require('mongoose');

const deviceDataSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
    },
    deviceName: {
        type: String,
    },
    // Switch state: true = ON/Started, false = OFF/Stopped
    switch: {
        type: Boolean,
        default: false,
    },
    startTime: {
        type: Date,
    },
    stopTime: {
        type: Date,
    },
    flRadar: {
        type: Number,
    },
    frRadar: {
        type: Number,
    },
    rlRadar: {
        type: Number,
    },
    rrRadar: {
        type: Number,
    },
    brakeStatus: {
        type: String,
        enum: ['APPLIED', 'RELEASED'],
        default: 'RELEASED',
    },
    lux: {
        type: Number,
    },
    headlightStatus: {
        type: String,
        enum: ['ON', 'OFF'],
        default: 'OFF',
    },
    timestamp: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('DeviceData', deviceDataSchema);
