// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { handleSignInWithGoogle as handleGoogleIdToken } from '../utils/googleAuth';

const EyeIcon = ({ closed }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
    {closed ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    )}
  </svg>
);

const LoginPage = () => {
  const { signIn, signUp, signInWithGoogle, signInWithOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [authMode, setAuthMode] = useState('signin');
  const [showPassword, setShowPassword] = useState(false);
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateInputs = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (authMode !== 'otp' && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (authMode !== 'otp' && !validateInputs()) {
        return;
    }

    setLoading(true);
    try {
      let authResponse;
      if (authMode === 'signup') {
        authResponse = await signUp({ email, password });
        if (authResponse.error) throw authResponse.error;
        setMessage('Check your email for a confirmation link to complete registration.');
      } else if (authMode === 'signin') {
        authResponse = await signIn({ email, password });
        if (authResponse.error) throw authResponse.error;
      } else if (authMode === 'otp') {
        if (!token) {
          authResponse = await signInWithOtp(email);
          if (authResponse.error) throw authResponse.error;
          setMessage('A one-time code has been sent to your email.');
        } else {
          authResponse = await verifyOtp(email, token);
          if (authResponse.error) throw authResponse.error;
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Set up Google Sign-In callback in global scope
  useEffect(() => {
    window.handleSignInWithGoogle = async (response) => {
      setError('');
      setLoading(true);
      try {
        const { data, error } = await handleGoogleIdToken(response);
        if (error) throw error;
        
        // Success - AuthCallback will handle the redirect
        console.log('Google sign-in successful');
      } catch (err) {
        setError(err.message || 'Failed to sign in with Google.');
        setLoading(false);
      }
    };

    return () => {
      delete window.handleSignInWithGoogle;
    };
  }, []);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const { data, error } = await signInWithGoogle();
      if (error) throw error;
      
      // If we get a URL back, redirect to it (for server-side flow)
      if (data?.url) {
        window.location.href = data.url;
      }
      // For browser-based flow, Supabase will handle the redirect automatically
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <h1 className="text-4xl font-extrabold text-blue-600 mb-2">Scholargy</h1>
            <p className="text-gray-500 mb-8">
              {authMode === 'signin' && 'Sign in to your account'}
              {authMode === 'signup' && 'Create your account'}
              {authMode === 'otp' && 'Sign in with a one-time code'}
            </p>
            
            {/* Google Pre-built Sign-In Button */}
            <div
              id="g_id_onload"
              data-client_id={process.env.REACT_APP_GOOGLE_CLIENT_ID}
              data-context="signin"
              data-ux_mode="popup"
              data-callback="handleSignInWithGoogle"
              data-auto_select="true"
              data-itp_support="true"
              data-use_fedcm_for_prompt="true"
            ></div>
            <div
              className="g_id_signin w-full"
              data-type="standard"
              data-shape="rectangular"
              data-theme="outline"
              data-text="signin_with"
              data-size="large"
              data-logo_alignment="left"
            ></div>

            {/* Fallback Custom Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center disabled:opacity-50 mt-2"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
                <path fill="#34A853" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"></path>
                <path fill="#FBBC05" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
                <path fill="#EA4335" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C42.012 35.245 44 30.035 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
              </svg>
              Sign in with Google (Fallback)
            </button>

            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={authMode === 'otp' && !!message}
              />
              {authMode === 'otp' && message && (
                <input
                  type="text"
                  placeholder="One-time code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full p-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              )}
              {authMode !== 'otp' && (
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center">
                    <EyeIcon closed={!showPassword} />
                  </button>
                </div>
              )}
              {error && <p className="text-red-500 text-sm text-left">{error}</p>}
              {message && <p className="text-green-500 text-sm text-left">{message}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 
                 authMode === 'signin' ? 'Sign In' :
                 authMode === 'signup' ? 'Sign Up' :
                 !token ? 'Send Code' : 'Verify & Sign In'}
              </button>
            </form>
            
            <div className="mt-6 text-sm flex justify-between">
              <button onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setMessage(''); setError(''); }} className="font-medium text-blue-600 hover:text-blue-500">
                {authMode === 'signup' ? 'Have an account? Sign In' : "Don't have an account?"}
              </button>
              <button onClick={() => { setAuthMode(authMode === 'otp' ? 'signin' : 'otp'); setMessage(''); setError(''); }} className="font-medium text-blue-600 hover:text-blue-500">
                {authMode === 'otp' ? 'Use Password' : 'Use one-time code'}
              </button>
            </div>
             <div className="mt-4 text-sm">
                <button onClick={() => navigate('/reset-password')} className="font-medium text-gray-500 hover:text-gray-700">
                    Forgot your password?
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
