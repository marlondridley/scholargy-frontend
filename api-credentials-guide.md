# API Credentials Configuration Guide

## Overview
This guide covers the updated API configuration that includes credentials support for cross-origin requests, which is essential for proper authentication handling, especially with OAuth flows.

## What's Been Updated

### 1. Enhanced API Request Function (`src/services/api.js`)
- **Credentials Support**: Added `credentials: 'include'` to all fetch requests
- **Environment Variable Integration**: Updated to use the new environment variable system
- **Cross-Origin Support**: Proper handling of CORS requests with authentication

### 2. Updated Supabase Configuration (`src/utils/supabase.js`)
- **Environment Variable Fallbacks**: Multiple methods to access environment variables
- **Browser-Safe Access**: Uses `window.__ENV__` when available
- **Enhanced Error Handling**: Better error messages and fallback behavior

## Key Changes

### API Request Function
```javascript
// Before
const response = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });

// After
const fetchOptions = {
    ...options,
    headers: { ...headers, ...options.headers },
    credentials: 'include', // Include credentials for cross-origin requests
};
const response = await fetch(url, fetchOptions);
```

### Environment Variable Access
```javascript
// Get API URL with fallbacks
const getApiUrl = () => {
    if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.REACT_APP_API_URL) {
        return window.__ENV__.REACT_APP_API_URL;
    }
    if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) {
        return process.env.REACT_APP_API_URL;
    }
    return '/api'; // Fallback to relative path
};
```

## Why Credentials Are Important

### 1. **Cross-Origin Authentication**
- Browsers block cookies and authentication headers in cross-origin requests by default
- `credentials: 'include'` tells the browser to include cookies and authentication headers
- Essential for OAuth flows and session management

### 2. **OAuth Flow Support**
- OAuth providers often require credentials to be sent with requests
- Ensures proper session handling across domains
- Prevents authentication failures in production

### 3. **Session Management**
- Maintains user sessions across API calls
- Ensures authentication tokens are properly sent
- Supports secure cookie-based authentication

## Configuration Requirements

### Backend CORS Configuration
Your backend must be configured to accept credentials:

```javascript
// Express.js CORS configuration
app.use(cors({
    origin: 'https://your-frontend-domain.com',
    credentials: true, // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Azure Static Web Apps Configuration
Ensure your `staticwebapp.config.json` includes proper CORS headers:

```json
{
  "navigationFallback": {
    "rewrite": "/index.html"
  },
  "routes": [
    {
      "route": "/api/*",
      "headers": {
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Origin": "https://your-frontend-domain.com"
      }
    }
  ]
}
```

## Testing the Configuration

### 1. Check Environment Variables
Run this in the browser console:
```javascript
// Test environment variables
console.log('API URL:', window.__ENV__?.REACT_APP_API_URL);
console.log('Supabase URL:', window.__ENV__?.REACT_APP_SUPABASE_URL);
console.log('Supabase Key:', window.__ENV__?.REACT_APP_SUPABASE_ANON_KEY ? 'SET' : 'MISSING');
```

### 2. Test API Requests
```javascript
// Test API request with credentials
fetch('/api/test', {
    method: 'GET',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
})
.then(response => response.json())
.then(data => console.log('API Response:', data))
.catch(error => console.error('API Error:', error));
```

### 3. Test OAuth Flow
1. Navigate to `/login-v2`
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. Check that you're redirected to the dashboard
5. Verify no CORS errors in the console

## Troubleshooting

### Common Issues

#### Issue: CORS Errors
**Symptoms**: `Access to fetch at '...' from origin '...' has been blocked by CORS policy`
**Solution**: Ensure backend CORS is configured to allow credentials

#### Issue: Authentication Failures
**Symptoms**: API calls return 401/403 errors
**Solution**: Check that `credentials: 'include'` is being sent with requests

#### Issue: Environment Variables Missing
**Symptoms**: API calls fail with "API URL not configured"
**Solution**: Verify GitHub secrets and build process

### Debug Steps

#### 1. Check Network Tab
- Open browser DevTools
- Go to Network tab
- Make an API request
- Check that `credentials: include` is in the request
- Verify no CORS errors

#### 2. Check Console Logs
- Look for environment variable debug messages
- Check for API request errors
- Verify Supabase client initialization

#### 3. Test Environment Variables
```javascript
// Run this in console
console.log('🔍 Environment Check:');
console.log('window.__ENV__:', window.__ENV__);
console.log('process.env:', typeof process !== 'undefined' ? process.env : 'Not available');
```

## Best Practices

### 1. **Security**
- Always use HTTPS in production
- Validate CORS origins on the backend
- Implement proper session management

### 2. **Error Handling**
- Provide meaningful error messages
- Implement retry logic for failed requests
- Log errors for debugging

### 3. **Performance**
- Use appropriate caching strategies
- Minimize unnecessary API calls
- Implement request debouncing where appropriate

## Migration Checklist

- [ ] Backend CORS configured for credentials
- [ ] Environment variables properly set
- [ ] API requests include credentials
- [ ] OAuth flow tested
- [ ] No CORS errors in console
- [ ] Authentication working correctly
- [ ] Session management functional

## Next Steps

1. **Deploy the changes** and test thoroughly
2. **Monitor for CORS errors** in production
3. **Test OAuth flow** end-to-end
4. **Verify session persistence** across page reloads
5. **Monitor API performance** and error rates

The updated API configuration should resolve authentication issues and ensure proper OAuth functionality! 🚀
