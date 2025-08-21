import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AuthCallback = () => {
  const { user, isProfileComplete, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loading) return; // Wait until the auth context has loaded the user state

    const urlParams = new URLSearchParams(window.location.hash.substring(1)); // OAuth data is in the hash
    const authError = urlParams.get("error");
    const errorDescription = urlParams.get("error_description");

    if (authError) {
      setError(`Authentication error: ${errorDescription || authError}`);
      return;
    }

    if (user) {
      // User object is available, now redirect
      if (isProfileComplete) {
        navigate("/dashboard");
      } else {
        navigate("/student-profile");
      }
    } else if (!loading) {
      // If still no user after loading, then something failed
      setError("Authentication failed. Please try logging in again.");
    }
  }, [loading, user, isProfileComplete, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center p-8">
          <h2 className="text-2xl font-bold text-red-600">Authentication Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Completing Authentication...
          </h2>
      </div>
    </div>
  );
};

export default AuthCallback; 