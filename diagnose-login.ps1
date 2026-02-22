# Login Diagnostic Script
Write-Host "=== KYC System Login Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking backend (port 5000)..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($backend) {
    Write-Host "   ✅ Backend is running" -ForegroundColor Green
    $processes = $backend | Select-Object -ExpandProperty OwningProcess -Unique
    Write-Host "   Found $($processes.Count) process(es) on port 5000" -ForegroundColor $(if ($processes.Count -gt 1) { "Red" } else { "Green" })
    if ($processes.Count -gt 1) {
        Write-Host "   ⚠️  WARNING: Multiple processes detected! This may cause issues." -ForegroundColor Red
        Write-Host "   Run restart-backend.ps1 to fix this." -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Backend is NOT running" -ForegroundColor Red
    Write-Host "   Start it with: cd backend; node src/index.js" -ForegroundColor Yellow
}

Write-Host ""

# Check if frontend is running
Write-Host "2. Checking frontend (port 5173)..." -ForegroundColor Yellow
$frontend = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
if ($frontend) {
    Write-Host "   ✅ Frontend is running" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend is NOT running" -ForegroundColor Red
    Write-Host "   Start it with: cd frontend; npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Test backend login endpoint
Write-Host "3. Testing login endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:5000/auth/login `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body '{"username":"admin","password":"admin123"}' `
        -UseBasicParsing `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Login endpoint is working!" -ForegroundColor Green
        $data = $response.Content | ConvertFrom-Json
        Write-Host "   Token received: $($data.access_token.Substring(0, 50))..." -ForegroundColor Green
        Write-Host "   Role: $($data.role)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Login endpoint failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check MongoDB connection
Write-Host "4. Checking MongoDB connection..." -ForegroundColor Yellow
Set-Location backend
$mongoCheck = node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI, {serverSelectionTimeoutMS: 3000}).then(() => { console.log('CONNECTED'); mongoose.disconnect(); }).catch(err => console.log('FAILED'));" 2>&1
if ($mongoCheck -match "CONNECTED") {
    Write-Host "   ✅ MongoDB is connected" -ForegroundColor Green
} else {
    Write-Host "   ❌ MongoDB connection failed" -ForegroundColor Red
}
Set-Location ..

Write-Host ""
Write-Host "=== Diagnostics Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If login is still failing:" -ForegroundColor Yellow
Write-Host "1. Run: .\restart-backend.ps1" -ForegroundColor White
Write-Host "2. Open browser console (F12) and check for errors" -ForegroundColor White
Write-Host "3. Make sure you're accessing http://localhost:5173" -ForegroundColor White
