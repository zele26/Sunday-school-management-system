// src/features/student/StudentLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const StudentLayout = ({ onLogout }) => {
  // Get user object from Zustand store
  const user = useAuthStore((state) => state.user);
  // Fallback to stored userName if needed, but ideally use user.fullName
  const studentName = user?.fullName || 'ተማሪ';

  const navItems = [
    { label: 'መነሻ ገጽ (Dashboard)', path: '/dashboard', icon: '🏠', end: true },
    { label: 'የኔ ኮርሶች (My Courses)', path: '/dashboard/courses', icon: '📚' },
    { label: 'የመገኘት ሁኔታ (Attendance)', path: '/dashboard/attendance', icon: '📅' },
    { label: 'ማስታወቂያዎች (Announcements)', path: '/dashboard/announcements', icon: '🔔' },
    { label: 'የግል መረጃ (Profile)', path: '/dashboard/profile', icon: '👤' },
    { label: 'Resources', path: '/dashboard/resources', icon: '📖' },
    { label: 'Assignments', path: '/dashboard/assignments', icon: '📝' },
    { label: 'Exams', path: '/dashboard/exams', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-lg border-b border-indigo-900/40 sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-xl shadow-inner">
            ⛪
          </div>
          <div>
            <h1 className="text-base font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
              ተክለሃይማኖት ሰንበት ትምህርት ቤት
            </h1>
            <p className="text-[10px] text-indigo-300 font-medium">የተማሪዎች ፖርታል (Student Portal)</p>
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
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2">
            <span className="bg-white/20 backdrop-blur-md border border-white/20 text-xs font-semibold px-3 py-1 rounded-full text-indigo-100">
              ሰላምታ
            </span>
            <h2 className="text-3xl font-black tracking-tight">
              ሰላም፣ {studentName}! 👋
            </h2>
            <p className="text-indigo-100 text-xs md:text-sm max-w-lg leading-relaxed">
              የሰንበት ትምህርት ቤት ትምህርቶችዎን፣ የመገኘት መዝገብዎን እና የቅርብ ጊዜ ማስታወቂያዎችን እዚህ ይከታተሉ።
            </p>
          </div>

          <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-4xl shadow-2xl flex-shrink-0">
            🎓
          </div>

          {/* Background Decorative Circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute left-1/2 -top-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl pointer-events-none"></div>
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
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
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

export default StudentLayout;