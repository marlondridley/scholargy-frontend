// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentProfilePage from './pages/StudentProfilePage';
import ScholarshipPage from './pages/ScholarshipPage';
import MatchingPage from './pages/MatchingPage';
import CareerForecasterPage from './pages/CareerForecasterPage';
import AuthCallback from './pages/AuthCallback';
import ReportPage from './pages/ReportPage';
import StudentVuePage from './pages/StudentVuePage';
import CompareCollegesPage from './pages/CompareCollegesPage';
// Using your original ProfilePage for college details
import ProfilePage from './pages/ProfilePage'; 
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Main />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

const Main = () => {
  const { user, isProfileComplete, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Routes for unauthenticated users
  if (!user) {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }
  
  // Route for users who need to complete their profile
  if (!isProfileComplete) {
    return (
      <Layout>
        <Routes>
          <Route path="/student-profile" element={<StudentProfilePage />} />
          <Route path="*" element={<Navigate to="/student-profile" replace />} />
        </Routes>
      </Layout>
    );
  }

  // Main application routes for authenticated users
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/student-profile" element={<StudentProfilePage />} />
        <Route path="/scholarships" element={<ScholarshipPage />} />
        <Route path="/matching" element={<MatchingPage />} />
        <Route path="/forecaster" element={<CareerForecasterPage />} />
        <Route path="/compare" element={<CompareCollegesPage />} />
        <Route path="/studentvue" element={<StudentVuePage />} />
        <Route path="/report/:collegeId" element={<ReportPage />} />
        {/* Restored the original route to use ProfilePage for college details */}
        <Route path="/profile/:collegeId" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
};

export default App;