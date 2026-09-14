import React from 'react';
import { AuthProvider, useAuth, ROLES } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './pages/StudentDashboard';
import { WardenDashboard } from './pages/WardenDashboard';
import { GuardScannerPage } from './pages/GuardScannerPage';
import { AdminAnalytics } from './pages/AdminAnalytics';

function MainApp() {
  const { currentRole, ROLES } = useAuth();

  return (
    <div className="min-h-screen pb-12">
      <Navbar />
      <main>
        {currentRole === ROLES.STUDENT && <StudentDashboard />}
        {currentRole === ROLES.WARDEN && <WardenDashboard />}
        {currentRole === ROLES.GUARD && <GuardScannerPage />}
        {currentRole === ROLES.ADMIN && <AdminAnalytics />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
