import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard'; 
import StudentProfile from './StudentProfile';
import TeacherDashboard from './TeacherDashboard';
import Register from './features/auth/Register'; // Ensure this path is correct

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (status, role) => {
    setIsLoggedIn(status);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-900">Loading...</div>;

  return (
    <Routes>
      {/* 1. PUBLIC ROUTE: Login */}
      <Route 
        path="/" 
        element={!isLoggedIn ? <Login onLogin={handleLoginSuccess} /> : <Navigate to="/dashboard" />} 
      />

      {/* 2. ADMIN ROUTES */}
      {isLoggedIn && userRole === 'admin' && (
        <>
          <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
          <Route path="/register" element={<Register />} />
        </>
      )}

      {/* 3. TEACHER ROUTE */}
      {isLoggedIn && userRole === 'teacher' && (
        <Route path="/dashboard" element={<TeacherDashboard onLogout={handleLogout} />} />
      )}

      {/* 4. STUDENT ROUTE */}
      {isLoggedIn && userRole === 'student' && (
        <Route path="/profile" element={<StudentProfile onLogout={handleLogout} />} />
      )}

      {/* 5. CATCH-ALL: Redirect to home/login if nothing matches */}
      <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/"} />} />
    </Routes>
  );
}

export default App;