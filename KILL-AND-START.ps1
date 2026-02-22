Write-Host "=== Killing All Backend Processes ===" -ForegroundColor Cyan
Write-Host ""

# Kill all processes on port 5000 (multiple attempts)
for ($i = 1; $i -le 3; $i++) {
    Write-Host "Attempt $i: Checking port 5000..." -ForegroundColor Yellow
    $connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    
    if ($connections) {
        $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        Write-Host "  Found $($processes.Count) process(es): $($processes -join ', ')" -ForegroundColor Yellow
        
        foreach ($pid in $processes) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "  ✅ Killed process $pid" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠️  Could not kill $pid" -ForegroundColor Red
            }
        }
        Start-Sleep -Seconds 2
    } else {
        Write-Host "  ✅ No processes found on port 5000" -ForegroundColor Green
        break
    }
}

# Final check
Write-Host "`nFinal verification..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
$finalCheck = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

if ($finalCheck) {
    Write-Host "❌ Port 5000 is STILL in use!" -ForegroundColor Red
    Write-Host "   Try running PowerShell as Administrator" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
} else {
    Write-Host "✅ Port 5000 is FREE!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Starting Backend Server ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend will start on: http://localhost:5000" -ForegroundColor White
Write-Host "Login credentials:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

Set-Location backend
node src/index.js
