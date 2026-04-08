import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard'; 
import StudentProfile from './StudentProfile';
import TeacherDashboard from './TeacherDashboard';
import Register from './features/auth/Register'; 

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
      <Route path="/" element={!isLoggedIn ? <Login onLogin={handleLoginSuccess} /> : <Navigate to="/dashboard" />} />
      
      {/* These routes are now accessible to anyone logged in */}
      <Route path="/dashboard" element={<Dashboard onLogout={handleLogout} />} />
      <Route path="/register" element={<Register />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboard onLogout={handleLogout} />} />
      <Route path="/profile" element={<StudentProfile onLogout={handleLogout} />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;