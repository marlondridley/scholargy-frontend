# OAuth User Management Implementation Guide

## Overview
This guide covers the implementation of comprehensive OAuth user management using **Supabase for authentication** and **Azure CosmosDB for data storage**, including user data persistence, Google OAuth scopes, and localStorage integration.

## What's New

### 1. Enhanced AuthContext
- **Location**: `src/contexts/AuthContext.js`
- **Features**: 
  - Supabase authentication integration
  - localStorage integration for offline access
  - Google OAuth scope management
  - Backend API integration for CosmosDB user profiles

### 2. CosmosDB Schema
- **Location**: `database-schema.sql`
- **Features**: 
  - Users container with proper partitioning
  - User applications container for detailed profiles
  - Optimized indexes for query performance
  - Comprehensive user profile structure

### 3. User Profile Component
- **Location**: `src/components/UserProfile.js`
- **Features**: 
  - Display user data from localStorage
  - Google account integration status
  - Profile management interface

## Key Features

### 🔐 **OAuth Scopes**
The Supabase Auth UI component now includes Google OAuth scopes:

```javascript
options={{
    scopes: 'email profile openid https://www.googleapis.com/auth/calendar.readonly'
}}
```

**Available Scopes:**
- `email` - Access to user's email address
- `profile` - Access to basic profile information
- `openid` - OpenID Connect authentication
- `https://www.googleapis.com/auth/calendar.readonly` - Read-only access to Google Calendar

### 💾 **User Data Persistence**

#### Architecture Overview
- **Supabase**: Handles authentication (login, OAuth, session management)
- **Azure CosmosDB**: Stores user profiles and application data
- **Backend API**: Bridges between frontend and CosmosDB
- **localStorage**: Caches basic user info for offline access

#### Data Flow
When a user signs in via OAuth:
1. **Supabase authenticates** the user and provides session
2. **Basic user data stored** in localStorage for offline access
3. **Backend API checks** if user profile exists in CosmosDB
4. **Profile created/updated** in CosmosDB through backend API
5. **Full profile data** loaded from CosmosDB via backend API

#### localStorage Integration
Basic user data is stored in localStorage for offline access:
```javascript
localStorage.setItem("user", JSON.stringify({
    email: user.email,
    name: user.user_metadata?.full_name,
    img_url: user.user_metadata?.avatar_url,
    provider: user.app_metadata?.provider,
    created_at: new Date().toISOString(),
}));
```

### 🔄 **Automatic Synchronization**
- **New users**: Profile automatically created in CosmosDB via backend API
- **Existing users**: Profile updated with latest OAuth data through backend API
- **Metadata changes**: Synchronized between Supabase and CosmosDB
- **Sign out**: localStorage cleared, session terminated

## CosmosDB Schema

### Users Container Structure
```json
{
    "id": "unique-user-id",
    "email": "user@example.com",
    "name": "User Full Name",
    "img_url": "https://example.com/avatar.jpg",
    "provider": "google|email",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "profile": {
        "gpa": 3.8,
        "major": "Computer Science",
        "graduationYear": 2025
    }
}
```

### User Applications Container
```json
{
    "id": "unique-application-id",
    "userId": "user-id",
    "email": "user@example.com",
    "profile": {
        "personal": { ... },
        "academic": { ... },
        "extracurriculars": [ ... ],
        "essays": [ ... ],
        "recommendations": [ ... ]
    }
}
```

### Performance Features
- **Partition key optimization** for efficient queries
- **Indexed fields** for fast lookups
- **Automatic scaling** based on demand
- **Global distribution** capabilities

## Implementation Details

### AuthContext Enhancements

#### User Management Logic
```javascript
const handleAuthChange = async (event, session) => {
    if (event === "SIGNED_IN" && session?.user) {
        const user = session.user;
        
        // Store basic user data in localStorage for offline access
        const userData = {
            email: user.email,
            name: user.user_metadata?.full_name || user.email,
            img_url: user.user_metadata?.avatar_url,
            provider: user.app_metadata?.provider || 'email',
            created_at: new Date().toISOString(),
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Note: User profile data will be managed through the backend API
        // which connects to Azure CosmosDB for the actual user profile storage
    }
};
```

#### localStorage Access
```javascript
getUserData: () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
}
```

### User Profile Component

#### Features
- **Profile display** with avatar and user info
- **Google integration status** for OAuth users
- **Account actions** interface
- **Responsive design** with Tailwind CSS

#### Usage
```javascript
import UserProfile from '../components/UserProfile';

// In your component
<UserProfile />
```

## Setup Instructions

### 1. CosmosDB Setup
1. Go to your Azure Portal
2. Navigate to your CosmosDB account
3. Create containers based on the schema in `database-schema.sql`
4. Set up proper partition keys and indexes
5. Configure throughput based on your needs

### 2. Google OAuth Configuration
1. In Google Cloud Console, ensure these scopes are enabled:
   - `email`
   - `profile`
   - `openid`
   - `https://www.googleapis.com/auth/calendar.readonly`

2. In Supabase Dashboard:
   - Go to Authentication > Providers
   - Enable Google provider
   - Add your OAuth credentials

### 3. Backend API Configuration
1. Ensure your backend API is configured to connect to CosmosDB
2. Verify the user profile endpoints are working:
   - `GET /api/profile/:userId` - Get user profile
   - `POST /api/profile/:userId` - Create/update user profile
3. Test the connection between frontend and backend

### 4. Environment Variables
Ensure these are set in your GitHub Secrets:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=your_backend_api_url
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## Usage Examples

### Accessing User Data
```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
    const { getUserData } = useAuth();
    const userData = getUserData();
    
    if (userData) {
        console.log('User email:', userData.email);
        console.log('User name:', userData.name);
        console.log('Provider:', userData.provider);
    }
};
```

### Checking Google Integration
```javascript
const userData = getUserData();
if (userData?.provider === 'google') {
    // User signed in with Google
    // Can access Google Calendar and other services
}
```

### Profile Management
```javascript
// Display user profile
<UserProfile />

// Access user data programmatically
const userData = getUserData();
```

## Testing

### Test OAuth Flow
1. **Sign in with Google** at `/login-v2`
2. **Verify user creation** in CosmosDB via backend API
3. **Check localStorage** for basic user data
4. **Test profile component** display

### Test Data Persistence
1. **Sign out** and sign back in
2. **Verify existing user** profile is loaded from CosmosDB
3. **Check metadata updates** are synchronized
4. **Test offline access** via localStorage
5. **Verify backend API** connections to CosmosDB

## Troubleshooting

### Common Issues

#### 1. User Not Created in CosmosDB
- Check backend API connection to CosmosDB
- Verify CosmosDB permissions and connection string
- Check console for error messages
- Verify user profile endpoints are working

#### 2. localStorage Not Working
- Check browser localStorage support
- Verify JSON parsing/stringifying
- Check for storage quota issues

#### 3. OAuth Scopes Not Working
- Verify Google Cloud Console configuration
- Check Supabase OAuth settings
- Ensure scopes are properly formatted

#### 4. Profile Not Updating
- Check AuthContext event handling
- Verify database update queries
- Check for network errors

## Best Practices

### 1. **Error Handling**
- Always wrap database operations in try-catch
- Log errors for debugging
- Provide fallback behavior

### 2. **Data Validation**
- Validate user data before storage
- Sanitize OAuth metadata
- Handle missing fields gracefully

### 3. **Security**
- Use RLS policies for data access
- Validate user permissions
- Sanitize user inputs

### 4. **Performance**
- Use database indexes
- Minimize localStorage operations
- Cache user data appropriately

## Next Steps

1. **Deploy the CosmosDB containers** based on the schema
2. **Test OAuth flow** with Google scopes
3. **Verify user data persistence** in CosmosDB
4. **Test backend API integration** with CosmosDB
5. **Implement additional OAuth providers**
6. **Add more Google services integration**

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Azure CosmosDB Documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [Google OAuth Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [CosmosDB Partitioning](https://docs.microsoft.com/en-us/azure/cosmos-db/partitioning-overview)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

This implementation provides a robust, secure, and user-friendly OAuth experience using Supabase for authentication and Azure CosmosDB for data storage, with proper data persistence and Google service integration!
