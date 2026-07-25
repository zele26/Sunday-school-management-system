// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Public layout & pages
import PublicLayout from './components/PublicLayout';
import Home from './pages/public/Home';
import About from './pages/public/About';
import Classes from './pages/public/Classes';
import Contact from './pages/public/Contact';
import PublicAnnouncements from './pages/public/Announcements';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './features/auth/ForgotPassword';

// Layouts
import AdminLayout from './features/admin/AdminLayout';
import TeacherLayout from './features/teacher/TeacherLayout';
import StudentLayout from './features/student/StudentLayout';

// Sub-routes
import AdminRoutes from './routes/AdminRoutes';
import TeacherRoutes from './routes/TeachersRoutes';
import StudentRoutes from './routes/StudentRoutes';

// Registration flow pages
import StudentRegister from './pages/StudentRegister';
import ContinueRegistration from './pages/ContinueRegistration';

// Route guards
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';

function App() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const getRedirectPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'teacher') return '/teacher';
    return '/dashboard';
  };

  return (
    <Routes>
      {/* Public section – accessible without login */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/announcements" element={<PublicAnnouncements />} />
        <Route path="/contact" element={<Contact />} />

        {/* ✅ ADDED: Registration flow pages */}
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/continue-registration" element={<ContinueRegistration />} />
      </Route>

      {/* Auth pages – still accessible when not logged in */}
      <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to={getRedirectPath()} replace />} />
      <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to={getRedirectPath()} replace />} />
      <Route path="/forgot-password" element={!isLoggedIn ? <ForgotPassword /> : <Navigate to={getRedirectPath()} replace />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Student */}
        <Route element={<RoleRoute allowedRoles={['student', 'admin']} />}>
          <Route path="/dashboard/*" element={<StudentLayout onLogout={logout} />}>
            <Route path="*" element={<StudentRoutes />} />
          </Route>
        </Route>

        {/* Teacher */}
        <Route element={<RoleRoute allowedRoles={['teacher', 'admin']} />}>
          <Route path="/teacher/*" element={<TeacherLayout onLogout={logout} />}>
            <Route path="*" element={<TeacherRoutes />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<RoleRoute allowedRoles={['admin']} />}>
          <Route path="/admin/*" element={<AdminLayout onLogout={logout} />}>
            <Route path="*" element={<AdminRoutes />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;