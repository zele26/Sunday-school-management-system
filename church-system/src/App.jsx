import React, { useState, useEffect } from 'react';
import Login from './Login';
import Dashboard from './Dashboard'; // Your Admin/Secretary page
import StudentProfile from './StudentProfile';
import TeacherDashboard from './TeacherDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Check if user is already logged in when the app starts/refreshes
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
    setLoading(false);
  }, []);

  // 2. Function to call after successful Login
  const handleLoginSuccess = (status, role) => {
    setIsLoggedIn(status);
    setUserRole(role);
  };

  // 3. Function to call for Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  // --- TRAFFIC CONTROL ---
  
  // If not logged in, show Login Page
  if (!isLoggedIn) {
    return <Login onLogin={handleLoginSuccess} />;
  }

  // If logged in as Student, show Student Profile
  if (userRole === 'student') {
    return <StudentProfile onLogout={handleLogout} />;
  }

  // If logged in as Teacher, show Teacher View (or Profile for now)
if (userRole === 'teacher') {
  return <TeacherDashboard onLogout={handleLogout} />;
}
  // Default: Show the Secretary/Admin Dashboard
  return <Dashboard onLogout={handleLogout} />;
}

export default App;