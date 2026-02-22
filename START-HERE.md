# Quick Start Guide - After Cloning from GitHub

## The Problem
When you clone this repo, you get the code but NOT:
- The running database with users
- The backend/frontend servers

## The Solution - Follow These Steps

### Step 1: Install Dependencies

```powershell
# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Fix and Start Backend

Run this script to clean up any issues and start the backend:

```powershell
.\COMPLETE-FIX.ps1
```

This will:
- Stop any conflicting processes
- Verify database connection
- Check if admin user exists
- Start the backend server

**Keep this terminal window open!**

### Step 3: Start Frontend (New Terminal)

Open a **NEW** PowerShell window and run:

```powershell
cd frontend
npm run dev
```

### Step 4: Login

1. Open browser to: http://localhost:5173
2. Login with:
   - **Username:** `admin`
   - **Password:** `admin123`

## Troubleshooting

### "Login Failed" Error

**Cause:** Multiple backend processes or backend not running

**Fix:**
```powershell
# Stop all backends
.\kill-port-5000.ps1

# Start fresh
cd backend
node src/index.js
```

### "net::ERR_FAILED" in Browser Console

**Cause:** Backend is not running or not accessible

**Fix:**
1. Check if backend is running (you should see "✅ Backend running on http://localhost:5000")
2. If not, restart backend: `cd backend; node src/index.js`

### "Cannot connect to database"

**Cause:** Wrong MONGO_URI in .env file

**Fix:**
1. Ask your friend for the correct MongoDB connection string
2. Update `backend/.env` file with the correct `MONGO_URI`

### Admin user doesn't exist

**Cause:** Database is empty or different from your friend's

**Fix:**
```powershell
cd backend
node create-admin.js
```

Then enter:
- Username: admin
- Email: admin@example.com
- Password: admin123

## Why This Happens

When you clone from GitHub:
- ✅ You get: Code, package.json, configuration files
- ❌ You DON'T get: Running servers, node_modules, active database connections

You need to:
1. Install dependencies (`npm install`)
2. Start the servers manually
3. Connect to the same database (using .env file)

## Quick Commands Reference

```powershell
# Kill all backends
.\kill-port-5000.ps1

# Start backend
cd backend
node src/index.js

# Start frontend (in new terminal)
cd frontend
npm run dev

# Create admin user
cd backend
node create-admin.js

# Test database connection
cd backend
node test-connection.js
```
