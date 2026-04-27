
## 3. Device Management

### GET `/api/devices`

Get a list of all registered **IoT devices** (ESP32 modules).

**Auth:** None  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/devices
```

---

### POST `/api/devices`

**Register** a new hardware node.

**Auth:** Bearer Token (Required)  
**Method:** `POST`

**Body:**
```json
{
  "deviceName": "My ESP32",
  "deviceId": "ESP_01",
  "location": "Garage"
}
```

---

### PUT `/api/devices`

**Update** device details.

**Auth:** Bearer Token (Admin Only)  
**Method:** `PUT`

**Body:**
```json
{
  "id": "662a...",
  "deviceName": "Updated Name",
  "location": "New Office"
}
```

---

### DELETE `/api/devices`

**Delete** a hardware node.

**Auth:** Bearer Token (Admin Only)  
**Method:** `DELETE`

**Query Param:** `?id=662a...` or in **Body** `{"id": "662a..."}`

---

## 4. Dashboard Management

### GET `/api/dashboards`

Get a list of all **Vehicle Dashboards**.

**Auth:** None  
**Method:** `GET`

**Postman Setup:**
```
GET http://localhost:5112/api/dashboards
```

---

### POST `/api/dashboards`

**Create** a new vehicle dashboard.

**Auth:** Bearer Token (Admin Only)  
**Method:** `POST`

**Body:**
```json
{
  "dashboardName": "Fleet Unit #5",
  "deviceId": "EV-005",
  "email": "operator@gmail.com",
  "password": "SecurePassword",
  "description": "Logistics truck"
}
```

---

### PUT `/api/dashboards`

**Update** dashboard details.

**Auth:** Bearer Token (Admin Only)  
**Method:** `PUT`

**Body:**
```json
{
  "id": "662a...",
  "dashboardName": "Updated Truck Name",
  "description": "Updated route"
}
```

---

### DELETE `/api/dashboards`

**Delete** a dashboard.

**Auth:** Bearer Token (Admin Only)  
**Method:** `DELETE`

**Query Param:** `?id=662a...` or in **Body** `{"id": "662a..."}`

---

## 5. Vehicle Switch Control

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