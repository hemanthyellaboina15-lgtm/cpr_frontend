import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AboutPage } from './pages/public/AboutPage';
import { TrackComplaintPage } from './pages/public/TrackComplaintPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitComplaintPage } from './pages/student/SubmitComplaintPage';
import { MyComplaintsPage } from './pages/student/MyComplaintsPage';
import { ComplaintDetailsPage } from './pages/student/ComplaintDetailsPage';
import { NotificationsPage } from './pages/student/NotificationsPage';
import { ProfilePage } from './pages/student/ProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllComplaintsPage } from './pages/admin/AllComplaintsPage';
import { DepartmentManagementPage } from './pages/admin/DepartmentManagementPage';
import { StaffManagementPage } from './pages/admin/StaffManagementPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ReportsPage } from './pages/admin/ReportsPage';

// Staff Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AssignedComplaintsPage } from './pages/staff/AssignedComplaintsPage';
import { StaffHistoryPage } from './pages/staff/StaffHistoryPage';

// 404
import { NotFoundPage } from './pages/NotFoundPage';

export const App = () => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {isAuthenticated && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <div className="main-content">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className={isAuthenticated ? 'page-body' : 'container py-4 flex-grow-1'}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/track" element={<TrackComplaintPage />} />

            {/* Profile Route for all Authenticated Users */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/submit"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN']}>
                  <SubmitComplaintPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/complaints"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT', 'ROLE_ADMIN']}>
                  <MyComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/complaints/:id"
              element={
                <ProtectedRoute>
                  <ComplaintDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <AllComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <DepartmentManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/staff"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <StaffManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/complaints"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
                  <AssignedComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/history"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STAFF', 'ROLE_ADMIN']}>
                  <StaffHistoryPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        {!isAuthenticated && (
          <footer className="bg-white border-top py-4 text-center text-muted small mt-auto">
            <div className="container">
              &copy; {new Date().getFullYear()} Campus Problem Reporting and Resolution System. All rights reserved.
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
