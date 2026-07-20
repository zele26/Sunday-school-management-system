// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Navigate } from 'react-router-dom';
// import Login from './Login';
// import Dashboard from './Dashboard'; 
// import StudentProfile from './StudentProfile';
// import TeacherDashboard from './TeacherDashboard';
// import Register from './features/auth/Register';
// import AdminPanel from './AdminPanel';

// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       setIsLoggedIn(true);
//     }
//     setLoading(false);
//   }, []);

//   const handleLoginSuccess = () => setIsLoggedIn(true);
//   const handleLogout = () => {
//     localStorage.clear();
//     setIsLoggedIn(false);
//   };

//   if (loading) return <div>Loading...</div>;

//   return (
//     <Routes>
//       <Route path="/" element={!isLoggedIn ? <Login onLogin={handleLoginSuccess} /> : <Navigate to={localStorage.getItem('userRole') === 'admin' ? '/admin' : localStorage.getItem('userRole') === 'teacher' ? '/teacher' : '/dashboard'} />} />

//       <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/teacher-dashboard" element={<TeacherDashboard onLogout={handleLogout} />} />
//       <Route path="/profile" element={<StudentProfile onLogout={handleLogout} />} />
//       <Route path="/admin/*" element={<AdminPanel onLogout={handleLogout} />} />
//       <Route path="/teacher" element={<TeacherDashboard onLogout={handleLogout} />} />

//       <Route path="*" element={<Navigate to="/" />} />
//     </Routes>
//   );
// }

// export default App;


// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Core Pages
import Login from './Login';
import Dashboard from './Dashboard'; 
import StudentProfile from './StudentProfile';
import TeacherDashboard from './TeacherDashboard';
import Register from './features/auth/Register';

// Admin Modular Imports
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

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safely check authentication status on initial mount
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-sans">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">በመጫን ላይ ነው... (Loading...)</p>
        </div>
      </div>
    );
  }

  // Determine post-login redirect path based on user role
  const getRedirectPath = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'teacher') return '/teacher';
    return '/dashboard';
  };

  return (
    <Routes>
      {/* Root Route: Shows Login if logged out, or Redirects if logged in */}
      <Route
        path="/"
        element={
          !isLoggedIn ? (
            <Login onLogin={handleLoginSuccess} />
          ) : (
            <Navigate to={getRedirectPath()} replace />
          )
        }
      />

      {/* Auth & Public Routes */}
      <Route path="/register" element={<Register />} />

      {/* Authenticated User Routes */}
      <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard onLogout={handleLogout} />} />
      <Route path="/profile" element={<StudentProfile onLogout={handleLogout} />} />
      <Route path="/teacher" element={<TeacherDashboard onLogout={handleLogout} />} />

      {/* Admin Sub-System (Nested Routing) */}
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

      {/* Fallback for undefined routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;