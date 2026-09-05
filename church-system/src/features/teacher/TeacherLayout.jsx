'use client';

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Globe,
  Users,
  BookOpen,
  FileText,
  Award,
  MessageSquare,
  CalendarCheck,
  BarChart3,
  FolderOpen,
  GraduationCap,
  Key,
  LogOut,
  Sparkles,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ChurchLogo from '../../assets/ChurchLogo.png';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Badge } from '../../components/ui/Badge';

const TeacherLayout = ({ children, onLogout }) => {
  const user = useAuthStore((state) => state.user);
  const teacherName = user?.fullName || 'መምህር';

  const navItems = [
    { label: 'አጠቃላይ እይታ (Overview)', path: '/teacher', icon: <LayoutDashboard className="w-4 h-4 text-blue-500" />, end: true },
    { label: 'የርቀት ትምህርት (Distance LMS)', path: '/teacher/distance-hub', icon: <Globe className="w-4 h-4 text-sky-500" /> },
    { label: 'የእኔ ተማሪዎች (My Students)', path: '/teacher/students', icon: <Users className="w-4 h-4 text-emerald-500" /> },
    { label: 'የእኔ ኮርሶች (My Courses)', path: '/teacher/courses', icon: <BookOpen className="w-4 h-4 text-amber-500" /> },
    { label: 'ይዘት እና ፈተናዎች (Lessons)', path: '/teacher/content', icon: <FileText className="w-4 h-4 text-indigo-500" /> },
    { label: 'ውጤት መስጫ (Grading)', path: '/teacher/grading', icon: <Award className="w-4 h-4 text-yellow-500" /> },
    { label: 'ግንኙነት (Communication)', path: '/teacher/communication', icon: <MessageSquare className="w-4 h-4 text-teal-500" /> },
    { label: 'መገኘት (Attendance)', path: '/teacher/attendance', icon: <CalendarCheck className="w-4 h-4 text-rose-500" /> },
    { label: 'ሪፖርቶች (Reports)', path: '/teacher/reports', icon: <BarChart3 className="w-4 h-4 text-purple-500" /> },
    { label: 'ማጣቀሻዎች (Resources)', path: '/teacher/resources', icon: <FolderOpen className="w-4 h-4 text-orange-500" /> },
    { label: 'ፈተናዎች (Exams)', path: '/teacher/exams', icon: <GraduationCap className="w-4 h-4 text-blue-600" /> },
    { label: 'የይለፍ ቃል (Password)', path: '/change-password', icon: <Key className="w-4 h-4 text-slate-500" /> },
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
            <p className="text-[10px] text-[var(--brand-gold)] font-bold uppercase tracking-wider">የመምህራን መድረክ (Teacher Portal)</p>
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
              መምህራን
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              እንኳን ደህና መጡ፣ መምህር {teacherName}! 👋
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-lg leading-relaxed">
              የኮርስ ይዘቶችን፣ የፈተና ጥያቄዎችን፣ የተማሪዎች ውጤትና መገኘትን እዚህ ያቀናብሩ።
            </p>
          </div>

          <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-2xl flex-shrink-0">
            👨‍🏫
          </div>

          {/* Background Decorative Circles */}
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute left-1/2 -top-10 w-32 h-32 bg-amber-400/10 rounded-full blur-xl pointer-events-none"></div>
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
                    ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-blue-900/20'
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

export default TeacherLayout;