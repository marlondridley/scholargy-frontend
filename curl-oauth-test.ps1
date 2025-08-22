# PowerShell Curl OAuth Flow Test
# This script tests the OAuth callback route and related endpoints

Write-Host "🧪 Curl OAuth Flow Test" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green

# Base URL - replace with your actual Azure Static Web App URL
$BASE_URL = "https://gentle-ground-0d24ae71e.1.azurestaticapps.net"

Write-Host "📍 Testing base URL: $BASE_URL" -ForegroundColor Yellow
Write-Host ""

# Test 1: Check if the main site is accessible
Write-Host "1️⃣ Testing main site accessibility..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/" -Method GET -UseBasicParsing
    Write-Host "Main site status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Main site error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Check if the login page is accessible
Write-Host ""
Write-Host "2️⃣ Testing login page accessibility..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/login" -Method GET -UseBasicParsing
    Write-Host "Login page status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Login page error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check if the auth callback route is accessible
Write-Host ""
Write-Host "3️⃣ Testing auth callback route..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/callback" -Method GET -UseBasicParsing
    Write-Host "Auth callback status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Auth callback error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Check if the test-oauth page is accessible
Write-Host ""
Write-Host "4️⃣ Testing test-oauth page..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/test-oauth" -Method GET -UseBasicParsing
    Write-Host "Test OAuth page status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Test OAuth page error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Check if the dashboard is accessible
Write-Host ""
Write-Host "5️⃣ Testing dashboard access..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/dashboard" -Method GET -UseBasicParsing
    Write-Host "Dashboard status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Dashboard error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Check headers for auth callback route
Write-Host ""
Write-Host "6️⃣ Testing auth callback headers..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/callback" -Method HEAD -UseBasicParsing
    Write-Host "Auth callback headers:" -ForegroundColor Green
    $response.Headers | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} catch {
    Write-Host "Auth callback headers error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Check if static files are accessible
Write-Host ""
Write-Host "7️⃣ Testing static files accessibility..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/static/js/main.99995472.js" -Method GET -UseBasicParsing
    Write-Host "Static files status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Static files error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 8: Check if the site returns proper HTML for SPA routes
Write-Host ""
Write-Host "8️⃣ Testing SPA route handling..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/auth/callback" -Method GET -UseBasicParsing
    Write-Host "Auth callback content (first 200 chars):" -ForegroundColor Green
    Write-Host $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)) -ForegroundColor Gray
} catch {
    Write-Host "Auth callback content error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 PowerShell tests completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Expected results:" -ForegroundColor Yellow
Write-Host "- Main site: 200" -ForegroundColor White
Write-Host "- Login page: 200" -ForegroundColor White
Write-Host "- Auth callback: 200 (should serve index.html)" -ForegroundColor White
Write-Host "- Test OAuth page: 200" -ForegroundColor White
Write-Host "- Dashboard: 200 (should serve index.html)" -ForegroundColor White
Write-Host "- Static files: 200" -ForegroundColor White
Write-Host ""
Write-Host "If auth callback returns 404, the routing configuration needs to be fixed." -ForegroundColor Red
