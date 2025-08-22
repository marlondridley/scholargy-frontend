// src/pages/ResetPasswordPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ResetPasswordPage = () => {
  const { resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        throw error;
      }
      setMessage('Password reset link has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <h1 className="text-3xl font-extrabold text-blue-600 mb-2">Reset Password</h1>
            <p className="text-gray-500 mb-8">Enter your email to receive a reset link.</p>
            
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {error && <p className="text-red-500 text-sm text-left">{error}</p>}
              {message && <p className="text-green-500 text-sm text-left">{message}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-sm">
              <button onClick={() => navigate("/login")} className="font-medium text-blue-600 hover:text-blue-500">
                Back to Login
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
