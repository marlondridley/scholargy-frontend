// frontend/src/App.js

// Import React and necessary hooks (useState, useEffect)
import React, { useState, useEffect } from 'react';
// Import the authentication context to manage user state
import { AuthProvider, useAuth } from './contexts/AuthContext';
// Import layout components
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
// Import all the different page components
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
import ProfilePage from './pages/ProfilePage';

/**
 * The root component of the application.
 * It wraps the entire app in an ErrorBoundary and the AuthProvider.
 */
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Main />
      </AuthProvider>
    </ErrorBoundary>
  );
}

/**
 * The Main component handles the primary application logic,
 * including routing and conditional rendering based on user authentication and profile status.
 */
const Main = () => {
  // Destructure state and functions from the authentication context
  const { user, profile, setProfile, isProfileComplete, loading } = useAuth();
  // State to manage the current view (acting as a simple router)
  const [view, setView] = useState('dashboard');
  // State to store the ID of a selected college for detailed views
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);

  /**
   * This useEffect hook handles routing based on the URL path when the app first loads.
   * This allows users to navigate directly to a specific page via its URL.
   */
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/auth/callback') {
      setView('authCallback');
      return;
    }
    
    if (path === '/dashboard') setView('dashboard');
    else if (path === '/scholarships') setView('scholarships');
    else if (path === '/matching') setView('matching');
    else if (path === '/forecaster') setView('forecaster');
    else if (path === '/compare') setView('compare');
    else if (path === '/studentvue') setView('studentVue');
    else if (path === '/profile') setView('profile');
    else if (path === '/report') setView('report');
  }, []); // The empty dependency array means this runs only once on mount.

  /**
   * This useEffect hook updates the profile in the AuthContext
   * whenever the user object changes (e.g., after login).
   */
  useEffect(() => {
    if (user && user.profile) {
      setProfile(user.profile);
    }
  }, [user, setProfile]); // Depends on the user and setProfile function.

  // Function to handle selecting a college and switching to the profile view.
  const handleSelectCollege = (unitId) => {
    setSelectedCollegeId(unitId);
    setView('profile');
  };

  // Function to switch to the report generation view.
  const handleGenerateReport = () => {
    setView('report');
  };

  // While the authentication context is loading, display a simple loading message.
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If the current view is 'authCallback', render the AuthCallback component to handle the redirect.
  if (view === 'authCallback') {
    return <AuthCallback setView={setView} />;
  }

  // If there is no user authenticated, always show the LoginPage.
  if (!user) {
    return <LoginPage />;
  }
  
  // If the user is logged in but hasn't completed their profile, force them to the profile page.
  if (!isProfileComplete && view !== 'studentProfile') {
    return (
      <Layout activeView="studentProfile" setView={setView}>
        <StudentProfilePage />
      </Layout>
    );
  }

  /**
   * This function determines which page component to render based on the current 'view' state.
   * It acts as a client-side router.
   */
  const renderView = () => {
    switch (view) {
      case 'studentProfile': 
        return <StudentProfilePage />;
      case 'scholarships': 
        return <ScholarshipPage studentProfile={profile} setView={setView} />;
      case 'matching': 
        return <MatchingPage />;
      case 'forecaster': 
        return <CareerForecasterPage studentProfile={profile} />;
      case 'compare': 
        return <CompareCollegesPage studentProfile={profile} setView={setView} />;
      case 'studentVue': 
        return <StudentVuePage />;
      case 'report': 
        return <ReportPage collegeId={selectedCollegeId} onBack={() => setView('profile')} />;
      case 'profile': 
        return <ProfilePage collegeId={selectedCollegeId} onBack={() => setView('dashboard')} onGenerateReport={handleGenerateReport} />;
      default: 
        return <DashboardPage setView={setView} onSelectCollege={handleSelectCollege} studentProfile={profile} />;
    }
  };

  // Render the main application layout, passing in the current view and the function to change it.
  // The currently active page component is rendered as a child of the Layout.
  return (
    <Layout activeView={view} setView={setView}>
      {renderView()}
    </Layout>
  );
};

// Export the App component as the default export of this file.
export default App;