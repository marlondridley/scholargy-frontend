# OAuth Setup Guide for Azure Static Web Apps

## ✅ Current Implementation Status

Your OAuth flow is **almost complete**! Here's what's already implemented:

### 1️⃣ Google OAuth Button ✅
- **Location**: `src/pages/LoginPage.js`
- **Function**: `handleGoogleLogin()` calls `signInWithGoogle()`
- **UI**: Beautiful Google-branded button with proper styling

### 2️⃣ AuthCallback Handler ✅
- **Location**: `src/pages/AuthCallback.js`
- **Function**: Processes OAuth callback, handles errors, shows loading spinner
- **Flow**: Redirects to `/dashboard` or `/student-profile` based on profile completion

### 3️⃣ AuthContext Integration ✅
- **Location**: `src/contexts/AuthContext.js`
- **Function**: `signInWithGoogle()` with proper redirect URL
- **Redirect**: `${window.location.origin}/auth/callback`

### 4️⃣ Azure Static Web Apps Routing ✅
- **Location**: `staticwebapp.config.json` (just created)
- **Function**: Handles SPA routing, ensures `/auth/callback` is served by React

## 🔧 Required Configuration

### 1️⃣ Supabase OAuth Settings

**In your Supabase Dashboard:**

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://<your-app>.azurestaticapps.net`
3. Add **Redirect URLs**:
   ```
   https://<your-app>.azurestaticapps.net/auth/callback
   https://<your-app>.azurestaticapps.net/dashboard
   https://<your-app>.azurestaticapps.net/student-profile
   ```

### 2️⃣ Google OAuth Provider Setup

**In your Supabase Dashboard:**

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
4. Set **Redirect URL** in Google Cloud Console to:
   ```
   https://<your-project>.supabase.co/auth/v1/callback
   ```

## 🔄 Complete OAuth Flow

### Step-by-Step Process:

1. **User clicks "Sign in with Google"** on `/login`
2. **Supabase redirects** to Google OAuth
3. **User authenticates** with Google
4. **Google redirects back** to Supabase
5. **Supabase redirects** to `/auth/callback` with hash token
6. **AuthCallback.js** processes the token
7. **Session is established** via `supabase.auth.getSession()`
8. **User is redirected** based on profile completion:
   - If profile complete → `/dashboard`
   - If profile incomplete → `/student-profile`

## 🚀 Deployment Checklist

### Before Deploying:

- [ ] **Supabase OAuth configured** with correct redirect URLs
- [ ] **Google OAuth provider** enabled in Supabase
- [ ] **GitHub Secrets** set with environment variables
- [ ] **staticwebapp.config.json** committed to repository
- [ ] **AuthCallback.js** properly handles all scenarios

### After Deploying:

- [ ] **Test OAuth flow** end-to-end
- [ ] **Verify redirect URLs** work correctly
- [ ] **Check session persistence** across page refreshes
- [ ] **Test profile completion** flow

## 🐛 Troubleshooting

### Common Issues:

1. **"Invalid redirect URL"**
   - Check Supabase redirect URL configuration
   - Ensure exact match with your Azure Static Web Apps URL

2. **"404 on /auth/callback"**
   - Verify `staticwebapp.config.json` is deployed
   - Check Azure Static Web Apps routing configuration

3. **"Authentication failed after callback"**
   - Check browser console for errors
   - Verify Supabase environment variables are set correctly

4. **"Session not persisting"**
   - Check Supabase client configuration
   - Verify `AuthProvider` is wrapping the app correctly

## 📝 Environment Variables Required

Make sure these are set in GitHub Secrets:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_API_URL=https://your-backend.azurewebsites.net
```

## 🎯 Expected Result

After proper configuration, users should be able to:

1. Click "Sign in with Google" on the login page
2. Complete Google OAuth authentication
3. Be automatically redirected to the appropriate page
4. Have their session persist across browser sessions
5. Access protected routes based on their authentication status

Your implementation is very close to being complete! Just configure the Supabase OAuth settings and you should have a fully working OAuth flow.
