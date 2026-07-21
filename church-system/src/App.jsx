// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';

// Auth Pages
import Login from './Login';

import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword'; // <-- Adjusted path for password reset

// Admin Modular System
import AdminLayout from './features/admin/AdminLayout';
import AdminOverview from './features/admin/AdminOverview';
import UsersManagement from './features/admin/UsersManagement';
import ApprovalsManagement from './features/admin/ApprovalsManagement';
import ClassesManagement from './features/admin/ClassesManagement';
import CoursesManagement from './features/admin/CoursesManagement';
import AnnouncementsManagement from './features/admin/AnnouncementsManagement';
import ResourcesManagement from './features/admin/ResourcesManagement';
import AttendanceManagement from './features/admin/AttendanceManagement';
import ReportsManagement from './features/admin/ReportsManagement';
import ComplaintsManagement from './features/admin/ComplaintsManagement';
import CertificatesManagement from './features/admin/CertificatesManagement';
import SettingsManagement from './features/admin/SettingsManagement';
import AuditLogsManagement from './features/admin/AuditLogsManagement';

// Teacher Modular System
import TeacherLayout from './features/teacher/TeacherLayout';
import TeacherOverview from './features/teacher/TeacherOverview';
import TeacherClasses from './features/teacher/TeacherClasses';
import TeacherCourses from './features/teacher/TeacherCourses';
import TeacherContent from './features/teacher/TeacherContent';
import TeacherGrading from './features/teacher/TeacherGrading';
import TeacherCommunication from './features/teacher/TeacherCommunication';
import TeacherReports from './features/teacher/TeacherReports';

// Student Modular System
import StudentLayout from './features/student/StudentLayout';
import StudentOverview from './features/student/StudentOverview';
import StudentCourses from './features/student/StudentCourses';
import StudentAttendance from './features/student/StudentAttendance';
import StudentAnnouncements from './features/student/StudentAnnouncements';
import StudentProfileModule from './features/student/StudentProfileModule';

// --- Route Protection Wrappers ---
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const RoleRoute = ({ allowedRoles }) => {
  const userRole = localStorage.getItem('userRole');

  if (!allowedRoles.includes(userRole)) {
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'teacher') return <Navigate to="/teacher" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');

    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold">በመጫን ላይ ነው... (Loading...)</p>
        </div>
      </div>
    );
  }

  const getRedirectPath = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'teacher') return '/teacher';
    return '/dashboard';
  };

  return (
    <Routes>
      {/* Public Landing & Login Routes */}
      <Route
        path="/"
        element={
          !isLoggedIn ? (
            <Navigate to="/login" replace />
          ) : (
            <Navigate to={getRedirectPath()} replace />
          )
        }
      />

      <Route
        path="/login"
        element={
          !isLoggedIn ? (
            <Login onLogin={handleLoginSuccess} />
          ) : (
            <Navigate to={getRedirectPath()} replace />
          )
        }
      />

      {/* Public Registration Route */}
      <Route
        path="/register"
        element={
          !isLoggedIn ? (
            <Register />
          ) : (
            <Navigate to={getRedirectPath()} replace />
          )
        }
      />

      {/* Public Forgot Password Route */}
      <Route
        path="/forgot-password"
        element={
          !isLoggedIn ? (
            <ForgotPassword />
          ) : (
            <Navigate to={getRedirectPath()} replace />
          )
        }
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Student Portal */}
        <Route element={<RoleRoute allowedRoles={['student', 'admin']} />}>
          <Route path="/dashboard/*" element={<StudentLayout onLogout={handleLogout} />}>
            <Route index element={<StudentOverview />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="announcements" element={<StudentAnnouncements />} />
            <Route path="profile" element={<StudentProfileModule />} />
          </Route>
        </Route>

        {/* Teacher Portal */}
        <Route element={<RoleRoute allowedRoles={['teacher', 'admin']} />}>
          <Route path="/teacher/*" element={<TeacherLayout onLogout={handleLogout} />}>
            <Route index element={<TeacherOverview />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="courses" element={<TeacherCourses />} />
            <Route path="content" element={<TeacherContent />} />
            <Route path="grading" element={<TeacherGrading />} />
            <Route path="communication" element={<TeacherCommunication />} />
            <Route path="reports" element={<TeacherReports />} />
          </Route>
        </Route>

        {/* Admin Portal */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin/*" element={<AdminLayout onLogout={handleLogout} />}>
            <Route index element={<AdminOverview />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="approvals" element={<ApprovalsManagement />} />
            <Route path="classes" element={<ClassesManagement />} />
            <Route path="courses" element={<CoursesManagement />} />
            <Route path="announcements" element={<AnnouncementsManagement />} />
            <Route path="resources" element={<ResourcesManagement />} />
            <Route path="attendance" element={<AttendanceManagement />} />
            <Route path="reports" element={<ReportsManagement />} />
            <Route path="complaints" element={<ComplaintsManagement />} />
            <Route path="certificates" element={<CertificatesManagement />} />
            <Route path="settings" element={<SettingsManagement />} />
            <Route path="audit-logs" element={<AuditLogsManagement />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;