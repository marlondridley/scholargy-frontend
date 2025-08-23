# User Management System Guide

## Overview
This guide covers the implementation of a comprehensive user management system that handles user authentication, profile storage, and data synchronization between Supabase and localStorage.

## What's New

### 1. User Service (`src/services/userService.js`)
- **Database Operations**: Check, insert, and update user profiles
- **LocalStorage Management**: Store and retrieve user data locally
- **Authentication Integration**: Handle auth state changes automatically
- **Profile Updates**: Update user information with validation

### 2. Enhanced AuthContext Integration
- **Automatic User Management**: User profiles created/updated on authentication
- **Data Synchronization**: Keeps localStorage and database in sync
- **Error Handling**: Robust error handling for all operations

### 3. Database Schema (`supabase-schema.sql`)
- **Users Table**: Comprehensive user profile storage
- **Row Level Security**: Secure data access policies
- **Automatic Triggers**: Handle user creation and updates
- **Performance Indexes**: Optimized database queries

## Key Features

### 🔐 **Authentication Flow**
1. User signs in (Google OAuth or email/password)
2. Supabase creates auth session
3. UserService checks if user exists in database
4. If new user: Creates profile in database
5. If existing user: Updates profile information
6. Stores user data in localStorage for offline access

### 💾 **Data Storage Strategy**
- **Supabase Database**: Primary storage for user profiles
- **localStorage**: Offline access and quick data retrieval
- **Synchronization**: Automatic sync between database and localStorage

### 🛡️ **Security Features**
- **Row Level Security**: Users can only access their own data
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Graceful error handling and recovery

## Implementation Details

### User Service Methods

#### `checkUserExists(email)`
```javascript
// Check if user exists in database
const { exists, user } = await userService.checkUserExists(email);
```

#### `upsertUser(userData)`
```javascript
// Insert or update user in database
const { success, user } = await userService.upsertUser({
  id: user.id,
  email: user.email,
  name: user.user_metadata?.full_name,
  img_url: user.user_metadata?.avatar_url,
  // ... other fields
});
```

#### `handleAuthChange(event, session)`
```javascript
// Handle authentication state changes
await userService.handleAuthChange('SIGNED_IN', session);
```

#### `storeUserInLocalStorage(user)`
```javascript
// Store user data in localStorage
userService.storeUserInLocalStorage(userData);
```

#### `getUserFromLocalStorage()`
```javascript
// Retrieve user data from localStorage
const user = userService.getUserFromLocalStorage();
```

### Database Schema

#### Users Table Structure
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    img_url TEXT,
    provider TEXT DEFAULT 'email',
    req_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Profile fields
    gpa DECIMAL(3,2),
    major TEXT,
    graduation_year INTEGER,
    high_school TEXT,
    sat_score INTEGER,
    act_score INTEGER,
    extracurriculars TEXT[],
    awards TEXT[],
    essays TEXT[],
    
    -- Preferences
    preferred_colleges TEXT[],
    preferred_majors TEXT[],
    budget_range TEXT,
    location_preferences TEXT[],
    
    -- Settings
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    privacy_settings JSONB DEFAULT '{}'::jsonb
);
```

## Setup Instructions

### 1. Database Setup
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run the `supabase-schema.sql` script
4. Verify the tables and policies are created

### 2. Environment Variables
Ensure these are set in your environment:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Google OAuth Configuration
Update your Google OAuth scopes to include Calendar access:
```javascript
options={{
  scopes: 'email profile openid https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events'
}}
```

## Usage Examples

### Getting Current User
```javascript
import { useAuth } from '../contexts/AuthContext';

const { getUserData } = useAuth();
const currentUser = getUserData();
```

### Updating User Profile
```javascript
import { userService } from '../services/userService';

const updateProfile = async (userId, updates) => {
  const { success, user } = await userService.updateUserProfile(userId, {
    name: 'New Name',
    gpa: 3.8,
    major: 'Computer Science'
  });
  
  if (success) {
    console.log('Profile updated:', user);
  }
};
```

### Handling Authentication
```javascript
// The AuthContext automatically handles user management
// No additional code needed for basic authentication flow
```

## Data Flow

### Sign In Flow
1. User clicks "Sign in with Google"
2. Google OAuth redirects to Supabase
3. Supabase creates/updates auth session
4. `onAuthStateChange` triggers
5. `userService.handleAuthChange` executes
6. User profile created/updated in database
7. User data stored in localStorage
8. User redirected to dashboard/profile completion

### Sign Out Flow
1. User clicks "Sign out"
2. Supabase clears auth session
3. `onAuthStateChange` triggers with 'SIGNED_OUT'
4. `userService.handleAuthChange` clears localStorage
5. User redirected to login page

## Error Handling

### Database Errors
```javascript
const { success, error } = await userService.upsertUser(userData);
if (!success) {
  console.error('Database error:', error);
  // Handle error appropriately
}
```

### localStorage Errors
```javascript
const stored = userService.storeUserInLocalStorage(userData);
if (!stored) {
  console.error('Failed to store user in localStorage');
  // Handle error appropriately
}
```

## Best Practices

### 1. **Data Validation**
- Always validate user input before storing
- Use TypeScript for type safety
- Implement proper error handling

### 2. **Performance**
- Use localStorage for quick data access
- Implement proper caching strategies
- Optimize database queries with indexes

### 3. **Security**
- Never store sensitive data in localStorage
- Use Row Level Security policies
- Validate all user inputs

### 4. **User Experience**
- Provide loading states during operations
- Handle offline scenarios gracefully
- Show appropriate error messages

## Troubleshooting

### Common Issues

#### 1. User Profile Not Created
- Check Supabase RLS policies
- Verify database schema is correct
- Check console for error messages

#### 2. localStorage Not Working
- Check browser storage permissions
- Verify localStorage is available
- Handle storage quota exceeded

#### 3. Google OAuth Scopes
- Verify scopes are correctly configured
- Check Google Cloud Console settings
- Ensure Supabase OAuth is properly set up

## Testing

### Manual Testing
1. Test Google OAuth sign in
2. Verify user profile creation
3. Check localStorage data
4. Test profile updates
5. Verify sign out clears data

### Automated Testing
```javascript
// Example test for user service
describe('userService', () => {
  test('should create new user profile', async () => {
    const mockUser = {
      id: 'test-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    };
    
    const result = await userService.handleAuthChange('SIGNED_IN', { user: mockUser });
    expect(result).toBeDefined();
  });
});
```

## Next Steps

1. **Deploy the database schema** to Supabase
2. **Test the authentication flow** end-to-end
3. **Implement profile editing** functionality
4. **Add data validation** and error handling
5. **Monitor user data** and performance

The user management system provides a robust foundation for handling user authentication and profile data while maintaining security and performance! 🚀
