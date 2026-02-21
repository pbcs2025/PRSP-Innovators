# Quick PowerShell script to verify .env file
Write-Host "🔍 Checking .env file..." -ForegroundColor Cyan
Write-Host ""

$envPath = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Location: $envPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ .env file found" -ForegroundColor Green
Write-Host ""

$required = @("SERVER_INDEX_KEY", "MASTER_KEY", "JWT_SECRET_KEY", "SHARED_CLIENT_KEY")
$missing = @()

foreach ($var in $required) {
    $value = (Get-Content $envPath | Select-String "^$var=").ToString()
    if ($value) {
        Write-Host "✅ $var found" -ForegroundColor Green
    } else {
        Write-Host "❌ $var MISSING" -ForegroundColor Red
        $missing += $var
    }
}

Write-Host ""
if ($missing.Count -eq 0) {
    Write-Host "✅ All required keys are present!" -ForegroundColor Green
    Write-Host "   You can now run: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "❌ Missing keys: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "   Run: node generate-keys.js to generate them" -ForegroundColor Yellow
}
