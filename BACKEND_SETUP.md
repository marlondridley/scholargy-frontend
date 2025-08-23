# Backend Setup Guide

## Why the App Doesn't Work When Bypassing Login

When you bypass the login page, the frontend tries to make API calls to the backend, but the backend needs to be running and properly configured. Here's what's happening:

1. **Frontend makes API calls** to endpoints like `/api/profile/${userId}`, `/api/dashboard/top-matches`, etc.
2. **Backend needs to be running** to handle these requests
3. **Backend needs environment variables** for database connections, AI services, etc.
4. **Authentication is required** for most API endpoints

## ✅ Recent API Endpoint Fixes

The following API endpoint mismatches have been resolved:

- **Profile Assessment**: Updated from `GET /api/profile/${userId}/assessment` to `POST /api/profile/assessment` with profile data in request body
- **Backend Route**: Added new POST route `/api/profile/assessment` that accepts profile data directly
- **Frontend API**: Updated `getProfileAssessment()` to send profile data via POST instead of treating input as user ID
- **StudentProfilePage**: Fixed assessment result handling to properly display the assessment summary from the backend response
- **Article Search**: Fixed Azure Search results serialization by properly iterating over the async iterator and returning structured JSON response with count and results array
- **Frontend API**: Added `searchArticles()` function to utilize the updated article search endpoint
- **Test Infrastructure**: Added comprehensive Jest test suite for `calculateProbability` function with edge cases and weightings verification
- **Package Configuration**: Updated backend package.json with Jest testing framework and test scripts

## Quick Backend Setup

### 1. Navigate to Backend Directory
```bash
cd ../scholargy-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create a `.env` file in the backend directory with these variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration (CosmosDB)
COSMOS_DB_CONNECTION_STRING=your_cosmos_db_connection_string
DB_NAME=scholargyvectordb

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME=your_embedding_deployment_name

# Redis Configuration (Optional)
AZURE_REDIS_CONNECTION_STRING=your_redis_connection_string

# Server Configuration
PORT=8080
NODE_ENV=development
```

### 4. Start the Backend
```bash
npm start
```

The backend will start on port 8080 and serve both the API and the frontend.

## Alternative: Frontend-Only Mode

If you don't want to set up the full backend, you can modify the frontend to work in "demo mode":

### 1. Update Frontend API URL
Set the API URL to point to a mock service or disable API calls:

```javascript
// In src/services/api.js
const API_BASE_URL = '/api'; // This will try to call the backend
// OR
const API_BASE_URL = null; // This will disable API calls
```

### 2. Use Mock Data
The frontend already has fallback data in `dashboardHelpers.js` that will be used when the backend is unavailable.

## Testing the Setup

### 1. Check Backend Health
Visit `http://localhost:8080/health` to see if the backend is running.

### 2. Test API Endpoints
Try these endpoints:
- `GET /api/dashboard/top-matches`
- `GET /api/profile/test-user`
- `GET /health`

### 3. Test Frontend Integration
Start the frontend and try to access the dashboard. It should now work properly.

## Common Issues

### 1. "Database service unavailable"
- Check your CosmosDB connection string
- Ensure the database exists and is accessible

### 2. "Authentication required"
- The API endpoints require authentication tokens
- You need to log in through the frontend to get valid tokens

### 3. "Backend service unavailable"
- Make sure the backend is running on the correct port
- Check that the frontend's API URL points to the correct backend URL

### 4. Environment Variables Missing
- Ensure all required environment variables are set in the `.env` file
- The backend will show which variables are missing on startup

## Development Workflow

1. **Start the backend first**: `cd ../scholargy-backend && npm start`
2. **Start the frontend**: `npm start` (in the frontend directory)
3. **Access the app**: Go to `http://localhost:3000`
4. **Login or bypass login**: The app should now work properly

## Production Deployment

For production, you'll need to:
1. Deploy the backend to Azure App Service
2. Set up environment variables in Azure
3. Deploy the frontend to Azure Static Web Apps
4. Configure the frontend to point to the production backend URL
