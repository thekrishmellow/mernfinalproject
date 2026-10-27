import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './state/AuthContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';

// Auth Pages
import { LoginPage, RegisterPage } from './pages/auth/LoginPage.jsx';
import { AcceptInvitationPage, ForgotPasswordPage } from './pages/auth/AcceptInvitationPage.jsx';
import { MagicLoginPage } from './pages/auth/MagicLoginPage.jsx';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.jsx';
import { RoadmapsListPage } from './pages/admin/RoadmapsListPage.jsx';
import { RoadmapBuilderPage } from './pages/admin/RoadmapBuilderPage.jsx';
import { AssignmentsPage } from './pages/admin/AssignmentsPage.jsx';
import { QuizzesPage } from './pages/admin/QuizzesPage.jsx';
import { ResourcesPage } from './pages/admin/ResourcesPage.jsx'; 
import { AnalyticsPage } from './pages/admin/AnalyticsPage.jsx';

// Client Pages
import { ClientDashboardPage } from './pages/client/ClientDashboardPage.jsx';
import { ClientRoadmapViewPage } from './pages/client/ClientRoadmapViewPage.jsx';
import { ClientNodeWorkspacePage } from './pages/client/ClientNodeWorkspacePage.jsx';

// Landing Page
import { LandingPage } from './pages/LandingPage.jsx';

function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-950 text-slate-400" role="status" aria-live="polite">
        <div className="size-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" aria-hidden="true" />
        <span>Authenticating session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If admin visits client route, allow them to preview/test client learning experience
    if (user.role === 'admin') return children;
    // If client visits admin route, send to client dashboard
    if (user.role === 'client' && requiredRole === 'admin') return <Navigate to="/client/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-950 text-slate-400" role="status" aria-live="polite">
        <div className="size-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" aria-hidden="true" />
        <span>Loading Pathfinder...</span>
      </div>
    );
  }

  if (!user) return <LandingPage />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/client/dashboard" replace />;
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/magic-login" element={<MagicLoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/accept-invitation" element={<AcceptInvitationPage />} />

              {/* Root Landing Redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Admin Studio Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="roadmaps" element={<RoadmapsListPage />} />
                <Route path="roadmaps/:roadmapId/builder" element={<RoadmapBuilderPage />} />
                <Route path="assignments" element={<AssignmentsPage />} />
                <Route path="quizzes" element={<QuizzesPage />} />
                <Route path="resources" element={<ResourcesPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>

              {/* Client Learner Protected Routes */}
              <Route
                path="/client"
                element={
                  <ProtectedRoute requiredRole="client">
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<ClientDashboardPage />} />
                <Route path="assignments/:assignmentId/roadmap" element={<ClientRoadmapViewPage />} />
                <Route path="assignments/:assignmentId/nodes/:nodeId" element={<ClientNodeWorkspacePage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
