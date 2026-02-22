# System Setup Guide

This guide will walk you through setting up and running the Privacy-Preserving Searchable Encryption for Secure KYC Systems.

## 1. Clone the Repository

```bash
git clone <repository-url>
cd PRSP-Innovators
```

## 2. Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## 3. Configure Environment Variables

### Easy Way (Recommended)

Run the interactive setup script:

```bash
cd backend
node setup-env.js
```

This interactive script will:
- Ask for MongoDB and Redis connection strings
- Automatically generate all required keys
- Create the `.env` file for you

### Manual Way

If you prefer to set up manually:

```bash
cd backend
node generate-keys.js
```

Copy the generated keys and create `backend/.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/kyc_db
REDIS_URL=redis://localhost:6379

# Paste the keys generated above
SERVER_INDEX_KEY=<64-char-hex>
MASTER_KEY=<64-char-hex>
JWT_SECRET_KEY=<base64-secret>
SHARED_CLIENT_KEY=<64-char-hex>
```

**Note:** If you see "Missing required environment variables" error, make sure you've created the `.env` file with all keys!

## 4. Create Default Users

Before starting the application, create default users for all roles:

```bash
cd backend
node seed-users.js
```

This will create three users with different roles. Alternatively, you can create users individually using:

```bash
cd backend
node create-admin.js
```

## 5. Start the Application

### Start Backend Server

```bash
cd backend
npm run dev
```

The backend server will run on `http://localhost:5000`

### Start Frontend Application

Open a new terminal window:

```bash
cd frontend
npm run dev
```

The frontend application will run on `http://localhost:5173`

## Default Login Credentials

After running the seed script, you can login with:

| Role    | Username  | Password      |
|---------|-----------|---------------|
| Admin   | admin     | admin123      |
| Officer | officer1  | officer1123   |
| Auditor | auditor1  | auditor1123   |
