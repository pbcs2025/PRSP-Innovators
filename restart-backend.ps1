# Stop all processes on port 5000
Write-Host "Stopping all processes on port 5000..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $processes) {
    Write-Host "Stopping process $pid" -ForegroundColor Yellow
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

# Start the backend
Write-Host "`nStarting backend server..." -ForegroundColor Green
Set-Location backend
node src/index.js
