// src/pages/LoginPageV2.js
import React from 'react';
import SupabaseAuth from '../components/SupabaseAuth';
import { useAuth } from '../contexts/AuthContext';

const LoginPageV2 = () => {
  const { setUser } = useAuth();

  const handleAuthSuccess = (session) => {
    if (session?.user) {
      setUser(session.user);
      // The AuthCallback component will handle the redirect logic
      console.log('Authentication successful:', session.user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2">Scholargy</h1>
          <p className="text-gray-500 mb-8">
            Your Personal College & Career Advisor
          </p>
          
          <SupabaseAuth onAuthSuccess={handleAuthSuccess} />
          
          <div className="mt-6 text-sm text-gray-500">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPageV2;
