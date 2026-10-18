import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { KnowledgeProvider } from './context/KnowledgeContext';
import { ToastProvider } from './components/common/Toast';
import AppLayout from './components/layout/AppLayout';

import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Recovery from './pages/Recovery';
import Favorites from './pages/Favorites';
import Categories from './pages/Categories';
import Settings from './pages/Settings';
import AuthPage from './pages/AuthPage';
import NotFound from './pages/NotFound';

/**
 * Route protection wrapper requiring authenticated user
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Loading EchoCloud...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <KnowledgeProvider>
            <Routes>
              {/* Public Auth Route */}
              <Route path="/login" element={<AuthPage />} />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="library" element={<Library />} />
                <Route path="recovery" element={<Recovery />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="categories" element={<Categories />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </KnowledgeProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
