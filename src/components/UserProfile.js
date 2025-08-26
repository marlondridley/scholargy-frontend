// src/components/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const { getUserData } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = () => {
      const data = getUserData();
      setUserData(data);
      setLoading(false);
    };

    loadUserData();
  }, [getUserData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No user data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4 mb-6">
        {userData.img_url ? (
          <img
            src={userData.img_url}
            alt={userData.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {userData.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
          <p className="text-gray-600">{userData.email}</p>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {userData.provider_display || userData.provider}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Profile Information</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="text-sm text-gray-900">{userData.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="text-sm text-gray-900">{userData.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Provider</dt>
              <dd className="text-sm text-gray-900">
                {userData.provider_display || userData.provider}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Member Since</dt>
              <dd className="text-sm text-gray-900">
                {userData.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
          </dl>
        </div>

        {userData.provider === 'google' && (
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Google Account</h3>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-gray-600">Connected to Google</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              You can access Google Calendar and other services
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Account Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              Edit Profile
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
              Change Password
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
