import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FirebaseProvider, useFirebase } from './FirebaseProvider';
import { ThemeProvider } from './contexts/ThemeContext';
import { Loader2 } from 'lucide-react';

// Components
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CoachChat from './components/CoachChat';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import GoalsPage from './components/GoalsPage';
import Toolbox from './components/Toolbox';
import SavedSessions from './components/SavedSessions';

function AppRoutes() {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-paper">
        <Loader2 className="w-10 h-10 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/coach" element={<CoachChat />} />
        <Route path="/toolbox" element={<Toolbox />} />
        <Route path="/archive" element={<SavedSessions />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </ThemeProvider>
    </FirebaseProvider>
  );
}
