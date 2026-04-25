const DeviceData = require('../models/DeviceData');
const Device = require('../models/Device');
const ExcelJS = require('exceljs');

// ESP32 sends data here
exports.receiveData = async (req, res) => {
    try {
        const { 
            deviceId, batteryTemp, batterySOC, batteryVoltage, 
            motorTemp, motorRPM, wheelRPM, loss, torque,
            latitude, longitude, speed,
            flRadar, frRadar, rlRadar, rrRadar, 
            brakeStatus, lux, headlightStatus 
        } = req.body;

        // Validate device connection
        const device = await Device.findOne({ deviceId });
        if (!device) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Update last seen
        device.lastSeen = new Date();
        await device.save();

        let mappedBrakeStatus = brakeStatus;
        if (brakeStatus === 1 || brakeStatus === '1') mappedBrakeStatus = 'APPLIED';
        else if (brakeStatus === 0 || brakeStatus === '0') mappedBrakeStatus = 'RELEASED';

        let mappedHeadlightStatus = headlightStatus;
        if (headlightStatus === 1 || headlightStatus === '1') mappedHeadlightStatus = 'ON';
        else if (headlightStatus === 0 || headlightStatus === '0') mappedHeadlightStatus = 'OFF';

        const newData = new DeviceData({
            deviceId,
            batteryTemperature: batteryTemp,
            batterySOC,
            batteryVoltage,
            motorTemperature: motorTemp,
            motorRPM,
            wheelRPM,
            loss,
            torque,
            gpsLatitude: latitude,
            gpsLongitude: longitude,
            speed,
            flRadar,
            frRadar,
            rlRadar,
            rrRadar,
            brakeStatus: mappedBrakeStatus,
            lux,
            headlightStatus: mappedHeadlightStatus
        });

        await newData.save();

        // Emit real-time update via Socket.io
        req.io.emit('device-data', newData);

        res.status(200).json({ message: 'Data received successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get device data history
exports.getHistory = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const history = await DeviceData.find({ deviceId }).sort({ timestamp: -1 }).limit(100);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Download Excel File
exports.downloadExcel = async (req, res) => {
    try {
        const { deviceId, startDate, endDate } = req.query;

        const query = { deviceId };
        if (startDate && endDate) {
            query.timestamp = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const data = await DeviceData.find(query).sort({ timestamp: -1 });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Device Data Logs');

        worksheet.columns = [
            { header: 'Device ID', key: 'deviceId', width: 20 },
            { header: 'Battery Temp (°C)', key: 'batteryTemperature', width: 15 },
            { header: 'Battery SOC (%)', key: 'batterySOC', width: 15 },
            { header: 'Battery Voltage (V)', key: 'batteryVoltage', width: 15 },
            { header: 'Motor Temp (°C)', key: 'motorTemperature', width: 15 },
            { header: 'Motor RPM', key: 'motorRPM', width: 15 },
            { header: 'Wheel RPM', key: 'wheelRPM', width: 15 },
            { header: 'Loss', key: 'loss', width: 12 },
            { header: 'Torque (Nm)', key: 'torque', width: 12 },
            { header: 'Latitude', key: 'gpsLatitude', width: 15 },
            { header: 'Longitude', key: 'gpsLongitude', width: 15 },
            { header: 'Timestamp', key: 'timestamp', width: 25 },
        ];

        data.forEach(item => {
            worksheet.addRow({
                deviceId: item.deviceId,
                batteryTemperature: item.batteryTemperature,
                batterySOC: item.batterySOC,
                batteryVoltage: item.batteryVoltage,
                motorTemperature: item.motorTemperature,
                motorRPM: item.motorRPM,
                wheelRPM: item.wheelRPM,
                loss: item.loss,
                torque: item.torque,
                gpsLatitude: item.gpsLatitude,
                gpsLongitude: item.gpsLongitude,
                timestamp: item.timestamp,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=DeviceData_${deviceId}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const fs = require('fs');

exports.uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.readFile(req.file.path);
        const worksheet = workbook.getWorksheet(1);

        const dataBuffer = [];
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            // Expected columns: 1: Device ID, 2: Device Name, 3: Battery Temp, 4: SOC, 5: Voltage, 6: Motor Temp, 7: Motor RPM, 8: Wheel RPM, 9: Loss, 10: Torque, 11: Latitude, 12: Longitude, 13: Timestamp
            const deviceId = row.getCell(1).value;
            if (!deviceId) return;

            dataBuffer.push({
                deviceId: String(deviceId),
                deviceName: String(row.getCell(2).value || ''),
                batteryTemperature: Number(row.getCell(3).value) || 0,
                batterySOC: Number(row.getCell(4).value) || 0,
                batteryVoltage: Number(row.getCell(5).value) || 0,
                motorTemperature: Number(row.getCell(6).value) || 0,
                motorRPM: Number(row.getCell(7).value) || 0,
                wheelRPM: Number(row.getCell(8).value) || 0,
                loss: Number(row.getCell(9).value) || 0,
                torque: Number(row.getCell(10).value) || 0,
                gpsLatitude: Number(row.getCell(11).value) || 0,
                gpsLongitude: Number(row.getCell(12).value) || 0,
                timestamp: row.getCell(13).value ? new Date(row.getCell(13).value) : new Date(),
            });
        });

        if (dataBuffer.length > 0) {
            await DeviceData.insertMany(dataBuffer);
        }

        // Clean up
        fs.unlinkSync(req.file.path);

        res.status(200).json({ message: `Successfully imported ${dataBuffer.length} records.`, count: dataBuffer.length });
    } catch (error) {
        console.error('Upload Error:', error);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ message: 'Error processing excel file', error: error.message });
    }
};
