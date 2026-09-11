'use client';

import React from 'react';
import Image from 'next/image';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  Home,
  BookOpen,
  CalendarCheck,
  Bell,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import ChurchLogo from '../../assets/ChurchLogo.png';
import { ThemeToggle } from '../../components/ui/ThemeToggle';

const StudentLayout = ({ children, onLogout }) => {
  const user = useAuthStore((state) => state.user);
  const studentName = user?.fullName || 'ተማሪ';
  const studentId = user?.studentId || '';

  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('') || 'ተ';

  const navItems = [
    { label: 'መነሻ', path: '/dashboard', icon: <Home className="w-4 h-4" />, end: true },
    { label: 'አካዳሚክ', path: '/dashboard/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'ተገኝነትና ውጤት', path: '/dashboard/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { label: 'ማስታወቂያዎች', path: '/dashboard/announcements', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200 selection:bg-[var(--brand-gold)] selection:text-slate-950">
      {/* Top Navbar Header */}
      <header className="bg-[#1e3a8a] dark:bg-slate-900 text-white px-4 sm:px-8 py-3 flex justify-between items-center shadow-md border-b border-blue-900 dark:border-slate-800 sticky top-0 z-30">
        <Link to="/dashboard" className="flex items-center space-x-3 space-x-reverse group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white p-1 border border-amber-400/60 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
            <Image
              src={ChurchLogo}
              alt="Church Logo"
              width={44}
              height={44}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
              ተክለ ሳዊሮስ
            </span>
            <span className="text-[10px] sm:text-[11px] text-amber-300 font-extrabold uppercase tracking-wider">
              የተማሪዎች ፖርታል
            </span>
          </div>
        </Link>

        {/* Right Top Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle className="bg-white/10 text-white border-white/20 hover:bg-white/20 min-h-[38px] min-w-[38px]" />

          {/* User Profile Pill */}
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all text-xs font-semibold"
            title="የግል መረጃ ይመልከቱ"
          >
            <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs shadow-2xs">
              {initials}
            </div>
            <span className="hidden sm:inline-block max-w-[120px] truncate">{studentName}</span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-400/30 hover:border-rose-500 text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer min-h-[38px]"
            title="ከሲስተሙ ውጣ"
          >
            <span className="hidden sm:inline">ውጣ</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 flex-1 w-full">
        {/* Consolidated 4-Category Navigation Tabs */}
        <nav className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none transition-colors">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center gap-2 whitespace-nowrap select-none min-h-[40px] ${
                  isActive
                    ? 'bg-[#1e3a8a] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Dynamic Outlet / Main Body */}
        <main className="w-full">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;