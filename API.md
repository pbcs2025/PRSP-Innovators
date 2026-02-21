# API Reference

Base URL: `http://localhost:5000`

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Authentication

### POST /auth/login
Login and receive JWT token + shared client key.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJ...",
  "role": "admin",
  "username": "admin",
  "shared_client_key": "hex-encoded-64-char-key"
}
```

### POST /auth/register
Register a new user (Admin only).

**Request:**
```json
{
  "username": "officer1",
  "email": "officer1@bank.com",
  "password": "password123",
  "role": "officer"
}
```

**Response:**
```json
{
  "user_id": "objectid",
  "message": "User created"
}
```

## KYC Operations

### POST /kyc/add
Add a new encrypted KYC record (Admin, Officer only).

**Request:**
```json
{
  "encrypted_payload": "base64-encoded-ciphertext",
  "iv": "base64-iv",
  "auth_tag": "base64-tag",
  "encrypted_dek": "base64-wrapped-dek",
  "index": [
    {
      "field_type": "pan",
      "trapdoor": "hex-hmac-sha256"
    },
    {
      "field_type": "aadhaar",
      "trapdoor": "hex-hmac-sha256"
    }
  ]
}
```

**Response:**
```json
{
  "record_id": "objectid",
  "message": "KYC stored securely"
}
```

### POST /kyc/search
Search for a KYC record by trapdoor (All roles).

**Request:**
```json
{
  "field_type": "pan",
  "trapdoor": "hex-hmac-sha256-of-keyword"
}
```

**Response (Admin/Officer - with decryption key):**
```json
{
  "found": true,
  "record_id": "objectid",
  "encrypted_payload": "base64...",
  "iv": "base64...",
  "auth_tag": "base64...",
  "encrypted_dek": "base64..."
}
```

**Response (Auditor - without decryption key):**
```json
{
  "found": true,
  "record_id": "objectid",
  "encrypted_payload": "base64...",
  "iv": "base64...",
  "auth_tag": "base64..."
}
```

**Response (Not found):**
```json
{
  "found": false
}
```

### GET /kyc/:record_id
Get a KYC record by ID (Admin, Officer only).

**Response:**
```json
{
  "id": "objectid",
  "encrypted_payload": "base64...",
  "iv": "base64...",
  "auth_tag": "base64...",
  "encrypted_dek": "base64...",
  "created_by": "user-objectid",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

## Admin Operations

### GET /admin/users
List all users (Admin only).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "users": [
    {
      "id": "objectid",
      "username": "admin",
      "email": "admin@bank.com",
      "role": "admin",
      "is_active": true,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### POST /admin/users/:id/deactivate
Deactivate a user (Admin only).

**Response:**
```json
{
  "message": "User deactivated"
}
```

### GET /admin/anomalies
Get anomaly logs (Admin only).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "total": 5,
  "logs": [
    {
      "id": "objectid",
      "username": "user1",
      "action": "search",
      "field_searched": "pan",
      "result_found": true,
      "anomaly_flag": true,
      "ip_address": "192.168.1.1",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## Audit Logs

### GET /logs
Query access logs (Admin, Auditor).

**Query Parameters:**
- `user_id` (optional): Filter by user ID
- `action` (optional): Filter by action (search, add_kyc, decrypt, login, logout)
- `anomaly_only` (optional): Show only anomalies (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "total": 150,
  "logs": [
    {
      "id": "objectid",
      "user_id": "objectid",
      "username": "user1",
      "action": "search",
      "field_searched": "pan",
      "kyc_record_id": "objectid",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "result_found": true,
      "anomaly_flag": false,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

## Error Responses

All endpoints may return error responses:

**401 Unauthorized:**
```json
{
  "error": "No token" | "Invalid token"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions"
}
```

**400 Bad Request:**
```json
{
  "error": "Missing required fields" | "Invalid role" | ...
}
```

**404 Not Found:**
```json
{
  "error": "Record not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Internal server error"
}
```
