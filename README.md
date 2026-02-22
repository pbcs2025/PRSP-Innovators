# 🔐 Privacy-Preserving Searchable Encryption for Secure KYC Systems

A full-stack implementation of a KYC (Know Your Customer) system with Searchable Symmetric Encryption (SSE), built with Node.js, Express, MongoDB, and React.

## Features

- **Zero-knowledge server**: Server never sees plaintext KYC data
- **Searchable encryption**: Search encrypted records using trapdoors
- **Shared client key**: All authorized users can search and decrypt any record
- **Role-based access control**: Admin, Officer, and Auditor roles with different permissions
- **Anomaly detection**: Redis-based rate limiting to detect suspicious search patterns
- **Full audit trail**: All actions logged with IP, timestamp, and anomaly flags
- **Client-side encryption**: AES-256-GCM encryption/decryption in the browser

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Redis (for rate limiting)
- JWT authentication
- bcryptjs for password hashing

### Frontend
- React 18 + Vite
- Tailwind CSS
- Web Crypto API (native browser crypto)
- Zustand for state management
- Axios for HTTP requests

## Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Redis (optional, for anomaly detection)

## Architecture

### Encryption Workflow

1. **Adding a KYC Record:**
   - Client generates random DEK (Data Encryption Key)
   - Encrypts KYC JSON with DEK using AES-256-GCM
   - Wraps DEK with SHARED_CLIENT_KEY
   - Generates trapdoors for searchable fields (PAN, Aadhaar, Name, Passport)
   - Sends encrypted payload + trapdoors to server
   - Server double-hashes trapdoors and stores in search index

2. **Searching:**
   - Client computes trapdoor = HMAC-SHA256(keyword, SHARED_CLIENT_KEY)
   - Sends trapdoor to server
   - Server double-hashes and searches index
   - Returns encrypted payload (and DEK if user has permission)
   - Client decrypts if authorized

### Role-Based Access Control

| Action | Admin | Officer | Auditor |
|--------|-------|---------|---------|
| Add KYC | ✅ | ✅ | ❌ |
| Search | ✅ | ✅ | ✅ |
| Decrypt | ✅ | ✅ | ❌ |
| View Logs | ✅ | ❌ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |

## API Endpoints

### Authentication
- `POST /auth/login` - Login and receive JWT + shared client key
- `POST /auth/register` - Register new user (Admin only)

### KYC Operations
- `POST /kyc/add` - Add encrypted KYC record (Admin, Officer)
- `POST /kyc/search` - Search by trapdoor (All roles)
- `GET /kyc/:record_id` - Get record by ID (Admin, Officer)

### Admin & Logs
- `GET /admin/users` - List users (Admin)
- `POST /admin/users/:id/deactivate` - Deactivate user (Admin)
- `GET /admin/anomalies` - Get anomaly logs (Admin)
- `GET /logs` - Query access logs (Admin, Auditor)

## Security Considerations

**Implemented:**
- Zero plaintext storage
- SSE with double-HMAC
- Shared client key for cross-user search
- Role-gated decryption
- JWT authentication
- Full audit trail
- Anomaly detection (Redis rate limiting)
- GCM authentication tags

**Known Limitations (for production):**
- Shared key distribution: Currently sent over HTTPS after login. Production should use a secure key management service.
- Frequency analysis: SSE is vulnerable to access pattern analysis. Consider ORAM for production.
- No fuzzy search: Full fuzzy search requires decryption first.

## Project Structure

```
kyc-sse-system/
├── backend/
│   ├── src/
│   │   ├── index.js           # Express app entry
│   │   ├── config.js          # Environment config
│   │   ├── db/                # MongoDB connection & indexes
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic (crypto, SSE, anomaly)
│   │   └── middleware/        # JWT, RBAC
│   └── package.json
│
└── frontend/
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── crypto/            # Client-side crypto (trapdoor, AES)
        ├── components/        # React components
        ├── store/            # Zustand state
        └── api/              # Axios client
```

## Development

- Backend auto-reloads with nodemon
- Frontend hot-reloads with Vite
- MongoDB indexes are created automatically on startup
- Redis is used for anomaly detection rate limiting


