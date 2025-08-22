# Environment Variables Setup Guide

## Option 1: GitHub Repository Secrets (Recommended)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_API_URL=https://your-backend.azurewebsites.net
```

## Option 2: Azure Static Web Apps Environment Variables

1. Go to Azure Portal
2. Navigate to your Static Web App
3. Click **Configuration** → **Application settings**
4. Add these environment variables:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_API_URL=https://your-backend.azurewebsites.net
```

## Option 3: Local Development (.env file)

Create a `.env` file in the frontend root directory:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_API_URL=https://your-backend.azurewebsites.net
```

## Important Notes:

- **GitHub Secrets are REQUIRED** for React apps - they must be available at build time
- **Azure Static Web Apps environment variables** are runtime-only and won't work for React builds
- React embeds environment variables into the JavaScript bundle during build
- The workflow now uses the proven Azure Static Web Apps deployment pattern
- Environment variables are injected directly into the `Azure/static-web-apps-deploy@v1` action
- Make sure to **commit and push** changes to trigger the GitHub Actions workflow

## Why This Works:

The workflow uses a critical fix for Azure Static Web Apps:
1. **Pre-build with Secrets**: Environment variables are injected into our `npm run build` step
2. **Skip Azure Build**: Uses `skip_app_build: true` to prevent Azure's Oryx from rebuilding
3. **Deploy Pre-built**: Azure deploys our pre-built `build/` folder with environment variables embedded
4. **GitHub Secrets**: Environment variables are sourced from GitHub Repository Secrets

## The Key Fix:

Azure Static Web Apps by default runs its own build process (Oryx) which doesn't have access to GitHub secrets. By using `skip_app_build: true`, we:
- Build the app ourselves with environment variables
- Tell Azure to skip its build and use our pre-built version
- Ensure the deployed bundle contains the environment variables

## Required GitHub Secrets:

Make sure you have these secrets in your repository:
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Your Azure Static Web Apps deployment token
- `REACT_APP_SUPABASE_URL` - Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `REACT_APP_API_URL` - Your backend API URL
