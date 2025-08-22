// src/utils/googleAuth.js
import { supabase } from './supabase';

// Generate a secure nonce for OAuth security
export const generateNonce = () => {
  const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  return nonce;
};

// Hash the nonce for Google OAuth
export const hashNonce = async (nonce) => {
  const encoder = new TextEncoder();
  const encodedNonce = encoder.encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashedNonce;
};

// Handle Google Sign-In with ID Token (recommended approach)
export const handleSignInWithGoogle = async (response) => {
  try {
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: response.credential,
    });

    if (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Google sign-in failed:', error);
    return { data: null, error };
  }
};

// Handle Google Sign-In with OAuth (fallback approach)
export const handleSignInWithOAuth = async (nonce = null) => {
  try {
    const options = {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
        scope: 'email profile openid'
      }
    };

    if (nonce) {
      options.queryParams.nonce = nonce;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options
    });

    if (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Google OAuth failed:', error);
    return { data: null, error };
  }
};

// Extract and store Google tokens from session
export const extractGoogleTokens = (session) => {
  if (session?.provider_token) {
    // Store Google access token securely
    localStorage.setItem('google_access_token', session.provider_token);
    
    if (session.provider_refresh_token) {
      // Store Google refresh token securely
      localStorage.setItem('google_refresh_token', session.provider_refresh_token);
    }
    
    return {
      accessToken: session.provider_token,
      refreshToken: session.provider_refresh_token
    };
  }
  return null;
};

// Get stored Google tokens
export const getGoogleTokens = () => {
  const accessToken = localStorage.getItem('google_access_token');
  const refreshToken = localStorage.getItem('google_refresh_token');
  
  return {
    accessToken,
    refreshToken
  };
};

// Clear stored Google tokens
export const clearGoogleTokens = () => {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_refresh_token');
};
