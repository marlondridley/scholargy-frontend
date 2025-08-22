# Google OAuth Setup Guide for Scholargy

## Overview
This guide covers setting up Google OAuth authentication for the Scholargy frontend deployed on Azure Static Web Apps.

## Prerequisites
- Google Cloud Console account
- Supabase project
- Azure Static Web Apps deployment

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     ```
     https://urxlcpjjktzhxhmwhxda.supabase.co/auth/v1/callback
     https://gentle-ground-0d24ae71e.1.azurestaticapps.net/auth/callback
     ```

### 1.2 Get Client ID and Secret
- Copy the **Client ID** and **Client Secret**
- You'll need these for Supabase configuration

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider
1. Go to your Supabase Dashboard
2. Navigate to "Authentication" > "Providers"
3. Find "Google" and click "Enable"
4. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
5. Save the configuration

### 2.2 Configure Redirect URLs
In Supabase Dashboard > "Authentication" > "URL Configuration":
- **Site URL**: `https://gentle-ground-0d24ae71e.1.azurestaticapps.net`
- **Redirect URLs**: 
  ```
  https://gentle-ground-0d24ae71e.1.azurestaticapps.net/auth/callback
  https://gentle-ground-0d24ae71e.1.azurestaticapps.net/reset-password/confirm
  ```

## Step 3: Environment Variables

### 3.1 GitHub Secrets
Add these to your GitHub repository secrets:
```
REACT_APP_SUPABASE_URL=https://urxlcpjjktzhxhmwhxda.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=https://scholargy-dz3lcl3szkm74.azurewebsites.net
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3.2 Azure Static Web Apps Configuration
Add these to Azure Portal > Your Static Web App > Configuration > Application settings:
```
REACT_APP_SUPABASE_URL=https://urxlcpjjktzhxhmwhxda.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=https://scholargy-dz3lcl3szkm74.azurewebsites.net
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Step 4: Implementation Details

### 4.1 OAuth Flow
The application supports two OAuth flows:

1. **Google Pre-built Button** (Recommended):
   - Uses Google's official sign-in button
   - Better UX with One Tap sign-in
   - Handles Chrome's third-party cookie phase-out

2. **Custom OAuth Button** (Fallback):
   - Uses Supabase's `signInWithOAuth`
   - Includes `access_type: 'offline'` for refresh tokens
   - Includes `prompt: 'consent'` for better token management

### 4.2 Token Management
- Google tokens are extracted from Supabase session
- Stored securely in localStorage
- Available for Google API access (Calendar, Drive, etc.)

### 4.3 Security Features
- Nonce generation for OAuth security
- Proper error handling
- Password validation with strength requirements
- Secure token storage

## Step 5: Testing

### 5.1 Test OAuth Flow
1. Deploy the application
2. Click "Sign in with Google"
3. Complete Google authentication
4. Verify redirect to dashboard/profile completion

### 5.2 Test Email Authentication
1. Test email/password signup
2. Verify email confirmation
3. Test password reset flow
4. Verify OTP authentication

## Step 6: Troubleshooting

### Common Issues

#### 404 Error After Google OAuth
- **Cause**: Missing or incorrect redirect URLs
- **Solution**: Verify redirect URLs in both Google Cloud Console and Supabase

#### Environment Variables Not Set
- **Cause**: Variables not passed to build process
- **Solution**: Ensure GitHub Actions workflow includes `skip_app_build: true`

#### OAuth Button Not Working
- **Cause**: Missing Google Client ID
- **Solution**: Add `REACT_APP_GOOGLE_CLIENT_ID` to environment variables

#### Email Not Sending
- **Cause**: Supabase email service limits
- **Solution**: Configure custom SMTP server for production

## Step 7: Production Considerations

### 7.1 Email Service
- Supabase default email service: 2 emails/hour limit
- For production: Configure custom SMTP server
- Consider services like SendGrid, Mailgun, or AWS SES

### 7.2 Security
- Use HTTPS for all redirect URLs
- Implement proper CORS policies
- Regular security audits
- Monitor authentication logs

### 7.3 Performance
- Implement proper caching
- Use CDN for static assets
- Monitor authentication response times

## URLs Summary

### Frontend
- **Production**: `https://gentle-ground-0d24ae71e.1.azurestaticapps.net`
- **Login**: `https://gentle-ground-0d24ae71e.1.azurestaticapps.net/login`
- **OAuth Callback**: `https://gentle-ground-0d24ae71e.1.azurestaticapps.net/auth/callback`
- **Password Reset**: `https://gentle-ground-0d24ae71e.1.azurestaticapps.net/reset-password/confirm`

### Backend
- **API**: `https://scholargy-dz3lcl3szkm74.azurewebsites.net`

### Supabase
- **Project**: `https://urxlcpjjktzhxhmwhxda.supabase.co`
- **Auth Callback**: `https://urxlcpjjktzhxhmwhxda.supabase.co/auth/v1/callback`

## Support
For issues with this setup:
1. Check Supabase logs in Dashboard
2. Verify Google Cloud Console configuration
3. Test with browser developer tools
4. Review Azure Static Web Apps logs
