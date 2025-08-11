// frontend/src/pages/AuthCallback.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const AuthCallback = ({ setView }) => {
  const { user, isProfileComplete, loading } = useAuth();
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If AuthContext is still loading, do nothing yet
    if (loading) return;

    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get("error");

    if (authError) {
      setError(`Authentication error: ${authError}`);
      setAuthLoading(false);
      return;
    }

    if (user) {
      // Authenticated → decide destination
      if (isProfileComplete) {
        setView("dashboard");
      } else {
        setView("studentProfile");
      }
    } else {
      // No user → failed authentication
      setError("Authentication failed. Please try again.");
      setAuthLoading(false);
    }
  }, [loading, user, isProfileComplete, setView]);

  if (authLoading && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Completing Authentication...
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we finish setting up your account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-32 w-32 text-red-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M5.062 19h13.876c1.54 0 2.502-1.667 1.732-2.5L13.732 4a1.998 1.998 0 00-2.732 0L3.33 16.5C2.56 17.333 3.522 19 5.062 19z"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Authentication Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
            <div className="mt-6">
              <button
                onClick={() => setView("login")}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 text-green-600">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authentication Successful!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
