# Post-Deployment OAuth Testing Guide

## 🚀 **After Deployment Testing Steps**

### **Step 1: Access the Testing Interface**

1. **Deploy your application** to Azure Static Web Apps
2. **Navigate to the testing page**: `https://your-app-url.azurestaticapps.net/test-oauth`
3. **Login** with your credentials to access the testing interface

### **Step 2: Automated Testing**

Use the **OAuth Flow Tester** component to run automated tests:

#### **Test Categories:**
- ✅ **Environment Variables** - Verify all required env vars are set
- ✅ **localStorage Support** - Test browser storage functionality
- ✅ **API Connectivity** - Verify backend API is accessible
- ✅ **OAuth Flow** - Test Google OAuth initiation
- ✅ **Profile Management** - Test user profile creation/management
- ✅ **Session Management** - Test authentication state

#### **How to Run Tests:**
1. Click **"Run All Tests"** button
2. Review the **Test Results** section
3. Check the **Test Logs** for detailed information
4. Address any failed tests before proceeding

### **Step 3: Manual Testing Checklist**

#### **🔐 Login Page Testing**
- [ ] **Page Load**: Login page loads correctly
- [ ] **Email Form**: Email/password form is functional
- [ ] **Google Button**: Google OAuth button appears and is clickable
- [ ] **Password Reset**: "Forgot password?" link works
- [ ] **Sign Up**: "Create account" link works

#### **🌐 OAuth Flow Testing**
- [ ] **Google Redirect**: Clicking Google button redirects to Google
- [ ] **Account Selection**: User can select their Google account
- [ ] **Permission Grant**: User can grant necessary permissions
- [ ] **Callback Return**: OAuth callback returns to your application
- [ ] **Session Creation**: User session is established after OAuth

#### **👤 Profile Management Testing**
- [ ] **Auto Creation**: User profile is created automatically
- [ ] **Data Display**: Profile data is displayed correctly
- [ ] **Completion Tracking**: Profile completion percentage is accurate
- [ ] **Data Persistence**: Profile data persists across sessions
- [ ] **CosmosDB Storage**: Data is stored in CosmosDB (verify in Azure portal)

#### **🔄 Session Management Testing**
- [ ] **Session Persistence**: Session persists on page refresh
- [ ] **Sign Out**: Sign out clears session and localStorage
- [ ] **Protected Routes**: Protected routes work properly
- [ ] **Auth State**: Authentication state updates correctly
- [ ] **Token Management**: OAuth tokens are handled securely

#### **⚠️ Error Handling Testing**
- [ ] **Invalid Credentials**: Error messages for wrong credentials
- [ ] **Network Errors**: Graceful handling of network failures
- [ ] **OAuth Errors**: Proper error display for OAuth failures
- [ ] **Backend Errors**: Error handling for backend API issues
- [ ] **Fallback Mechanisms**: App works when services are unavailable

### **Step 4: Browser Console Testing**

Open browser developer tools and check:

#### **Console Logs:**
```javascript
// Check for any errors
console.error('Any error messages?');

// Verify environment variables
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

// Check localStorage
console.log('User data:', localStorage.getItem('user'));

// Test OAuth flow manually
window.testDeployedFlow?.init();
```

#### **Network Tab:**
- [ ] **Supabase API calls** are successful
- [ ] **Backend API calls** return proper responses
- [ ] **Google OAuth requests** are made correctly
- [ ] **No CORS errors** in network requests

### **Step 5: CosmosDB Verification**

#### **Check Data Storage:**
1. **Go to Azure Portal**
2. **Navigate to your CosmosDB account**
3. **Open Data Explorer**
4. **Check the `users` container** for new user documents
5. **Check the `user_applications` container** for profile data

#### **Expected Data Structure:**
```json
// users container
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "provider": "google",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}

// user_applications container
{
  "id": "application-id",
  "userId": "user-id",
  "email": "user@example.com",
  "profile": {
    "personal": { ... },
    "academic": { ... },
    "extracurriculars": [ ... ]
  },
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### **Step 6: Performance Testing**

#### **Load Time Testing:**
- [ ] **Initial page load** < 3 seconds
- [ ] **OAuth redirect** < 2 seconds
- [ ] **Profile loading** < 1 second
- [ ] **API responses** < 500ms

#### **Memory Usage:**
- [ ] **No memory leaks** during OAuth flow
- [ ] **localStorage cleanup** on sign out
- [ ] **Event listener cleanup** in components

### **Step 7: Security Testing**

#### **Token Security:**
- [ ] **OAuth tokens** are not exposed in localStorage
- [ ] **API tokens** are sent securely
- [ ] **Session tokens** are handled properly
- [ ] **No sensitive data** in browser console

#### **Data Protection:**
- [ ] **User data** is encrypted in transit
- [ ] **Profile data** is stored securely in CosmosDB
- [ ] **Authentication state** is properly managed

### **Step 8: Cross-Browser Testing**

Test in multiple browsers:
- [ ] **Chrome** (latest version)
- [ ] **Firefox** (latest version)
- [ ] **Safari** (latest version)
- [ ] **Edge** (latest version)

### **Step 9: Mobile Testing**

Test on mobile devices:
- [ ] **iOS Safari** - OAuth flow works
- [ ] **Android Chrome** - OAuth flow works
- [ ] **Responsive design** - UI adapts properly
- [ ] **Touch interactions** - Buttons are tappable

## 🚨 **Troubleshooting Common Issues**

### **OAuth Not Working:**
1. **Check Google OAuth configuration** in Google Cloud Console
2. **Verify redirect URIs** are correct
3. **Check environment variables** are set
4. **Review browser console** for errors

### **Profile Not Creating:**
1. **Verify backend API** is running and accessible
2. **Check CosmosDB connection** string
3. **Review backend logs** for errors
4. **Test API endpoints** manually

### **Session Issues:**
1. **Check localStorage** support in browser
2. **Verify Supabase configuration**
3. **Review authentication state** management
4. **Check for CORS issues**

### **Performance Issues:**
1. **Monitor API response times**
2. **Check CosmosDB throughput**
3. **Review frontend bundle size**
4. **Optimize database queries**

## 📊 **Monitoring After Deployment**

### **Key Metrics to Track:**
- **Authentication Success Rate** > 95%
- **OAuth Completion Rate** > 90%
- **Profile Creation Rate** > 95%
- **API Response Time** < 500ms
- **Error Rate** < 1%

### **Alerts to Set Up:**
- **Authentication failures** > 5% in 5 minutes
- **API downtime** > 1 minute
- **Database errors** > 10 in 5 minutes
- **OAuth errors** > 3 in 5 minutes

## ✅ **Success Criteria**

Your OAuth system is working correctly when:

1. **✅ All automated tests pass**
2. **✅ Manual testing checklist is complete**
3. **✅ No errors in browser console**
4. **✅ Data is stored in CosmosDB**
5. **✅ Performance metrics are acceptable**
6. **✅ Security requirements are met**
7. **✅ Cross-browser compatibility verified**
8. **✅ Mobile responsiveness confirmed**

## 🎉 **Ready for Production**

Once all tests pass:

1. **Remove the testing route** from App.js
2. **Clean up test data** from CosmosDB
3. **Monitor the system** for 24-48 hours
4. **Gather user feedback**
5. **Document any issues** for future improvements

---

**🎯 Remember**: Testing is an ongoing process. Continue monitoring your OAuth system after deployment and address any issues that arise.
