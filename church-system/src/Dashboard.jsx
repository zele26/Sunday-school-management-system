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
    navigate('/login');
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
      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-blue-900 text-white p-6 hidden md:block no-print shadow-2xl">
        <h2 className="text-2xl font-bold mb-8 border-b border-blue-800 pb-4 italic">ተክለሳዊሮስ Admin</h2>
        <nav className="space-y-2">
          
          {/* --- ADMIN ONLY SIDEBAR LINKS --- */}
          {userRole === 'admin' && (
            <>
              <button onClick={() => setActiveTab('students')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'students' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
                <span>👥</span> Students List
              </button>
              
              <button onClick={() => setActiveTab('scanner')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'scanner' ? 'bg-orange-500 shadow-lg' : 'hover:bg-blue-800'}`}>
                <span>📷</span> Open Scanner
              </button>

              <button onClick={() => setActiveTab('attendance')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'attendance' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
                <span>📸</span> Live Attendance
              </button>
            </>
          )}

          {/* --- PUBLIC LINKS --- */}
          <button onClick={() => setActiveTab('feedback')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'feedback' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>📩</span> Send Feedback
          </button>
          
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'profile' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>👤</span> My Profile
          </button>
          
          <div className="pt-10">
            <button onClick={handleLogout} className="w-full text-left p-3 rounded-xl text-red-300 hover:bg-red-900/30 transition flex items-center gap-3">
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-600">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Students</p>
              <h3 className="text-3xl font-black text-gray-800">{students.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Present Today (QR)</p>
              <h3 className="text-3xl font-black text-green-600">{attendanceList.length}</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-orange-400">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Attendance Rate</p>
              <h3 className="text-3xl font-black text-gray-800">
                {students.length > 0 ? Math.round((attendanceList.length / students.length) * 100) : 0}%
              </h3>
            </div>
          </div>
        )}

        {/* --- TAB CONTENT (Conditional based on activeTab and userRole) --- */}
        
        {activeTab === 'scanner' && userRole === 'admin' && (
          <div className="animate-fadeIn flex flex-col items-center">
             <h1 className="text-3xl font-black text-gray-800 mb-6">QR መገኘት መቆጣጠሪያ</h1>
             <div className="w-full max-w-md bg-white p-4 rounded-3xl shadow-2xl border border-gray-100">
                <Scanner />
             </div>
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
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-lg text-center mx-auto">
            <div className="h-24 w-24 bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
              {localStorage.getItem('userName')?.charAt(0) || 'U'}
            </div>
            <h2 className="text-2xl font-bold">{localStorage.getItem('userName') || 'User'}</h2>
            <p className="text-gray-500 mb-6 font-medium uppercase tracking-widest">{userRole}</p>
            <div className="space-y-2">
              <button className="w-full bg-gray-50 text-gray-700 py-3 rounded-xl font-bold border hover:bg-gray-100 transition">Edit Profile</button>
              <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition">Logout</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;