import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar   from './components/Sidebar';
import Landing   from './pages/Landing';
import Login     from './pages/Login';
import Dashboard from './pages/Dashboard';
import Agent     from './pages/Agent';
import Customers from './pages/Customers';
import Segments  from './pages/Segments';
import Campaigns from './pages/Campaigns';
import Ingest    from './pages/Ingest';
import './App.css';

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1 } } });

// Full-page loading spinner while session is being restored
function SessionLoader() {
  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      background: 'var(--bg)', color: 'var(--t2)', fontSize: 14
    }}>
      <div style={{
        width: 36, height: 36, border: '3px solid var(--bd)',
        borderTopColor: '#1e40af', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      Restoring session…
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Shell({ children }) {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);

  if (loading) return <SessionLoader />;
  if (!user)   return <Navigate to="/login" replace />;

  return (
    <div className="shell" data-theme={theme}>
      <Sidebar open={open} onOpen={() => setOpen(true)} onClose={() => setOpen(false)} />
      <main className="page">{children}</main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/login"     element={<LoginGuard />} />
      <Route path="/dashboard" element={<Shell><Dashboard /></Shell>} />
      <Route path="/agent"     element={<Shell><Agent /></Shell>} />
      <Route path="/ingest"    element={<Shell><Ingest /></Shell>} />
      <Route path="/customers" element={<Shell><Customers /></Shell>} />
      <Route path="/segments"  element={<Shell><Segments /></Shell>} />
      <Route path="/campaigns" element={<Shell><Campaigns /></Shell>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Redirect already-logged-in users away from /login
function LoginGuard() {
  const { user, loading } = useAuth();
  if (loading) return <SessionLoader />;
  if (user)    return <Navigate to="/dashboard" replace />;
  return <Login />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{ style: { fontSize: 13, borderRadius: 10 }, duration: 3000 }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}