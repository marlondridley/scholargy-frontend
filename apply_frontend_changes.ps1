# apply_frontend_changes.ps1 (fixed)
$ErrorActionPreference = "Stop"

function Backup-Once($path) {
  if (Test-Path $path -PathType Leaf) {
    $bak = "$path.bak"
    if (-not (Test-Path $bak)) { Copy-Item $path $bak }
  }
}

function Ensure-Text($path, $content) {
  $dir = Split-Path $path -Parent
  if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
  if (Test-Path $path) { Backup-Once $path }
  $content -replace "`r`n", "`n" | Set-Content -Path $path -NoNewline
  Write-Host "Wrote $path"
}

function Replace-InFile($path, $replacements) {
  if (-not (Test-Path $path)) { throw "File not found: $path" }
  Backup-Once $path
  $text = Get-Content $path -Raw
  foreach ($r in $replacements) {
    $pattern = $r.pattern
    $replace = $r.replace
    $new = [System.Text.RegularExpressions.Regex]::Replace($text, $pattern, $replace, 'Singleline')
    $changed = ($new -ne $text)
    if ($changed) { Write-Host "  Updated pattern in ${path}: ${pattern}"; $text = $new }
  }
  $text | Set-Content -Path $path -NoNewline
}

# 1) .github/workflows/main.yml — fix comment typo
$wf = ".github/workflows/main.yml"
if (Test-Path $wf) {
  Replace-InFile $wf @(
    @{ pattern = [regex]::Escape("skip_app_build: true   # Prevent Oryx from rebuildinggit"); replace = "skip_app_build: true   # Prevent Oryx from rebuilding" }
  )
  Write-Host "Patched $wf"
} else { Write-Host "Skipped $wf (not found)" }

# 2) BACKEND_SETUP.md — create new file
$backendSetup = @'
# Backend Setup Guide
...
# Production Deployment

For production, you'll need to:
1. Deploy the backend to Azure App Service
2. Set up environment variables in Azure
3. Deploy the frontend to Azure Static Web Apps
4. Configure the frontend to point to the production backend URL
'@
Ensure-Text "BACKEND_SETUP.md" $backendSetup

# 3) public/env-config.js — set empty strings
$envCfg = @'
  window.__ENV__ = {
    REACT_APP_SUPABASE_URL: '',
    REACT_APP_SUPABASE_ANON_KEY: '',
    REACT_APP_API_URL: '',
    REACT_APP_GOOGLE_CLIENT_ID: ''
  };
'@
Ensure-Text "public/env-config.js" $envCfg

# 4) src/App.js — switch envTest -> envDiagnostic
$srcApp = "src/App.js"
if (Test-Path $srcApp) {
  Replace-InFile $srcApp @(
    @{ pattern = "import\s*\{\s*testEnvironmentVariables\s*\}\s*from\s*'./utils/envTest';"; replace = "import { logEnvironmentVariables } from './utils/envDiagnostic';" }
    @{ pattern = "//\s*Test environment variables\s*\r?\n\s*testEnvironmentVariables\(\);\s*"; replace = "// Log environment variables`n  logEnvironmentVariables();" }
  )
  Write-Host "Patched $srcApp"
} else { Write-Host "Skipped $srcApp (not found)" }

# 5) src/components/OAuthTester.js
$oauth = "src/components/OAuthTester.js"
if (Test-Path $oauth) {
  Replace-InFile $oauth @(
    @{ pattern = "const\s+addLog\s*=\s*\(\s*message,\s*type\s*=\s*'info'\s*\)\s*=>\s*\{"; replace = "const addLog = (message, type) => {`n        if (!type) type = 'info';" }
    @{ pattern = "setTestResults\(\s*prev\s*=>\s*\(\{\s*\.\.\.prev,\s*environment:\s*allPassed\s*\}\)\s*\)\s*;"; replace = "setTestResults(prev => Object.assign({}, prev, { environment: allPassed }));" }
    @{ pattern = "setTestResults\(\s*prev\s*=>\s*\(\{\s*\.\.\.prev,\s*localStorage:\s*true\s*\}\)\s*\)\s*;"; replace = "setTestResults(prev => Object.assign({}, prev, { localStorage: true }));" }
    @{ pattern = "setTestResults\(\s*prev\s*=>\s*\(\{\s*\.\.\.prev,\s*api:\s*true\s*\}\)\s*\)\s*;"; replace = "setTestResults(prev => Object.assign({}, prev, { api: true }));" }
    @{ pattern = "setTestResults\(\s*prev\s*=>\s*\(\{\s*\.\.\.prev,\s*oauth:\s*false\s*\}\)\s*\)\s*;"; replace = "setTestResults(prev => Object.assign({}, prev, { oauth: false }));" }
    @{ pattern = "Provider:\s*\$\{user\.app_metadata\?\.\s*provider\s*\|\|\s*'email'\}"; replace = "Provider: \${(user.app_metadata && user.app_metadata.provider) || 'email'}" }
  )
  Write-Host "Patched $oauth"
} else { Write-Host "Skipped $oauth (not found)" }

# 6) src/contexts/AuthContext.js
$auth = "src/contexts/AuthContext.js"
if (Test-Path $auth) {
  Replace-InFile $auth @(
    @{ pattern = "setUser\(session\?\.\s*user\s*\?\?\s*null\)"; replace = "setUser(session && session.user ? session.user : null)" }
    @{ pattern = "fullName:\s*user\.user_metadata\?\.\s*full_name,"; replace = "fullName: user.user_metadata && user.user_metadata.full_name," }
    @{ pattern = "avatarUrl:\s*user\.user_metadata\?\.\s*avatar_url,"; replace = "avatarUrl: user.user_metadata && user.user_metadata.avatar_url," }
    @{ pattern = "provider:\s*user\.app_metadata\?\.\s*provider\s*\|\|\s*'email',"; replace = "provider: (user.app_metadata && user.app_metadata.provider) || 'email'," }
  )
  Write-Host "Patched $auth"
} else { Write-Host "Skipped $auth (not found)" }

# 7) src/pages/StudentProfilePage.js
$profilePage = "src/pages/StudentProfilePage.js"
if (Test-Path $profilePage) {
  Replace-InFile $profilePage @(
    @{ pattern = "setAssessmentText\(result\.assessmentText\);"; replace = "setAssessmentText(result.assessment?.summary || 'Assessment completed successfully.');" }
  )
  Write-Host "Patched $profilePage"
} else { Write-Host "Skipped $profilePage (not found)" }

# 8) src/services/api.js
$api = "src/services/api.js"
if (Test-Path $api) {
  Replace-InFile $api @(
    @{ pattern = "console\.error\(`API request failed for \`\$\{endpoint\}:\`, error\);\s*throw error;"; replace = @'
console.error(`API request failed for ${endpoint}:`, error);
if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    console.warn('Backend appears to be offline. Using fallback data.');
    throw new Error('Backend service unavailable. Please ensure the backend is running.');
}
throw error;
'@ }
    @{ pattern = "export\s+const\s+getProfileAssessment\s*=\s*\(userId\)\s*=>\s*makeRequest\(`/profile/\$\{userId\}/assessment`,\s*\{\},\s*true\);"; replace = @'
export const getProfileAssessment = (profileData) => makeRequest('/profile/assessment', {
    method: 'POST',
    body: JSON.stringify({ profileData })
}, true);
'@ }
  )
  $apiText = Get-Content $api -Raw
  if ($apiText -notmatch "export\s+const\s+searchArticles") {
    Add-Content $api @'
export const searchArticles = (query) => makeRequest(`/articles/search?q=${encodeURIComponent(query)}`);
'@
    Write-Host "  Added searchArticles()"
  }
  Write-Host "Patched $api"
} else { Write-Host "Skipped $api (not found)" }

# 9) src/utils/dashboardHelpers.js
$dash = "src/utils/dashboardHelpers.js"
if (Test-Path $dash) {
  Replace-InFile $dash @(
    @{ pattern = "console\.log\('Fetching dashboard data for userId:',\s*userId\);\s*"; replace = @'
console.log('Fetching dashboard data for userId:', userId);

// Check if backend is available first
try {
  const healthCheck = await fetch('/health');
  if (!healthCheck.ok) {
    throw new Error('Backend health check failed');
  }
} catch (healthError) {
  console.warn('Backend appears to be offline:', healthError.message);
  return getFallbackData(profile);
}
'@ }
  )
  Write-Host "Patched $dash"
} else { Write-Host "Skipped $dash (not found)" }

# 10) src/utils/envDiagnostic.js — new file
$envDiag = @'
// src/utils/envDiagnostic.js
export const logEnvironmentVariables = () => {
  console.log("=== Environment Variables ===");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("REACT_APP_SUPABASE_URL:", process.env.REACT_APP_SUPABASE_URL || "NOT SET");
  console.log("REACT_APP_SUPABASE_ANON_KEY:", process.env.REACT_APP_SUPABASE_ANON_KEY ? "***" : "NOT SET");
  console.log("REACT_APP_API_URL:", process.env.REACT_APP_API_URL || "NOT SET");
  console.log("REACT_APP_GOOGLE_CLIENT_ID:", process.env.REACT_APP_GOOGLE_CLIENT_ID || "NOT SET");
  console.log("==============================");
};

export const getEnvVar = (varName) => {
  return process.env[varName] || null;
};

export const checkRequiredEnvVars = () => {
  const requiredVars = [
    "REACT_APP_SUPABASE_URL",
    "REACT_APP_SUPABASE_ANON_KEY",
    "REACT_APP_API_URL"
  ];

  const missing = [];
  const available = {};

  requiredVars.forEach(varName => {
    const value = getEnvVar(varName);
    if (value) {
      available[varName] = value;
    } else {
      missing.push(varName);
    }
  });

  return {
    allAvailable: missing.length === 0,
    missing,
    available
  };
};
'@
Ensure-Text "src/utils/envDiagnostic.js" $envDiag

# 11) src/utils/envTest.js — delete if present
$envTest = "src/utils/envTest.js"
if (Test-Path $envTest) {
  Backup-Once $envTest
  Remove-Item $envTest
  Write-Host "Deleted $envTest"
} else { Write-Host "Skipped deletion (envTest.js not found)" }

# 12) src/utils/userProfileManager.js
$upm = "src/utils/userProfileManager.js"
if (Test-Path $upm) {
  Replace-InFile $upm @(
    @{ pattern = "const response = await makeRequest\(`/profile/\$\{userId\}/assessment`,\s*\{\},\s*true\);\s*return response\.data \|\| response;"; replace = @'
const profile = await this.getUserProfile(userId);
if (!profile) {
  console.warn("No profile found for assessment");
  return null;
}
const response = await makeRequest("/profile/assessment", {
  method: "POST",
  body: JSON.stringify({ profileData: profile })
}, true);
return response.assessment || response;
'@ }
  )
  Write-Host "Patched $upm"
} else { Write-Host "Skipped $upm (not found)" }

Write-Host "`nAll done. Review 'git status', then commit:"
Write-Host "  git add ."
Write-Host "  git commit -m 'Apply frontend changes (Aug 23, 2025)'"
