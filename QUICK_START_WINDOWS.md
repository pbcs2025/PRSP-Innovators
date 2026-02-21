# Quick Start for Windows Users 🪟

## Fastest Path (No Local Installation) ⚡

### Step 1: Get Free Cloud Databases

1. **MongoDB Atlas (Free Cloud Database):**
   - Sign up: https://www.mongodb.com/cloud/atlas/register
   - Create free M0 cluster
   - Get connection string (see WINDOWS_SETUP.md for details)
   - Copy to `backend/.env` as `MONGO_URI`

2. **Redis Cloud (Optional - Free):**
   - Sign up: https://redis.com/try-free/
   - Create free database
   - Copy connection URL to `backend/.env` as `REDIS_URL`
   - Or skip Redis for now (anomaly detection won't work, but everything else will)

### Step 2: Configure .env File

Create `backend/.env` file:

```env
PORT=5000
MONGO_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/kyc_db?retryWrites=true&w=majority
REDIS_URL=redis://default:password@redis-xxxxx.cloud.redislabs.com:12345

# Generate these keys:
SERVER_INDEX_KEY=<run: node generate-keys.js>
MASTER_KEY=<run: node generate-keys.js>
JWT_SECRET_KEY=<run: node generate-keys.js>
SHARED_CLIENT_KEY=<run: node generate-keys.js>
```

### Step 3: Test Connection

```powershell
cd backend
node test-connection.js
```

This will tell you if MongoDB and Redis are working.

### Step 4: Create Admin User

```powershell
node create-admin.js
```

Enter:
- Username: `admin`
- Email: `admin@bank.com`
- Password: (choose a strong password)

### Step 5: Start the Application

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

### Step 6: Open Browser

Go to: http://localhost:5173

Login with your admin credentials!

---

## If You Want to Install Locally

See `WINDOWS_SETUP.md` for detailed instructions on:
- Installing MongoDB Community Server
- Installing Redis via WSL2 or Memurai
- Docker setup
- Troubleshooting

---

## Common Issues & Solutions

### ❌ "bad auth : authentication failed"
**Problem:** MongoDB connection string has wrong credentials or MongoDB isn't running.

**Solution:**
1. If using MongoDB Atlas: Check username/password in connection string
2. If using local MongoDB: Make sure MongoDB service is running
   ```powershell
   Get-Service MongoDB
   Start-Service MongoDB  # if not running
   ```
3. Test connection: `node test-connection.js`

### ❌ "connect ECONNREFUSED"
**Problem:** MongoDB/Redis service not running or wrong port.

**Solution:**
1. Check if service is running
2. Verify connection string in `.env`
3. For local: Make sure MongoDB/Redis are installed and started

### ❌ "Cannot find module"
**Problem:** Dependencies not installed.

**Solution:**
```powershell
cd backend
npm install

cd ../frontend
npm install
```

---

## Need More Help?

- **Windows Setup:** See `WINDOWS_SETUP.md`
- **General Setup:** See `SETUP.md`
- **API Docs:** See `API.md`
