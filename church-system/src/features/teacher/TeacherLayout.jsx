// src/features/teacher/TeacherLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const TeacherLayout = ({ onLogout }) => {
const user = useAuthStore((state) => state.user);
const teacherName = user?.fullName || 'መምህር';

const navItems = [
  { label: 'አጠቃላይ እይታ (Overview)', path: '/teacher', icon: '📊', end: true },
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
      <header className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-lg border-b border-emerald-800/40 sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl shadow-inner">
            👨‍🏫
          </div>
          <div>
            <h1 className="text-base font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-100 to-teal-200">
              ተክለሳዊሮስ ሰንበት ትምህርት ቤት
            </h1>
            <p className="text-[10px] text-emerald-300 font-medium">የመምህራን መድረክ (Teacher Portal)</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="bg-rose-500/10 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-sm"
        >
          <span>ይውጡ (Logout)</span>
          <span>🚪</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6 flex-1 w-full">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-emerald-200/50 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2">
            <span className="bg-white/20 backdrop-blur-md border border-white/20 text-xs font-semibold px-3 py-1 rounded-full text-emerald-100">
              እንኳን ደህና መጡ
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              እንኳን ደህና መጡ፣ መምህር {teacherName}! 👋
            </h2>
            <p className="text-emerald-100 text-xs md:text-sm max-w-lg leading-relaxed">
              ክፍሎችን፣ የትምህርት ቄሳርነቶችን፣ ፈተናዎችን፣ መገኘት እና ግንኙነቶችን ከአንድ ቦታ በቀላሉ ያደራጁ።
            </p>
          </div>

          <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl flex-shrink-0">
            📚
          </div>

          {/* Background Decorative Circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute left-1/3 -top-10 w-32 h-32 bg-teal-300/20 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Navigation Tabs */}
        <nav className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200/80 flex flex-wrap gap-1 md:gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Dynamic Sub-Module Body */}
        <main className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm min-h-[400px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;