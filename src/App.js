import React, { useState, useMemo, useEffect } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ReportPage from './pages/ReportPage';
import StudentProfilePage from './pages/StudentProfilePage';
import StudentVuePage from './pages/StudentVuePage';
import ScholarshipPage from './pages/ScholarshipPage';
import CompareCollegesPage from './pages/CompareCollegesPage';
import { AuthContext } from './contexts/AuthContext';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);
  
  // Centralized state for the student's profile
  const [studentProfile, setStudentProfile] = useState(null);

  // Load saved profile from localStorage on initial app load
  useEffect(() => {
      const savedProfile = localStorage.getItem('studentProfile');
      if (savedProfile) {
          setStudentProfile(JSON.parse(savedProfile));
      }
  }, []);

  const authContextValue = useMemo(() => ({
    user,
    login: (username) => setUser({ name: username }),
    logout: () => {
      setUser(null);
      setView('dashboard');
    },
  }), [user]);

  const handleSelectCollege = (unitId) => {
    setSelectedCollegeId(unitId);
    setView('profile');
  };

  const handleGenerateReport = () => {
    setView('report');
  };

  const renderView = () => {
    switch (view) {
      case 'profile':
        return <ProfilePage collegeId={selectedCollegeId} onBack={() => setView('dashboard')} onGenerateReport={handleGenerateReport} studentProfile={studentProfile} />;
      case 'report':
        return <ReportPage collegeId={selectedCollegeId} onBack={() => setView('profile')} studentProfile={studentProfile} />;
      case 'studentProfile':
        return <StudentProfilePage studentProfile={studentProfile} setStudentProfile={setStudentProfile} />;
      case 'studentVue':
        return <StudentVuePage />;
      case 'scholarships':
        return <ScholarshipPage studentProfile={studentProfile} setView={setView} />;
      case 'compare':
        return <CompareCollegesPage setView={setView} studentProfile={studentProfile} />;
      case 'dashboard':
      default:
        return <DashboardPage onSelectCollege={handleSelectCollege} setView={setView} studentProfile={studentProfile} />;
    }
  };

  if (!user) {
    return (
        <AuthContext.Provider value={authContextValue}>
            <LoginPage />
        </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
        <Layout activeView={view} setView={setView}>
            {renderView()}
        </Layout>
    </AuthContext.Provider>
  );
}

export default App;
