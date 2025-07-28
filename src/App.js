import React, { useState, useMemo } from 'react';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ReportPage from './pages/ReportPage';
import StudentProfilePage from './pages/StudentProfilePage';
import StudentVuePage from './pages/StudentVuePage';
import { AuthContext } from './contexts/AuthContext';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');
  const [selectedCollegeId, setSelectedCollegeId] = useState(null);

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
        return <ProfilePage collegeId={selectedCollegeId} onBack={() => setView('dashboard')} onGenerateReport={handleGenerateReport} />;
      case 'report':
        return <ReportPage collegeId={selectedCollegeId} onBack={() => setView('profile')} />;
      case 'studentProfile':
        return <StudentProfilePage />;
      case 'studentVue':
        return <StudentVuePage />;
      case 'dashboard':
      default:
        return <DashboardPage onSelectCollege={handleSelectCollege} setView={setView} />;
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
