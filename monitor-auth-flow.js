// Authentication Flow Monitor
// Monitor and track OAuth authentication flow in production

const monitorAuthFlow = {
    // Track authentication events
    events: [],
    
    // Initialize monitoring
    init() {
        console.log('🔍 Initializing Authentication Flow Monitor...');
        
        // Monitor localStorage changes
        this.monitorLocalStorage();
        
        // Monitor network requests
        this.monitorNetworkRequests();
        
        // Monitor authentication state changes
        this.monitorAuthStateChanges();
        
        console.log('✅ Authentication Flow Monitor initialized');
    },
    
    // Monitor localStorage for user data changes
    monitorLocalStorage() {
        const originalSetItem = localStorage.setItem;
        const originalRemoveItem = localStorage.removeItem;
        
        localStorage.setItem = (key, value) => {
            if (key === 'user') {
                this.logEvent('localStorage', 'user_data_stored', {
                    timestamp: new Date().toISOString(),
                    hasData: !!value
                });
            }
            originalSetItem.call(localStorage, key, value);
        };
        
        localStorage.removeItem = (key) => {
            if (key === 'user') {
                this.logEvent('localStorage', 'user_data_cleared', {
                    timestamp: new Date().toISOString()
                });
            }
            originalRemoveItem.call(localStorage, key);
        };
    },
    
    // Monitor network requests to backend API
    monitorNetworkRequests() {
        const originalFetch = window.fetch;
        
        window.fetch = async (...args) => {
            const [url, options] = args;
            const startTime = Date.now();
            
            try {
                const response = await originalFetch(...args);
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                // Monitor API calls to backend
                if (url.includes(process.env.REACT_APP_API_URL)) {
                    this.logEvent('api', 'request_completed', {
                        url: url,
                        method: options?.method || 'GET',
                        status: response.status,
                        duration: duration,
                        timestamp: new Date().toISOString()
                    });
                }
                
                return response;
            } catch (error) {
                this.logEvent('api', 'request_failed', {
                    url: url,
                    method: options?.method || 'GET',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                throw error;
            }
        };
    },
    
    // Monitor authentication state changes
    monitorAuthStateChanges() {
        // This will be called from AuthContext
        this.logEvent('auth', 'monitor_initialized', {
            timestamp: new Date().toISOString()
        });
    },
    
    // Log authentication events
    logEvent(category, action, data = {}) {
        const event = {
            id: this.generateEventId(),
            category,
            action,
            data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.events.push(event);
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🔍 [${category.toUpperCase()}] ${action}:`, data);
        }
        
        // Send to analytics service in production
        if (process.env.NODE_ENV === 'production') {
            this.sendToAnalytics(event);
        }
        
        // Keep only last 100 events in memory
        if (this.events.length > 100) {
            this.events = this.events.slice(-100);
        }
    },
    
    // Generate unique event ID
    generateEventId() {
        return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Send event to analytics service
    async sendToAnalytics(event) {
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/analytics/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.error('Failed to send analytics event:', error);
        }
    },
    
    // Track OAuth flow steps
    trackOAuthStep(step, data = {}) {
        this.logEvent('oauth', step, {
            ...data,
            step: step
        });
    },
    
    // Track user profile operations
    trackProfileOperation(operation, data = {}) {
        this.logEvent('profile', operation, {
            ...data,
            operation: operation
        });
    },
    
    // Track errors
    trackError(error, context = {}) {
        this.logEvent('error', 'auth_error', {
            error: error.message,
            stack: error.stack,
            context: context
        });
    },
    
    // Get authentication flow summary
    getFlowSummary() {
        const summary = {
            totalEvents: this.events.length,
            categories: {},
            recentEvents: this.events.slice(-10),
            errors: this.events.filter(e => e.category === 'error'),
            oauthSteps: this.events.filter(e => e.category === 'oauth'),
            profileOperations: this.events.filter(e => e.category === 'profile')
        };
        
        // Count events by category
        this.events.forEach(event => {
            summary.categories[event.category] = (summary.categories[event.category] || 0) + 1;
        });
        
        return summary;
    },
    
    // Export events for debugging
    exportEvents() {
        return {
            events: this.events,
            summary: this.getFlowSummary(),
            exportTime: new Date().toISOString()
        };
    },
    
    // Clear events
    clearEvents() {
        this.events = [];
        console.log('🗑️ Authentication events cleared');
    }
};

// Integration with AuthContext
const enhanceAuthContext = (authContext) => {
    // Track sign in events
    const originalSignIn = authContext.signIn;
    authContext.signIn = async (data) => {
        monitorAuthFlow.trackOAuthStep('sign_in_attempted', { method: 'email' });
        try {
            const result = await originalSignIn(data);
            monitorAuthFlow.trackOAuthStep('sign_in_successful', { method: 'email' });
            return result;
        } catch (error) {
            monitorAuthFlow.trackError(error, { method: 'email', step: 'sign_in' });
            throw error;
        }
    };
    
    // Track Google sign in events
    const originalSignInWithGoogle = authContext.signInWithGoogle;
    authContext.signInWithGoogle = async () => {
        monitorAuthFlow.trackOAuthStep('google_sign_in_attempted');
        try {
            const result = await originalSignInWithGoogle();
            monitorAuthFlow.trackOAuthStep('google_sign_in_successful');
            return result;
        } catch (error) {
            monitorAuthFlow.trackError(error, { method: 'google', step: 'sign_in' });
            throw error;
        }
    };
    
    // Track sign out events
    const originalSignOut = authContext.signOut;
    authContext.signOut = async () => {
        monitorAuthFlow.trackOAuthStep('sign_out_attempted');
        try {
            const result = await originalSignOut();
            monitorAuthFlow.trackOAuthStep('sign_out_successful');
            return result;
        } catch (error) {
            monitorAuthFlow.trackError(error, { step: 'sign_out' });
            throw error;
        }
    };
    
    return authContext;
};

// Integration with UserProfileManager
const enhanceUserProfileManager = (UserProfileManager) => {
    // Track profile operations
    const originalGetUserProfile = UserProfileManager.getUserProfile;
    UserProfileManager.getUserProfile = async (userId) => {
        monitorAuthFlow.trackProfileOperation('get_profile_attempted', { userId });
        try {
            const result = await originalGetUserProfile(userId);
            monitorAuthFlow.trackProfileOperation('get_profile_successful', { 
                userId, 
                hasProfile: !!result 
            });
            return result;
        } catch (error) {
            monitorAuthFlow.trackError(error, { userId, operation: 'get_profile' });
            throw error;
        }
    };
    
    const originalCreateOrUpdateProfile = UserProfileManager.createOrUpdateProfile;
    UserProfileManager.createOrUpdateProfile = async (userId, profileData) => {
        monitorAuthFlow.trackProfileOperation('update_profile_attempted', { userId });
        try {
            const result = await originalCreateOrUpdateProfile(userId, profileData);
            monitorAuthFlow.trackProfileOperation('update_profile_successful', { 
                userId, 
                profileSections: Object.keys(profileData.profile || {})
            });
            return result;
        } catch (error) {
            monitorAuthFlow.trackError(error, { userId, operation: 'update_profile' });
            throw error;
        }
    };
    
    return UserProfileManager;
};

// Performance monitoring
const performanceMonitor = {
    // Track page load performance
    trackPageLoad() {
        if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            monitorAuthFlow.logEvent('performance', 'page_load', {
                loadTime: loadTime,
                domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
                firstPaint: timing.responseEnd - timing.navigationStart
            });
        }
    },
    
    // Track API response times
    trackApiPerformance(url, duration, status) {
        monitorAuthFlow.logEvent('performance', 'api_response', {
            url: url,
            duration: duration,
            status: status
        });
    }
};

// Export monitoring utilities
module.exports = {
    monitorAuthFlow,
    enhanceAuthContext,
    enhanceUserProfileManager,
    performanceMonitor
};

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
    monitorAuthFlow.init();
    performanceMonitor.trackPageLoad();
    
    // Make monitor available globally for debugging
    window.authMonitor = monitorAuthFlow;
    window.authPerformance = performanceMonitor;
}
