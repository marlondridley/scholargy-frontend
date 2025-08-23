# GitHub Secrets Checklist

## Required Secrets for OAuth to Work

### 1. Go to GitHub Repository Settings
- Navigate to: `https://github.com/marlondridley/scholargy-frontend`
- Click **Settings** tab
- Click **Secrets and variables** → **Actions**

### 2. Verify These Secrets Exist

| Secret Name | Value | Status |
|-------------|-------|--------|
| `REACT_APP_SUPABASE_URL` | `https://urxlcpjjktzhxhmwhxda.supabase.co` | ✅ Should exist |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ Should exist |
| `REACT_APP_API_URL` | `https://scholargy-dz3lcl3szkm74.azurewebsites.net/api` | ✅ Should exist |
| `REACT_APP_GOOGLE_CLIENT_ID` | `122722646158-73elmvllne7fvnl5hqultgcavmgtalmo.apps.googleusercontent.com` | ❌ **MISSING!** |

### 3. Add the Missing Secret

**Action Required**: Add the missing `REACT_APP_GOOGLE_CLIENT_ID` secret:

1. Click **New repository secret**
2. **Name**: `REACT_APP_GOOGLE_CLIENT_ID`
3. **Value**: `122722646158-73elmvllne7fvnl5hqultgcavmgtalmo.apps.googleusercontent.com`
4. Click **Add secret**

### 4. Trigger New Deployment

After adding the secret, trigger a new deployment by:

**Option A: Push a small change**
```bash
git add .
git commit -m "Trigger deployment with Google Client ID"
git push
```

**Option B: Manual deployment trigger**
- Go to **Actions** tab in GitHub
- Click **Run workflow** on the main workflow
- Select **main** branch
- Click **Run workflow**

### 5. Verify Deployment

After deployment completes:
1. Go to: `https://gentle-ground-0d24ae71e.1.azurestaticapps.net`
2. Open browser console (F12)
3. Run: `siteCheck()`
4. Should see: ✅ Environment variables available: Yes

## Expected Results After Fix

When you run `siteCheck()` after the deployment, you should see:
```
✅ You are on the correct site!
Environment variables available: ✅ Yes
Supabase client available: ✅ Yes
🎉 Ready to test OAuth!
```

## Troubleshooting

If environment variables are still missing after deployment:
1. Check GitHub Actions logs for build errors
2. Verify all secrets are spelled correctly
3. Ensure the workflow file includes all environment variables
4. Wait 5-10 minutes for deployment to complete
