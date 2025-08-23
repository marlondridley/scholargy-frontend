# Environment Variables Fix Guide

## Problem
Environment variables are not available in the browser because `process.env` is not accessible in client-side code. This is causing OAuth and other features to fail.

## Solution Overview
We've implemented a multi-layered approach to make environment variables available in the browser:

1. **Build-time processing**: Environment variables are injected into HTML files during build
2. **Runtime access**: A global `window.__ENV__` object provides access to environment variables
3. **Fallback mechanisms**: Multiple ways to access environment variables for maximum compatibility

## What's Been Implemented

### 1. Environment Configuration Script (`public/env-config.js`)
- Creates a global `window.__ENV__` object
- Contains environment variables with placeholder values
- Gets processed during build to replace placeholders with actual values

### 2. Build Script (`scripts/build-with-env.js`)
- Processes environment variables during build
- Replaces placeholders in HTML and JS files
- Logs available environment variables

### 3. Enhanced Diagnostic Tools (`src/utils/envDiagnostic.js`)
- Browser-safe environment variable checking
- Multiple fallback methods for accessing variables
- Comprehensive diagnostic reporting

### 4. Updated Build Process
- Modified `package.json` with `build:swa` script
- Updated GitHub Actions workflow
- Environment variables processed before React build

## Setup Instructions

### 1. Verify GitHub Secrets
Ensure these secrets are set in your GitHub repository:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_API_URL`
- `REACT_APP_GOOGLE_CLIENT_ID`

### 2. Deploy the Fix
The fix is already implemented. You need to:

1. **Commit and push** the changes to trigger a new deployment
2. **Monitor the build logs** to ensure environment variables are processed
3. **Test the application** after deployment

### 3. Test the Fix
After deployment, run this in the browser console:

```javascript
// Test environment variables
console.log('Environment Variables Test:');
console.log('SUPABASE_URL:', window.__ENV__?.REACT_APP_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SUPABASE_KEY:', window.__ENV__?.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
console.log('API_URL:', window.__ENV__?.REACT_APP_API_URL ? 'SET' : 'MISSING');
console.log('GOOGLE_CLIENT_ID:', window.__ENV__?.REACT_APP_GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
```

## How It Works

### Build Process
1. GitHub Actions runs with environment variables from secrets
2. `build:swa` script processes environment variables
3. Placeholders in `env-config.js` are replaced with actual values
4. React build creates the final bundle
5. Azure Static Web Apps deploys the processed files

### Runtime Access
```javascript
// Access environment variables safely
const supabaseUrl = window.__ENV__?.REACT_APP_SUPABASE_URL;
const apiUrl = window.__ENV__?.REACT_APP_API_URL;
```

### Fallback Methods
The `getEnvVar()` function tries multiple methods:
1. `process.env` (for server-side)
2. `window.__ENV__` (our injected variables)
3. `import.meta.env` (Vite-style)
4. Global variables

## Troubleshooting

### If Environment Variables Are Still Missing

#### 1. Check GitHub Secrets
- Go to your repository settings
- Navigate to Secrets and variables > Actions
- Verify all required secrets are set

#### 2. Check Build Logs
- Look for the "Processing environment variables..." message
- Verify that variables are being processed
- Check for any error messages

#### 3. Manual Verification
Add this to your `App.js` temporarily:
```javascript
useEffect(() => {
  console.log('🔍 Manual Environment Check:');
  console.log('window.__ENV__:', window.__ENV__);
  console.log('process.env:', process.env);
}, []);
```

### Common Issues

#### Issue: Variables show as placeholders
**Solution**: The build script didn't run. Check that `npm run build:swa` is being used.

#### Issue: Variables are undefined
**Solution**: GitHub secrets are missing or incorrect. Verify secret names and values.

#### Issue: OAuth still fails
**Solution**: Check that Supabase configuration matches the environment variables.

## Testing Checklist

- [ ] Environment variables are available in browser console
- [ ] Google OAuth sign-in works
- [ ] Supabase client initializes correctly
- [ ] API calls to backend work
- [ ] No console errors related to missing environment variables

## Alternative Solutions

If the current approach doesn't work, consider these alternatives:

### 1. Runtime Configuration
Create a configuration endpoint that serves environment variables:
```javascript
// In your backend
app.get('/api/config', (req, res) => {
  res.json({
    supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
    apiUrl: process.env.REACT_APP_API_URL
  });
});
```

### 2. Azure Static Web Apps Configuration
Use Azure Static Web Apps configuration to inject environment variables:
```json
{
  "platformErrorOverrides": [
    {
      "errorType": "NotFound",
      "serve": "/index.html"
    }
  ],
  "routes": [
    {
      "route": "/api/config",
      "serve": "/api/config"
    }
  ]
}
```

### 3. Build-time Environment Injection
Use a webpack plugin to inject environment variables:
```javascript
// webpack.config.js
const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.REACT_APP_SUPABASE_URL': JSON.stringify(process.env.REACT_APP_SUPABASE_URL),
      'process.env.REACT_APP_SUPABASE_ANON_KEY': JSON.stringify(process.env.REACT_APP_SUPABASE_ANON_KEY)
    })
  ]
};
```

## Next Steps

1. **Deploy the changes** and test the environment variables
2. **Verify OAuth works** with the new setup
3. **Monitor for any issues** and adjust as needed
4. **Remove temporary debugging code** once everything works

The implemented solution should resolve the environment variable issues and allow OAuth to work correctly! 🚀
