// Environment Configuration Script
// This script will be injected into the HTML to make environment variables available in the browser

(function() {
  'use strict';
  
  // Create a global object to hold environment variables
  window.__ENV__ = {
    REACT_APP_SUPABASE_URL: '',
    REACT_APP_SUPABASE_ANON_KEY: '',
    REACT_APP_API_URL: '',
    REACT_APP_GOOGLE_CLIENT_ID: ''
  };
  
  // Replace placeholder values with actual environment variables
  Object.keys(window.__ENV__).forEach(key => {
    const value = window.__ENV__[key];
    if (value.startsWith('%') && value.endsWith('%')) {
      // This is a placeholder, remove it
      delete window.__ENV__[key];
    }
  });
  
  console.log('🔧 Environment Configuration Loaded');
  console.log('Available variables:', Object.keys(window.__ENV__));
})();
