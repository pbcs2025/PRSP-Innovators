# Windows Setup Guide

This guide will help you set up MongoDB and Redis on Windows for the KYC SSE System.

## Option 1: MongoDB Atlas (Cloud - Easiest) ⭐ Recommended

MongoDB Atlas is a free cloud database - no installation needed!

### Steps:

1. **Create a free MongoDB Atlas account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free (M0 cluster is free forever)

2. **Create a cluster:**
   - Choose a cloud provider (AWS, Google Cloud, Azure)
   - Select a region close to you
   - Choose "M0 Sandbox" (free tier)
   - Click "Create Cluster"

3. **Set up database access:**
   - Go to "Database Access" → "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"

4. **Set up network access:**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your IP
   - Click "Confirm"

5. **Get your connection string:**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
   - Replace `<password>` with your database user password
   - Add database name: `mongodb+srv://username:password@cluster.mongodb.net/kyc_db`

6. **Update your .env file:**
   ```env
   MONGO_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/kyc_db?retryWrites=true&w=majority
   ```

✅ **Done!** No local installation needed.

---

## Option 2: Install MongoDB Locally on Windows

### Method A: MongoDB Community Server (Full Installation)

1. **Download MongoDB:**
   - Go to https://www.mongodb.com/try/download/community
   - Select: Windows, MSI, Version (latest)
   - Click "Download"

2. **Install MongoDB:**
   - Run the downloaded `.msi` file
   - Choose "Complete" installation
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Run service as Network Service user"
   - ✅ Check "Install MongoDB Compass" (GUI tool - optional but helpful)
   - Click "Install"

3. **Verify Installation:**
   - Open PowerShell as Administrator
   - Check if MongoDB service is running:
     ```powershell
     Get-Service MongoDB
     ```
   - If not running, start it:
     ```powershell
     Start-Service MongoDB
     ```

4. **Test Connection:**
   ```powershell
   mongosh
   ```
   - If this works, MongoDB is running! Type `exit` to leave.

5. **Update your .env file:**
   ```env
   MONGO_URI=mongodb://localhost:27017/kyc_db
   ```

### Method B: MongoDB via Chocolatey (Package Manager)

If you have Chocolatey installed:

```powershell
# Install MongoDB
choco install mongodb

# Start MongoDB service
Start-Service MongoDB

# Test connection
mongosh
```

---

## Option 3: Use Docker (If you have Docker Desktop)

```powershell
# Pull MongoDB image
docker pull mongo

# Run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo

# Test connection
mongosh mongodb://localhost:27017
```

Update `.env`:
```env
MONGO_URI=mongodb://localhost:27017/kyc_db
```

---

## Redis Setup for Windows

### Option 1: Redis via WSL2 (Recommended for Windows)

1. **Install WSL2:**
   ```powershell
   wsl --install
   ```
   - Restart your computer when prompted

2. **Install Redis in WSL:**
   ```bash
   # In WSL terminal
   sudo apt update
   sudo apt install redis-server
   sudo service redis-server start
   ```

3. **Test Redis:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

4. **Update .env:**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

### Option 2: Memurai (Windows Native Redis Alternative)

1. **Download Memurai:**
   - Go to https://www.memurai.com/get-memurai
   - Download the free Developer edition

2. **Install Memurai:**
   - Run the installer
   - It will install as a Windows service

3. **Update .env:**
   ```env
   REDIS_URL=redis://localhost:6379
   ```

### Option 3: Redis Cloud (Free Cloud Option)

1. **Sign up:**
   - Go to https://redis.com/try-free/
   - Create a free account

2. **Create a database:**
   - Create a free database (30MB free)
   - Copy the connection URL

3. **Update .env:**
   ```env
   REDIS_URL=redis://default:password@redis-xxxxx.cloud.redislabs.com:12345
   ```

### Option 4: Skip Redis (For Testing Only)

If you just want to test the system without Redis:

1. **Modify `backend/src/services/anomalyService.js`:**
   ```javascript
   // Comment out Redis and return false for anomaly check
   async function checkAndRecordSearch(user_id) {
     // const key   = `search_count:${user_id}`;
     // const count = await redis.incr(key);
     // if (count === 1) await redis.expire(key, WINDOW_SECONDS);
     // return count > SEARCH_LIMIT;
     return false; // Temporarily disable anomaly detection
   }
   ```

   ⚠️ **Note:** This disables anomaly detection. Use only for testing.

---

## Quick Test Commands

### Test MongoDB Connection:
```powershell
# If MongoDB is installed locally
mongosh

# Or test with Node.js
cd backend
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => { console.log('✅ MongoDB connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

### Test Redis Connection:
```powershell
# If Redis is installed
redis-cli ping

# Or test with Node.js
cd backend
node -e "require('dotenv').config(); const Redis = require('ioredis'); const redis = new Redis(process.env.REDIS_URL); redis.ping().then(r => { console.log('✅ Redis connected:', r); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

---

## Troubleshooting

### MongoDB Issues:

**"MongoServerError: bad auth"**
- Check your connection string has correct username/password
- For Atlas: Make sure IP is whitelisted in Network Access
- For local: Remove authentication from connection string if not needed

**"MongoServerSelectionError: connect ECONNREFUSED"**
- MongoDB service is not running
- Start it: `Start-Service MongoDB` (PowerShell as Admin)
- Or check if port 27017 is available

**"Cannot find module 'mongodb'"**
- Run: `cd backend && npm install`

### Redis Issues:

**"connect ECONNREFUSED 127.0.0.1:6379"**
- Redis is not running
- Start Redis service or use Redis Cloud
- Or temporarily disable anomaly detection (see Option 4 above)

---

## Recommended Setup for Quick Start

**Easiest path (no local installation):**
1. ✅ Use MongoDB Atlas (cloud) - free
2. ✅ Use Redis Cloud (cloud) - free
3. ✅ No local services needed!

**Local development:**
1. ✅ Install MongoDB Community Server
2. ✅ Use Redis via WSL2 or Memurai
3. ✅ Everything runs locally

---

## Next Steps

Once MongoDB and Redis are set up:

1. ✅ Test connection: `node backend/create-admin.js`
2. ✅ Create admin user
3. ✅ Start backend: `cd backend && npm run dev`
4. ✅ Start frontend: `cd frontend && npm run dev`
5. ✅ Open http://localhost:5173 and login!
