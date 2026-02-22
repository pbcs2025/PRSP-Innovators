# Kill all processes on port 5000
Write-Host "Killing all processes on port 5000..." -ForegroundColor Yellow

$connections = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($connections) {
    $processes = $connections | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $processes) {
        try {
            Write-Host "Stopping process $pid" -ForegroundColor Yellow
            Stop-Process -Id $pid -Force
            Write-Host "  ✅ Stopped process $pid" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Could not stop process $pid" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 2
    Write-Host "`n✅ All processes stopped" -ForegroundColor Green
} else {
    Write-Host "No processes found on port 5000" -ForegroundColor Yellow
}
