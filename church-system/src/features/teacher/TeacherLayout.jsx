// src/features/teacher/TeacherLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import ChurchLogo from '../../assets/ChurchLogo.png';

const TeacherLayout = ({ onLogout }) => {
  const user = useAuthStore((state) => state.user);
  const teacherName = user?.fullName || 'መምህር';

  const navItems = [
    { label: 'አጠቃላይ እይታ (Overview)', path: '/teacher', icon: '📊', end: true },
    { label: '🌐 የርቀት ትምህርት (Distance LMS)', path: '/teacher/distance-hub', icon: '🌐' },
    { label: 'የእኔ ተማሪዎች (My Students)', path: '/teacher/students', icon: '👨‍🎓' },
    { label: 'የእኔ ኮርሶች (My Courses)', path: '/teacher/courses', icon: '📚' },
    { label: 'ይዘት እና ፈተናዎች (Content & Lessons)', path: '/teacher/content', icon: '📝' },
    { label: 'ውጤት መስጫ (Grading)', path: '/teacher/grading', icon: '💯' },
    { label: 'ግንኙነት (Communication)', path: '/teacher/communication', icon: '💬' },
    { label: 'መገኘት (Attendance)', path: '/teacher/attendance', icon: '📋' },
    { label: 'ሪፖርቶች (Reports)', path: '/teacher/reports', icon: '📈' },
    { label: 'Resources', path: '/teacher/resources', icon: '📖' },
    { label: 'Assignments', path: '/teacher/assignments', icon: '📝' },
    { label: 'Exams', path: '/teacher/exams', icon: '📊' },
    { label: 'Change Password', path: '/change-password', icon: '🔑' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-gradient-to-r from-[#051533] via-[#08214d] to-[#051533] text-white px-6 md:px-8 py-3.5 flex justify-between items-center shadow-lg border-b border-amber-400/20 sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-full bg-white p-1 border border-amber-400 flex items-center justify-center shadow-md flex-shrink-0">
            <img src={ChurchLogo} alt="Church Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-wide text-white">
              ተክለ ሳዊሮስ ሰንበት ት/ቤት
            </h1>
            <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">የመምህራን መድረክ (Teacher Portal)</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white border border-white/20 hover:border-rose-500 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm"
        >
          <span>ይውጡ (Logout)</span>
          <span>🚪</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6 flex-1 w-full">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-[#0f4c9c] via-blue-700 to-indigo-900 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2">
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              መምህራን
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              እንኳን ደህና መጡ፣ መምህር {teacherName}! 👋
            </h2>
            <p className="text-blue-100 text-xs md:text-sm max-w-lg leading-relaxed">
              የኮርስ ይዘቶችን፣ የፈተና ጥያቄዎችን፣ የተማሪዎች ውጤትና መገኘትን እዚህ ያቀናብሩ።
            </p>
          </div>

          <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl flex-shrink-0">
            👨‍🏫
          </div>

          {/* Background Decorative Circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute left-1/2 -top-10 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Navigation Tabs */}
        <nav className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/80 flex flex-wrap gap-1 md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${isActive
                  ? 'bg-[#0f4c9c] text-white shadow-md shadow-blue-900/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Dynamic Outlet Body */}
        <main className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm min-h-[400px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;