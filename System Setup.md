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

## 3. Start the Application

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
