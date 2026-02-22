Write-Host "=== Fixing Backend Issues ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all processes on port 5000
Write-Host "Step 1: Stopping all processes on port 5000..." -ForegroundColor Yellow
$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($connections) {
    $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    Write-Host "Found $($processes.Count) process(es) to stop" -ForegroundColor Yellow
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "  ✅ Stopped process $pid" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Could not stop process $pid (may require admin)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "  No processes found on port 5000" -ForegroundColor Green
}

Start-Sleep -Seconds 3

# Step 2: Verify port is free
Write-Host "`nStep 2: Verifying port 5000 is free..." -ForegroundColor Yellow
$check = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($check) {
    Write-Host "  ❌ Port 5000 is still in use!" -ForegroundColor Red
    Write-Host "  You may need to run this script as Administrator" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "  ✅ Port 5000 is free" -ForegroundColor Green
}

# Step 3: Start backend
Write-Host "`nStep 3: Starting backend server..." -ForegroundColor Yellow
Write-Host "  Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

Set-Location backend
node src/index.js
