Write-Host "Starting Scholargy Backend..." -ForegroundColor Green
Write-Host ""

# Navigate to backend directory
Set-Location "..\scholargy-backend"

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file with the required environment variables." -ForegroundColor Yellow
    Write-Host "See BACKEND_SETUP.md for details." -ForegroundColor Yellow
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Starting backend server..." -ForegroundColor Green
npm start

Read-Host "Press Enter to continue"
