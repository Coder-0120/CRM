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

const qc = new QueryClient({ defaultOptions:{ queries:{ retry:1 } } });

function Shell({ children }) {
  const { user }  = useAuth();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="shell" data-theme={theme}>
      <button className="ham" onClick={()=>setOpen(true)} aria-label="Menu">
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
        </svg>
      </button>
      <Sidebar open={open} onClose={()=>setOpen(false)} />
      <main className="page">{children}</main>
    </div>
  );
}

function Routes_() {
  return (
    <Routes>
      <Route path="/"          element={<Landing />} />
      <Route path="/login"     element={<Login />} />
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

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes_ />
            <Toaster position="top-right" toastOptions={{style:{fontSize:13,borderRadius:10},duration:3000}} />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}