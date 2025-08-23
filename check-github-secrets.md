# GitHub Secrets Configuration Check

## Current Status
✅ Environment variables are set in Azure Static Web Apps
❌ Environment variables are NOT available in React build process
❌ Google Client ID is missing from build

## The Problem
React needs environment variables at **build time** (in GitHub Actions), not just at runtime (in Azure Static Web Apps).

## Solution: Add GitHub Secrets

### 1. Go to GitHub Repository
Navigate to: `https://github.com/marlondridley/scholargy-frontend`

### 2. Go to Settings → Secrets and Variables → Actions
- Click **Settings** tab
- Click **Secrets and variables** → **Actions**

### 3. Add These Repository Secrets

| Secret Name | Value |
|-------------|-------|
| `REACT_APP_SUPABASE_URL` | `https://urxlcpjjktzhxhmwhxda.supabase.co` |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyeGxjcGpqa3R6aHhobXdoeGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTI2MDIsImV4cCI6MjA2NzgyODYwMn0.gGWNSjtpSkq8pb6t0STok1Dya6bs87WHsyq9zUzXSK0` |
| `REACT_APP_API_URL` | `https://scholargy-dz3lcl3szkm74.azurewebsites.net/api` |
| `REACT_APP_GOOGLE_CLIENT_ID` | `122722646158-73elmvllne7fvnl5hqultgcavmgtalmo.apps.googleusercontent.com` |

### 4. How to Add Each Secret
1. Click **New repository secret**
2. Enter the **Name** (e.g., `REACT_APP_GOOGLE_CLIENT_ID`)
3. Enter the **Value** (copy from the table above)
4. Click **Add secret**

### 5. Trigger New Deployment
After adding all secrets, trigger a new deployment:

```bash
git add .
git commit -m "Trigger deployment with all environment variables"
git push
```

### 6. Verify the Fix
After deployment completes, run this in browser console:

```javascript
// Check if Google Client ID is now available
console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
console.log('All env vars:', {
    SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL ? 'SET' : 'MISSING',
    SUPABASE_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    API_URL: process.env.REACT_APP_API_URL ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'SET' : 'MISSING'
});
```

## Expected Result
After adding GitHub Secrets and redeploying, you should see:
```
Google Client ID: SET
All env vars: {SUPABASE_URL: "SET", SUPABASE_KEY: "SET", API_URL: "SET", GOOGLE_CLIENT_ID: "SET"}
```

## Why This Matters
- **Azure Static Web Apps** environment variables are for runtime
- **GitHub Secrets** are for build time (when React is compiled)
- React needs these variables during the build process to include them in the JavaScript bundle
