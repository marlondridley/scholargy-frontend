// LoginPage.js - The component for the user login screen.

import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'password' && username) {
      setError('');
      login(username);
    } else {
      setError('Invalid credentials. Please use any username and the password "password".');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
            <h1 className="text-4xl font-extrabold text-blue-600 mb-2">Scholargy</h1>
            <p className="text-gray-500 mb-8">Your Personal College & Career Advisor</p>
            <form onSubmit={handleLogin} className="space-y-6">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {error && <p className="text-red-500 text-sm text-left">{error}</p>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Secure Login
              </button>
              <p className="text-xs text-gray-400 pt-2">Hint: The password is `password`</p>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;