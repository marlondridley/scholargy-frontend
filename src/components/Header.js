// Header.js - The main header bar for the application.

import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex justify-end items-center">
        {user && (
          <div className="flex items-center">
            <span className="text-gray-600 mr-4">Welcome, {user.name}</span>
            <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
