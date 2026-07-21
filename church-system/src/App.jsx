// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';

// Auth Pages & Components
import Login from './Login';
import Register from './pages/Register'; // <-- changed from ./features/auth/Register
import ForgotPassword from './features/auth/ForgotPassword';

// Layouts
import AdminLayout from './features/admin/AdminLayout';
import TeacherLayout from './features/teacher/TeacherLayout';
import StudentLayout from './features/student/StudentLayout';

// Sub-Module Routes
import AdminRoutes from './routes/AdminRoutes';
import TeacherRoutes from './routes/TeachersRoutes';
import StudentRoutes from './routes/StudentRoutes';

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
        element={!isLoggedIn ? <Navigate to="/login" replace /> : <Navigate to={getRedirectPath()} replace />}
      />

      <Route
        path="/login"
        element={!isLoggedIn ? <Login onLogin={handleLoginSuccess} /> : <Navigate to={getRedirectPath()} replace />}
      />

      <Route
        path="/register"
        element={!isLoggedIn ? <Register /> : <Navigate to={getRedirectPath()} replace />}
      />

      <Route
        path="/forgot-password"
        element={!isLoggedIn ? <ForgotPassword /> : <Navigate to={getRedirectPath()} replace />}
      />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Student Portal */}
        <Route element={<RoleRoute allowedRoles={['student', 'admin']} />}>
          <Route path="/dashboard/*" element={<StudentLayout onLogout={handleLogout} />}>
            <Route path="*" element={<StudentRoutes />} />
          </Route>
        </Route>

        {/* Teacher Portal */}
        <Route element={<RoleRoute allowedRoles={['teacher', 'admin']} />}>
          <Route path="/teacher/*" element={<TeacherLayout onLogout={handleLogout} />}>
            <Route path="*" element={<TeacherRoutes />} />
          </Route>
        </Route>

        {/* Admin Portal */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin/*" element={<AdminLayout onLogout={handleLogout} />}>
            <Route path="*" element={<AdminRoutes />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;