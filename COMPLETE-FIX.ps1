Write-Host "=== Complete Login Fix ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all backend processes
Write-Host "Step 1: Stopping all backend processes on port 5000..." -ForegroundColor Yellow
$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($connections) {
    $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    Write-Host "   Found $($processes.Count) process(es)" -ForegroundColor Yellow
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force
            Write-Host "   ✅ Stopped process $pid" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Failed to stop $pid - try running as Administrator" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 3
} else {
    Write-Host "   No processes found" -ForegroundColor Green
}

# Step 2: Verify port is free
Write-Host "`nStep 2: Verifying port 5000 is free..." -ForegroundColor Yellow
$check = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($check) {
    Write-Host "   ❌ Port 5000 still in use!" -ForegroundColor Red
    Write-Host "   Run PowerShell as Administrator and try again" -ForegroundColor Yellow
    Read-Host "`nPress Enter to exit"
    exit 1
} else {
    Write-Host "   ✅ Port 5000 is free" -ForegroundColor Green
}

# Step 3: Test database connection
Write-Host "`nStep 3: Testing database connection..." -ForegroundColor Yellow
Set-Location backend
$dbTest = node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI, {serverSelectionTimeoutMS: 3000}).then(() => { console.log('CONNECTED'); mongoose.disconnect(); }).catch(() => console.log('FAILED'));" 2>&1
if ($dbTest -match "CONNECTED") {
    Write-Host "   ✅ Database connected" -ForegroundColor Green
} else {
    Write-Host "   ❌ Database connection failed" -ForegroundColor Red
    Write-Host "   Check your .env file MONGO_URI" -ForegroundColor Yellow
    Set-Location ..
    Read-Host "`nPress Enter to exit"
    exit 1
}

# Step 4: Check if admin user exists
Write-Host "`nStep 4: Checking admin user..." -ForegroundColor Yellow
$adminCheck = node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(async () => { const User = mongoose.model('User', new mongoose.Schema({ username: String })); const admin = await User.findOne({ username: 'admin' }); console.log(admin ? 'EXISTS' : 'MISSING'); await mongoose.disconnect(); }).catch(() => console.log('ERROR'));" 2>&1
if ($adminCheck -match "EXISTS") {
    Write-Host "   ✅ Admin user exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Admin user not found" -ForegroundColor Red
    Write-Host "   Creating admin user..." -ForegroundColor Yellow
    node create-admin.js
}

Set-Location ..

# Step 5: Start backend
Write-Host "`nStep 5: Starting backend server..." -ForegroundColor Yellow
Write-Host "   Backend will start on http://localhost:5000" -ForegroundColor Gray
Write-Host "   Frontend should be on http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "   Login credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

Set-Location backend
node src/index.js
