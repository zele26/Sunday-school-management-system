'use client';

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Home,
  BookOpen,
  CalendarCheck,
  Bell,
  User,
  FolderOpen,
  FileText,
  GraduationCap,
  TrendingUp,
  LogOut,
  Sparkles,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ChurchLogo from '../../assets/ChurchLogo.png';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Badge } from '../../components/ui/Badge';

const StudentLayout = ({ children, onLogout }) => {
  const user = useAuthStore((state) => state.user);
  const studentName = user?.fullName || 'ተማሪ';
  const studentId = user?.studentId || '';

  const navItems = [
    { label: 'መነሻ ገጽ (Dashboard)', path: '/dashboard', icon: <Home className="w-4 h-4 text-indigo-500" />, end: true },
    { label: 'የኔ ኮርሶች (My Courses)', path: '/dashboard/courses', icon: <BookOpen className="w-4 h-4 text-blue-500" /> },
    { label: 'የመገኘት ሁኔታ (Attendance)', path: '/dashboard/attendance', icon: <CalendarCheck className="w-4 h-4 text-emerald-500" /> },
    { label: 'ማስታወቂያዎች (Announcements)', path: '/dashboard/announcements', icon: <Bell className="w-4 h-4 text-amber-500" /> },
    { label: 'የግል መረጃ (Profile)', path: '/dashboard/profile', icon: <User className="w-4 h-4 text-purple-500" /> },
    { label: 'ማጣቀሻዎች (Resources)', path: '/dashboard/resources', icon: <FolderOpen className="w-4 h-4 text-orange-500" /> },
    { label: 'የቤት ሥራዎች (Assignments)', path: '/dashboard/assignments', icon: <FileText className="w-4 h-4 text-teal-500" /> },
    { label: 'ፈተናዎች (Exams)', path: '/dashboard/exams', icon: <GraduationCap className="w-4 h-4 text-rose-500" /> },
    { label: 'ውጤት (Results)', path: '/dashboard/results', icon: <TrendingUp className="w-4 h-4 text-green-500" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)] font-sans flex flex-col transition-colors duration-200">
      {/* Top Navbar */}
      <header className="bg-[#1657b8] text-white px-4 sm:px-8 py-3.5 flex justify-between items-center shadow-sm border-b border-amber-400/30 sticky top-0 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white p-1 border border-amber-400 flex items-center justify-center shadow-sm flex-shrink-0">
            <img src={ChurchLogo?.src || ChurchLogo} alt="Church Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-wide text-white">
              ተክለ ሳዊሮስ ሰንበት ት/ቤት
            </h1>
            <p className="text-[10px] text-[var(--brand-gold)] font-bold uppercase tracking-wider">የተማሪዎች ፖርታል (Student Portal)</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle className="bg-white/10 text-white border-white/20 hover:bg-white/20" />
          <button
            onClick={onLogout}
            className="bg-white/10 hover:bg-rose-600 text-slate-200 hover:text-white border border-white/20 hover:border-rose-500 text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm"
          >
            <span>Logout</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 flex-1 w-full">
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-[#1657b8] via-[#124796] to-[#0d3269] rounded-3xl p-6 md:p-8 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="relative z-10 space-y-2">
            <Badge variant="gold" size="sm">
              <Sparkles className="w-3 h-3" />
              ሰላምታ
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              ሰላም፣ {studentName}! 👋
            </h2>
            {studentId && (
              <div className="flex items-center gap-2 text-xs font-mono text-amber-200 mt-1">
                <span className="opacity-80 font-semibold">ID:</span>
                <span className="font-black tracking-widest bg-white/20 px-2.5 py-0.5 rounded-lg border border-white/20">{studentId}</span>
              </div>
            )}
            <p className="text-blue-100 text-xs sm:text-sm max-w-lg leading-relaxed">
              የሰንበት ትምህርት ቤት ትምህርቶችዎን፣ የመገኘት መዝገብዎን እና የቅርብ ጊዜ ማስታወቂያዎችን እዚህ ይከታተሉ።
            </p>
          </div>

          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-md flex-shrink-0">
            🎓
          </div>

          {/* Background Decorative Circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute left-1/2 -top-10 w-32 h-32 bg-amber-400/20 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Navigation Tabs */}
        <nav className="bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-wrap gap-1.5 transition-colors">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#1657b8] text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Dynamic Outlet Body */}
        <main className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm min-h-[400px] transition-colors">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;