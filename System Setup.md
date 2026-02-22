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
```env
PORT=5000
MONGO_URI=mongodb+srv://lakshmis242005_db_user:X61WntUycuiuSykw@cluster0.avmfzov.mongodb.net/
REDIS_URL=redis://localhost:6379

SERVER_INDEX_KEY=d1e26b066715ea4bab657cd61a03bb37453f7e0a9f37a3ad50c4820a82b5d0ee
MASTER_KEY=224088b669acf503235f1d7b136cf4bb73cded1eea86576af97f18600dc7d789
JWT_SECRET_KEY=3meoSyajUKK3j7mLV96jaCgxcM5RGnQc5UOEQDPGmu8=
SHARED_CLIENT_KEY=9a0c32962389737cf1f0a9cf6baeea0f489ad3dd865c6475e871d9f790797bbb
```

**Note:** If you see "Missing required environment variables" error, make sure you've created the `.env` file with all keys!


## 4. Start the Application

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
