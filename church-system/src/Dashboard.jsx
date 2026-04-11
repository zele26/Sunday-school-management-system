import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import Scanner from './Scanner'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [activeTab, setActiveTab] = useState('profile'); // Default to profile for safety
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- NEW: Get User Role ---
  const userRole = localStorage.getItem('userRole'); 

  const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

  // FIX: Redirect if not logged in at all
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
    
    // Set default tab based on role
    if (userRole === 'admin') setActiveTab('students');
  }, [navigate, userRole]);

  // 1. Fetch Students List
  useEffect(() => {
    if (userRole === 'admin') {
      fetch(`${API_BASE_URL}/api/students`)
        .then(res => res.json())
        .then(data => setStudents(data))
        .catch(err => console.error("Error fetching students:", err));
    }
  }, [userRole]);

  // 2. Fetch Live Attendance
  useEffect(() => {
    if (userRole === 'admin') {
      const fetchAttendance = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/attendance/today`);
          const data = await res.json();
          setAttendanceList(data);
        } catch (err) {
          console.error("Attendance fetch error:", err);
        }
      };
      fetchAttendance();
      const interval = setInterval(fetchAttendance, 5000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  // --- NEW: Proper Logout Function ---
  const handleLogout = () => {
    localStorage.clear(); // Clears token and role
    navigate('/');
    window.location.reload(); // Force refresh to clear any cached states
  };

  const filteredStudents = students.filter(student => {
    const fullName = `${student.firstName || student.fullName} ${student.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === "All" || student.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-bold">ተክለሳዊሮስ Admin</h2>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-2xl">☰</button>
      </div>
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-900 text-white p-4 absolute top-16 left-0 right-0 z-50">
          <nav className="space-y-2">
            {userRole === 'admin' && (
              <>
                <button onClick={() => { setActiveTab('students'); setMobileMenuOpen(false); }} className="block w-full text-left p-2 rounded">👥 Students List</button>
                <button onClick={() => { setActiveTab('scanner'); setMobileMenuOpen(false); }} className="block w-full text-left p-2 rounded">📷 Open Scanner</button>
                <button onClick={() => { setActiveTab('attendance'); setMobileMenuOpen(false); }} className="block w-full text-left p-2 rounded">📸 Live Attendance</button>
              </>
            )}
            <button onClick={() => { setActiveTab('feedback'); setMobileMenuOpen(false); }} className="block w-full text-left p-2 rounded">📩 Send Feedback</button>
            <button onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }} className="block w-full text-left p-2 rounded">👤 My Profile</button>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="block w-full text-left p-2 rounded text-red-300">🚪 Logout</button>
          </nav>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6 hidden md:block no-print shadow-2xl">
        <h2 className="text-2xl font-bold mb-8 border-b border-blue-700 pb-4 italic bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">ተክለሳዊሮስ Admin</h2>
        <nav className="space-y-2">
          
          {/* --- ADMIN ONLY SIDEBAR LINKS --- */}
          {userRole === 'admin' && (
            <>
              <button onClick={() => setActiveTab('students')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 hover:scale-105 ${activeTab === 'students' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
                <span>👥</span> Students List
              </button>
              
              <button onClick={() => setActiveTab('scanner')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 hover:scale-105 ${activeTab === 'scanner' ? 'bg-orange-500 shadow-lg' : 'hover:bg-blue-800'}`}>
                <span>📷</span> Open Scanner
              </button>

              <button onClick={() => setActiveTab('attendance')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 hover:scale-105 ${activeTab === 'attendance' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
                <span>📸</span> Live Attendance
              </button>
            </>
          )}

          {/* --- PUBLIC LINKS --- */}
          <button onClick={() => setActiveTab('feedback')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 hover:scale-105 ${activeTab === 'feedback' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>📩</span> Send Feedback
          </button>
          
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 hover:scale-105 ${activeTab === 'profile' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>👤</span> My Profile
          </button>
          
          <div className="pt-10">
            <button onClick={handleLogout} className="w-full text-left p-3 rounded-xl text-red-300 hover:bg-red-900/30 transition flex items-center gap-3 hover:scale-105">
              <span>🚪</span> Logout
            </button>
          </div>
        </nav>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        
        {/* QUICK STATS - ONLY FOR ADMIN */}
        {userRole === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print animate-fadeIn">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-blue-600 hover:shadow-xl transition-shadow">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Students</p>
              <h3 className="text-3xl font-black text-gray-800">{students.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500 hover:shadow-xl transition-shadow">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Present Today (QR)</p>
              <h3 className="text-3xl font-black text-green-600">{attendanceList.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-orange-400 hover:shadow-xl transition-shadow">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attendance Rate</p>
              <h3 className="text-3xl font-black text-gray-800">
                {students.length > 0 ? Math.round((attendanceList.length / students.length) * 100) : 0}%
              </h3>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT (Conditional based on activeTab and userRole) --- */}
        
        {activeTab === 'scanner' && userRole === 'admin' && (
          <div className="animate-fadeIn flex flex-col items-center bg-white p-8 rounded-3xl shadow-2xl">
             <h1 className="text-3xl font-black text-gray-800 mb-6">QR መገኘት መቆጣጠሪያ</h1>
             <Scanner />
          </div>
        )}

        {activeTab === 'students' && userRole === 'admin' && (
          <div className="animate-fadeIn">
             <header className="flex justify-between items-center mb-8">
               <h1 className="text-3xl font-black text-gray-800">Students List</h1>
               <button onClick={() => navigate('/register')} className="bg-blue-600 p-2 px-4 rounded-xl font-bold text-white shadow-lg hover:bg-blue-700 transition">+ New</button>
             </header>
             {/* ... (Keep your table code here) ... */}
          </div>
        )}

        {/* PROFILE TAB (Visible to Everyone) */}
        {activeTab === 'profile' && (
          <div className="max-w-md bg-white p-8 rounded-3xl shadow-2xl text-center mx-auto border border-gray-100">
            <div className="h-24 w-24 bg-gradient-to-br from-blue-900 to-blue-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
              {localStorage.getItem('userName')?.charAt(0) || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{localStorage.getItem('userName') || 'User'}</h2>
            <p className="text-gray-500 mb-6 font-medium uppercase tracking-widest">{userRole}</p>
            <div className="space-y-3">
              <button className="w-full bg-gray-50 text-gray-700 py-3 rounded-xl font-bold border hover:bg-gray-100 transition hover:scale-105">Edit Profile</button>
              <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition hover:scale-105">Logout</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;