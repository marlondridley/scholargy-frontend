# Deploy and Test OAuth Flow Script
# This script helps deploy the frontend and provides testing instructions

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production"
)

Write-Host "🚀 Deploying and Testing OAuth Flow..." -ForegroundColor Green
Write-Host ""

# Step 1: Build the application
Write-Host "📦 Step 1: Building the application..." -ForegroundColor Yellow
try {
    npm run build
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Build failed. Please check for errors." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Deploy to Azure Static Web Apps
Write-Host "🌐 Step 2: Deploying to Azure Static Web Apps..." -ForegroundColor Yellow
try {
    swa deploy
    Write-Host "✅ Deployment completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed. Please check your Azure Static Web Apps configuration." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Display testing instructions
Write-Host "🧪 Step 3: Testing Instructions" -ForegroundColor Yellow
Write-Host "================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Open your deployed application in a browser" -ForegroundColor White
Write-Host "2. Navigate to: /test-oauth" -ForegroundColor White
Write-Host "3. Login with your credentials" -ForegroundColor White
Write-Host "4. Click 'Run All Tests' to verify OAuth flow" -ForegroundColor White
Write-Host ""
Write-Host "📋 Manual Testing Checklist:" -ForegroundColor Cyan
Write-Host "• Test Google OAuth sign in" -ForegroundColor White
Write-Host "• Verify user profile creation" -ForegroundColor White
Write-Host "• Check session persistence" -ForegroundColor White
Write-Host "• Test sign out functionality" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Browser Console Testing:" -ForegroundColor Cyan
Write-Host "• Open Developer Tools (F12)" -ForegroundColor White
Write-Host "• Check Console tab for errors" -ForegroundColor White
Write-Host "• Check Network tab for API calls" -ForegroundColor White
Write-Host ""
Write-Host "📊 CosmosDB Verification:" -ForegroundColor Cyan
Write-Host "• Go to Azure Portal" -ForegroundColor White
Write-Host "• Navigate to your CosmosDB account" -ForegroundColor White
Write-Host "• Check Data Explorer for user data" -ForegroundColor White
Write-Host ""

# Step 4: Environment variable check
Write-Host "🔧 Step 4: Environment Variables Check" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ensure these environment variables are set in Azure Static Web Apps:" -ForegroundColor White
Write-Host "• REACT_APP_SUPABASE_URL" -ForegroundColor Cyan
Write-Host "• REACT_APP_SUPABASE_ANON_KEY" -ForegroundColor Cyan
Write-Host "• REACT_APP_API_URL" -ForegroundColor Cyan
Write-Host "• REACT_APP_GOOGLE_CLIENT_ID" -ForegroundColor Cyan
Write-Host ""

# Step 5: Troubleshooting tips
Write-Host "🚨 Step 5: Troubleshooting Tips" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "If OAuth is not working:" -ForegroundColor White
Write-Host "• Check Google OAuth configuration" -ForegroundColor Cyan
Write-Host "• Verify redirect URIs are correct" -ForegroundColor Cyan
Write-Host "• Check environment variables" -ForegroundColor Cyan
Write-Host "• Review browser console for errors" -ForegroundColor Cyan
Write-Host ""
Write-Host "If profile is not creating:" -ForegroundColor White
Write-Host "• Verify backend API is running" -ForegroundColor Cyan
Write-Host "• Check CosmosDB connection" -ForegroundColor Cyan
Write-Host "• Review backend logs" -ForegroundColor Cyan
Write-Host ""

# Step 6: Success criteria
Write-Host "✅ Step 6: Success Criteria" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your OAuth system is working when:" -ForegroundColor White
Write-Host "• All automated tests pass" -ForegroundColor Green
Write-Host "• Google OAuth flow completes successfully" -ForegroundColor Green
Write-Host "• User profile is created in CosmosDB" -ForegroundColor Green
Write-Host "• Session persists across page refreshes" -ForegroundColor Green
Write-Host "• No errors in browser console" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Deployment and testing setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 For detailed testing instructions, see:" -ForegroundColor Cyan
Write-Host "   POST_DEPLOYMENT_TESTING_GUIDE.md" -ForegroundColor White
Write-Host ""
Write-Host "🔗 For deployment checklist, see:" -ForegroundColor Cyan
Write-Host "   DEPLOYMENT_CHECKLIST.md" -ForegroundColor White
Write-Host ""

# Optional: Open the testing page
$openTestingPage = Read-Host "Would you like to open the testing page? (y/n)"
if ($openTestingPage -eq 'y' -or $openTestingPage -eq 'Y') {
    Write-Host "Opening testing page..." -ForegroundColor Yellow
    Start-Process "https://your-app-url.azurestaticapps.net/test-oauth"
}
