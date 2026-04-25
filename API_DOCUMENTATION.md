# EVIoT Panel — API Documentation

**Base URL:** `http://localhost:5112`  
**Version:** 1.0.0  
**Auth:** Bearer JWT token (where indicated)

> **How to get a token:** Call `POST /api/auth/login` and copy the `token` from the response.  
> Add it to every protected request as:  
> `Authorization: Bearer <your_token_here>`

---

## 📋 Table of Contents

1. [Health Check](#1-health-check)
2. [Authentication](#2-authentication)
3. [Vehicle Switch Control](#3-vehicle-switch-control)
4. [Vehicle Telemetry Data](#4-vehicle-telemetry-data)
5. [Devices](#5-devices)
6. [Dashboards](#6-dashboards)
7. [Users](#7-users)
8. [Socket.IO Events](#8-socketio-events)
9. [Error Codes](#9-error-codes)

---

## 1. Health Check

### GET `/api/health`

Check if the server and database are running.

**Auth:** None  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/health
```

**Response `200`:**
```json
{
  "status": "UP",
  "time": "2026-04-25T07:00:00.000Z",
  "dbStatus": "Connected"
}
```

---

## 2. Authentication

### POST `/api/auth/register`

Register a new user account.

**Auth:** None  
**Method:** `POST`

**Postman Setup:**
```
POST http://localhost:5112/api/auth/register
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

**Response `201`:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST `/api/auth/login`

Login and get a JWT token.

**Auth:** None  
**Method:** `POST`

**Postman Setup:**
```
POST http://localhost:5112/api/auth/login
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "admin@eviot.com",
  "password": "EVIoT@2024"
}
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "664abc123...",
    "email": "admin@eviot.com",
    "role": "admin"
  }
}
```

---

### GET `/api/auth/verify`

Verify the current session token.

**Auth:** ✅ Bearer Token  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/auth/verify
Authorization: Bearer <token>
```

**Response `200`:**
```json
{
  "_id": "664abc123...",
  "email": "admin@eviot.com",
  "role": "admin"
}
```

---

## 3. Vehicle Switch Control

> The switch represents the EV start/stop state.  
> `switch: true` = **START / ON** | `switch: false` = **STOP / OFF**

---

### GET `/api/vehicle/switch`

Get the **current switch state** of a device.

**Auth:** None  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/vehicle/switch?deviceId=EV-001
```

**Query Params:**
| Param | Required | Description |
|-------|----------|-------------|
| `deviceId` | ✅ | The device ID string |

**Response `200`:**
```json
{
  "deviceId": "EV-001",
  "switch": true,
  "switchLabel": "START (true)",
  "startTime": "2026-04-25T07:10:00.000Z",
  "stopTime": null,
  "timestamp": "2026-04-25T07:10:00.000Z"
}
```

---

### POST `/api/vehicle/switch`

**Toggle** the EV switch ON or OFF (sends a new record with the desired state).

**Auth:** None  
**Method:** `POST`

**Postman Setup:**
```
POST http://localhost:5112/api/vehicle/switch
Content-Type: application/json
```

**Body (raw JSON) — Turn ON:**
```json
{
  "deviceId": "EV-001",
  "switchState": true
}
```

**Body (raw JSON) — Turn OFF:**
```json
{
  "deviceId": "EV-001",
  "switchState": false
}
```

**Response `200`:**
```json
{
  "message": "Switch turned ON successfully",
  "data": {
    "deviceId": "EV-001",
    "switch": true,
    "switchLabel": "START (true)",
    "startTime": "2026-04-25T07:10:00.000Z",
    "stopTime": null,
    "timestamp": "2026-04-25T07:10:00.000Z"
  }
}
```

---

### PUT `/api/vehicle/switch`

**Force set** the switch to a specific state (admin override / dashboard manual control).

**Auth:** None  
**Method:** `PUT`

**Postman Setup:**
```
PUT http://localhost:5112/api/vehicle/switch
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "deviceId": "EV-001",
  "switchState": false,
  "reason": "Emergency stop from dashboard"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deviceId` | String | ✅ | Target device ID |
| `switchState` | Boolean | ✅ | `true` = ON, `false` = OFF |
| `reason` | String | ❌ | Optional reason for override |

**Response `200`:**
```json
{
  "message": "Switch forcefully set to OFF (false)",
  "reason": "Emergency stop from dashboard",
  "data": {
    "deviceId": "EV-001",
    "switch": false,
    "switchLabel": "STOP (false)",
    "startTime": "2026-04-25T07:10:00.000Z",
    "stopTime": "2026-04-25T07:25:00.000Z",
    "timestamp": "2026-04-25T07:25:00.000Z"
  }
}
```

---

## 4. Vehicle Telemetry Data

### POST `/api/vehicle/data`

Store telemetry data sent by the ESP32 / IoT device.

**Auth:** None (open for IoT devices)  
**Method:** `POST`

**Postman Setup:**
```
POST http://localhost:5112/api/vehicle/data
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "deviceId": "EV-001",
  "switch": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deviceId` | String | ✅ | Unique device identifier |
| `switch` | Boolean | ❌ | `true` = ON, `false` = OFF |

**Response `201`:**
```json
{
  "message": "Vehicle data stored successfully",
  "data": {
    "_id": "664abc...",
    "deviceId": "EV-001",
    "switch": true,
    "timestamp": "2026-04-25T07:10:00.000Z"
  }
}
```

---

### GET `/api/vehicle/latest`

Get the **most recent** telemetry record for a device.

**Auth:** None  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/vehicle/latest?deviceId=EV-001
```

**Response `200`:**
```json
{
  "_id": "664abc...",
  "deviceId": "EV-001",
  "switch": true,
  "startTime": "2026-04-25T07:10:00.000Z",
  "stopTime": null,
  "timestamp": "2026-04-25T07:15:00.000Z"
}
```

---

### GET `/api/vehicle/history`

Get **historical** telemetry records with optional date filtering.

**Auth:** None  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/vehicle/history?deviceId=EV-001&limit=50&startDate=2026-04-25&endDate=2026-04-25
```

**Query Params:**
| Param | Required | Default | Description |
|-------|----------|---------|-------------|
| `deviceId` | ✅ | — | Device ID |
| `limit` | ❌ | 100 | Max records to return |
| `startDate` | ❌ | — | Filter start `YYYY-MM-DD` |
| `endDate` | ❌ | — | Filter end `YYYY-MM-DD` |

**Response `200`:** Array of telemetry records (newest first).

---

### GET `/api/vehicle/last-hour`

Get all telemetry records from the **past 60 minutes** (for the status timeline).

**Auth:** None  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/vehicle/last-hour?deviceId=EV-001
```

**Response `200`:** Array of records sorted oldest → newest.

---

### DELETE `/api/vehicle/data`

**Delete all** telemetry data records for a specific device. ⚠️ Irreversible.

**Auth:** None  
**Method:** `DELETE`

**Postman Setup:**
```
DELETE http://localhost:5112/api/vehicle/data?deviceId=EV-001
```

**Query Params:**
| Param | Required | Description |
|-------|----------|-------------|
| `deviceId` | ✅ | Device whose data to purge |

**Response `200`:**
```json
{
  "message": "Deleted 142 records for device EV-001",
  "deletedCount": 142
}
```

---

## 5. Devices

### GET `/api/devices`

Get all registered devices.

**Auth:** ✅ Bearer Token  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/devices
Authorization: Bearer <token>
```

**Response `200`:** Array of device objects with live `status` field.

---

### POST `/api/devices`

Register a new IoT device.

**Auth:** ✅ Bearer Token (Admin)  
**Method:** `POST`

**Postman Setup:**
```
POST http://localhost:5112/api/devices
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "deviceName": "EV Scooter 01",
  "deviceId": "EV-001",
  "location": "Warehouse A"
}
```

**Response `201`:**
```json
{
  "message": "Device added successfully",
  "device": {
    "_id": "664abc...",
    "deviceName": "EV Scooter 01",
    "deviceId": "EV-001",
    "location": "Warehouse A",
    "status": "Offline",
    "createdAt": "2026-04-25T07:00:00.000Z"
  }
}
```

---

### PUT `/api/devices/:id`

**Update** a device's name, location, or status.

**Auth:** ✅ Bearer Token (Admin)  
**Method:** `PUT`

**Postman Setup:**
```
PUT http://localhost:5112/api/devices/664abc123def456789
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "deviceName": "EV Scooter 01 - Updated",
  "location": "Warehouse B",
  "status": "Online"
}
```

**Response `200`:**
```json
{
  "message": "Device updated successfully",
  "device": {
    "_id": "664abc...",
    "deviceName": "EV Scooter 01 - Updated",
    "location": "Warehouse B",
    "status": "Online"
  }
}
```

---

### DELETE `/api/devices/:id`

Delete a device by its MongoDB `_id`.

**Auth:** ✅ Bearer Token (Admin)  
**Method:** `DELETE`

**Postman Setup:**
```
DELETE http://localhost:5112/api/devices/664abc123def456789
Authorization: Bearer <token>
```

**Response `200`:**
```json
{
  "message": "Device deleted successfully"
}
```

---

## 6. Dashboards

### GET `/api/dashboards`

Get all dashboards (filtered by user role).

**Auth:** ✅ Bearer Token  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/dashboards
Authorization: Bearer <token>
```

---

### POST `/api/dashboards`

Create a new vehicle dashboard with associated user.

**Auth:** ✅ Bearer Token (Admin)  
**Method:** `POST`

**Postman Setup:**
```
POST http://localhost:5112/api/dashboards
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "dashboardName": "Scooter Fleet Alpha",
  "deviceId": "EV-001",
  "email": "operator@eviot.com",
  "password": "Operator@123",
  "description": "Main fleet monitoring dashboard"
}
```

**Response `201`:**
```json
{
  "message": "Dashboard created successfully",
  "dashboard": {
    "_id": "664def...",
    "dashboardName": "Scooter Fleet Alpha",
    "deviceId": "EV-001"
  },
  "user": {
    "email": "operator@eviot.com",
    "_id": "664ghi..."
  }
}
```

---

### DELETE `/api/dashboards/:id`

Delete a dashboard by its MongoDB `_id`.

**Auth:** ✅ Bearer Token (Admin)  
**Method:** `DELETE`

**Postman Setup:**
```
DELETE http://localhost:5112/api/dashboards/664def123abc456
Authorization: Bearer <token>
```

**Response `200`:**
```json
{
  "message": "Dashboard deleted successfully"
}
```

---

## 7. Users

### GET `/api/users/me`

Get the currently logged-in user's profile.

**Auth:** ✅ Bearer Token  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/users/me
Authorization: Bearer <token>
```

---

### GET `/api/users`

Get all users (Admin only).

**Auth:** ✅ Bearer Token (Admin)  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/users
Authorization: Bearer <token>
```

---

### POST `/api/users`

Create a new user (Admin only).

**Auth:** ✅ Bearer Token (Admin)  
**Method:** `POST`

**Postman Setup:**
```
POST http://localhost:5112/api/users
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "newuser@eviot.com",
  "password": "NewUser@123",
  "role": "user"
}
```

---

### PUT `/api/users/:id`

Update a user's details (Admin only).

**Auth:** ✅ Bearer Token (Admin)  
**Method:** `PUT`

**Postman Setup:**
```
PUT http://localhost:5112/api/users/664abc123def456
Authorization: Bearer <token>
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "updated@eviot.com",
  "role": "operator"
}
```

---

### DELETE `/api/users/:id`

Delete a user by MongoDB `_id` (Admin only).

**Auth:** ✅ Bearer Token (Admin)  
**Method:** `DELETE`

**Postman Setup:**
```
DELETE http://localhost:5112/api/users/664abc123def456
Authorization: Bearer <token>
```

---

## 8. Socket.IO Events

Connect to: `ws://localhost:5112`

| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| `newData` | Server → Client | `DeviceData` object | New telemetry record received |
| `switchUpdate` | Server → Client | `{ deviceId, switch, reason, timestamp }` | Switch state changed |
| `connection` | Client → Server | — | Client connected |
| `disconnect` | Client → Server | — | Client disconnected |

**JavaScript Example:**
```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:5112');

socket.on('switchUpdate', ({ deviceId, switch: state }) => {
  console.log(`Device ${deviceId} switch is now ${state ? 'ON' : 'OFF'}`);
});

socket.on('newData', (data) => {
  console.log('New telemetry:', data);
});
```

---

## 9. Error Codes

| Status | Meaning | Common Cause |
|--------|---------|--------------|
| `200` | OK | Request succeeded |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Missing/invalid fields |
| `401` | Unauthorized | No/invalid JWT token |
| `403` | Forbidden | Insufficient role (not admin) |
| `404` | Not Found | Resource doesn't exist |
| `500` | Server Error | Internal / database error |

---

## 🔑 Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@eviot.com` | `EVIoT@2024` |

---

## 🚀 Postman Quick Import

Create a new Postman **Collection** named `EVIoT Panel` with these folders:

```
EVIoT Panel/
├── Auth/
│   ├── POST  Login
│   ├── POST  Register
│   └── GET   Verify Token
├── Switch/
│   ├── GET   Get Switch State
│   ├── POST  Toggle Switch
│   └── PUT   Force Set Switch
├── Telemetry/
│   ├── POST  Send Data (ESP32)
│   ├── GET   Latest Data
│   ├── GET   History
│   ├── GET   Last Hour Status
│   └── DELETE Clear Device Data
├── Devices/
│   ├── GET   All Devices
│   ├── POST  Add Device
│   ├── PUT   Update Device
│   └── DELETE Delete Device
├── Dashboards/
│   ├── GET   All Dashboards
│   ├── POST  Create Dashboard
│   └── DELETE Delete Dashboard
└── Users/
    ├── GET   My Profile
    ├── GET   All Users
    ├── POST  Create User
    ├── PUT   Update User
    └── DELETE Delete User
```

**Set a Postman environment variable:**
- Variable: `base_url` → Value: `http://localhost:5112`
- Variable: `token` → Value: _(paste JWT after login)_

Then use `{{base_url}}/api/...` and `Bearer {{token}}` in all requests.
