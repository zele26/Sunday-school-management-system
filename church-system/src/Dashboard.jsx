import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import Scanner from './Scanner'; // Ensure Scanner.jsx is in the same folder

const Dashboard = ({ onLogout }) => {
  const [students, setStudents] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [activeTab, setActiveTab] = useState('students'); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");

  // Update this base URL to your new Render service
  const API_BASE_URL = 'https://sunday-school-management-system.onrender.com';

  // 1. Fetch Students List
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/students`)
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(err => console.error("Error fetching students:", err));
  }, []);

  // 2. Fetch Live Attendance (Polls every 5 seconds)
  useEffect(() => {
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
  }, []);

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
          <button onClick={() => setActiveTab('students')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'students' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>👥</span> Students List
          </button>
          
          {/* New Scanner Tab Button */}
          <button onClick={() => setActiveTab('scanner')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'scanner' ? 'bg-orange-500 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>📷</span> Open Scanner
          </button>

          <button onClick={() => setActiveTab('attendance')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'attendance' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>📸</span> Live Attendance
          </button>
          <button onClick={() => setActiveTab('feedback')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'feedback' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>📩</span> Send Feedback
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full text-left p-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'profile' ? 'bg-blue-600 shadow-lg' : 'hover:bg-blue-800'}`}>
            <span>👤</span> My Profile
          </button>
          <div className="pt-10">
            <button onClick={onLogout} className="w-full text-left p-3 rounded-xl text-red-300 hover:bg-red-900/30 transition flex items-center gap-3">
              <span>🚪</span> Logout
            </button>
          </div>
        </nav>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        
        {/* QUICK STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
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

        {/* --- TAB: SCANNER --- */}
        {activeTab === 'scanner' && (
          <div className="animate-fadeIn flex flex-col items-center">
             <div className="w-full flex justify-between items-center mb-6">
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">QR መገኘት መቆጣጠሪያ</h1>
             </div>
             <div className="w-full max-w-md bg-white p-4 rounded-3xl shadow-2xl border border-gray-100">
                <Scanner />
             </div>
          </div>
        )}

        {/* --- TAB: ATTENDANCE --- */}
        {activeTab === 'attendance' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-black text-gray-800 tracking-tight">የዛሬ መገኘት (Live)</h1>
              <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold animate-pulse">● Live Updating</span>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-6 py-4">Student Name</th>
                    <th className="px-6 py-4">Time Scanned</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendanceList.length === 0 ? (
                    <tr><td colSpan="3" className="p-10 text-center text-gray-400">No scans recorded yet today.</td></tr>
                  ) : (
                    attendanceList.map((record) => (
                      <tr key={record._id} className="hover:bg-blue-50/50">
                        <td className="px-6 py-4 font-bold text-gray-700">{record.fullName}</td>
                        <td className="px-6 py-4 font-mono text-blue-600">{record.time}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="bg-green-500 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase">Present</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB: STUDENTS --- */}
        {activeTab === 'students' && (
          <>
            <header className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-black text-gray-800">Students List</h1>
              <div className="flex gap-2">
                <button onClick={() => Maps('/register')} className="bg-gray-100 p-2 px-4 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition">Print</button>
                <button 
    onClick={() => navigate('/register')} 
    className="bg-blue-600 p-2 px-4 rounded-xl font-bold text-white shadow-lg hover:bg-blue-700 transition"
  >
    + uNew
  </button>
              </div>
            </header>

            <div className="bg-white p-3 rounded-2xl shadow-sm mb-6 flex gap-4 no-print">
              <input 
                type="text" 
                placeholder="🔍 Search name..." 
                className="flex-1 p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                className="p-3 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-600"
                onChange={(e) => setSelectedGrade(e.target.value)}
              >
                <option value="All">All Grades</option>
                <option value="Grade 7">Grade 7</option>
                <option value="Grade 8">Grade 8</option>
              </select>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-gray-400 text-[10px] uppercase font-black tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Student Info</th>
                    <th className="px-6 py-4">Grade</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-blue-900 text-white flex items-center justify-center rounded-xl font-bold shadow-md">
                            {(student.firstName || student.fullName || "U")[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800">{student.firstName || student.fullName} {student.lastName || ''}</div>
                            <div className="text-[10px] text-gray-400 font-mono uppercase">{student._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-600 text-sm">{student.grade || 'N/A'}</td>
                      <td className="px-6 py-4"><span className="text-green-500 font-bold text-xs">● Active</span></td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-blue-600 font-bold text-xs mr-4">Edit</button>
                        <button className="text-red-400 font-bold text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* --- TAB: FEEDBACK --- */}
        {activeTab === 'feedback' && (
           <div className="max-w-2xl bg-white p-8 rounded-2xl shadow-lg">
             <h2 className="text-2xl font-bold mb-4">Send Student Feedback</h2>
             <textarea className="w-full p-4 border rounded-xl mb-4 h-32" placeholder="Write feedback for the parents here..."></textarea>
             <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">Send via WhatsApp/Email</button>
           </div>
        )}

        {/* --- TAB: PROFILE --- */}
        {activeTab === 'profile' && (
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-lg text-center">
            <div className="h-24 w-24 bg-blue-900 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold shadow-xl">S</div>
            <h2 className="text-2xl font-bold">Church Secretary</h2>
            <p className="text-gray-500 mb-6 font-medium tracking-tight">secretary@church.com</p>
            <div className="space-y-2">
              <button className="w-full bg-gray-50 text-gray-700 py-3 rounded-xl font-bold border hover:bg-gray-100 transition">System Settings</button>
              <button onClick={onLogout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition">Logout</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;