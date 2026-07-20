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



import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import ResourcesManagement from './features/admin/ResourcesManagement';
import AttendanceManagement from './features/admin/AttendanceManagement';
import ReportsManagement from './features/admin/ReportsManagement';
import ComplaintsManagement from './features/admin/ComplaintsManagement';
import CertificatesManagement from './features/admin/CertificatesManagement';
import SettingsManagement from './features/admin/SettingsManagement';
import AuditLogsManagement from './features/admin/AuditLogsManagement';

// Temporary placeholders for remaining admin modules
//const ApprovalsManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">✅ Approvals Module</div>;
// const ClassesManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">🏫 Classes Module</div>;
// const CoursesManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">📚 Courses Module</div>;
// const AnnouncementsManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">📢 Announcements Module</div>;
// const ResourcesManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">📄 Resources Module</div>;
// const AttendanceManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">📝 Attendance Module</div>;
// const ReportsManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">📊 Reports Module</div>;
// const ComplaintsManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">⚠️ Complaints Module</div>;
// const CertificatesManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">🎓 Certificates Module</div>;
// const SettingsManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">⚙️ Settings Module</div>;
// const AuditLogsManagement = () => <div className="bg-white p-6 rounded-2xl shadow-sm border">📋 Audit Logs Module</div>;

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          !isLoggedIn ? (
            <Login onLogin={handleLoginSuccess} />
          ) : (
            <Navigate
              to={
                localStorage.getItem('userRole') === 'admin'
                  ? '/admin'
                  : localStorage.getItem('userRole') === 'teacher'
                  ? '/teacher'
                  : '/dashboard'
              }
            />
          )
        }
      />

      <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard onLogout={handleLogout} />} />
      <Route path="/profile" element={<StudentProfile onLogout={handleLogout} />} />
      <Route path="/teacher" element={<TeacherDashboard onLogout={handleLogout} />} />

      {/* Modular Admin Nested Sub-Routes */}
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

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;