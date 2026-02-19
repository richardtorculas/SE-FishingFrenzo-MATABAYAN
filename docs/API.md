# MataBayan API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require JWT token in HTTP-only cookie or Authorization header.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "name": "Juan Dela Cruz",
  "email": "juan@example.com",
  "password": "SecurePass123!",
  "preferences": {
    "province": "Metro Manila",
    "cityMunicipality": "Quezon City",
    "language": "en",
    "alertTypes": {
      "typhoon": true,
      "earthquake": true,
      "volcano": true,
      "flood": true
    }
  }
}
```

**Response:** `201 Created`
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Juan Dela Cruz",
      "email": "juan@example.com",
      "preferences": { ... }
    }
  }
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "juan@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": { ... }
  }
}
```

#### Logout
```http
POST /api/auth/logout
```

**Response:** `200 OK`
```json
{
  "status": "success"
}
```

#### Get Current User
```http
GET /api/auth/me
```
🔒 **Protected**

**Response:** `200 OK`
```json
{
  "status": "success",
  "user": { ... }
}
```

---

### Alerts

#### Get All Alerts
```http
GET /api/alerts
```

**Response:** `200 OK`
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "type": "Typhoon",
    "severity": "High",
    "location": "Quezon City",
    "province": "Metro Manila",
    "description": "Typhoon Karding approaching...",
    "source": "PAGASA",
    "timestamp": "2026-02-10T08:30:00.000Z"
  }
]
```

#### Get Alerts by Province
```http
GET /api/alerts/location/:province
```

**Parameters:**
- `province` (string) - Province name

**Example:**
```http
GET /api/alerts/location/Metro%20Manila
```

---

### Users

#### Get All Users
```http
GET /api/users
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "count": 10,
  "data": [ ... ]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": "fail",
  "message": "Email already registered"
}
```

### 401 Unauthorized
```json
{
  "status": "fail",
  "message": "Invalid token"
}
```

### 500 Internal Server Error
```json
{
  "status": "error",
  "message": "Something went wrong"
}
```

---

## Rate Limiting

- **Rate:** 100 requests per 15 minutes per IP
- **Header:** `X-RateLimit-Remaining`

## CORS

Allowed origins:
- `http://localhost:3000` (development)
- Production domain (TBD)

---

**Last Updated:** February 2026
