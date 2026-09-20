'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  CalendarCheck,
  Bell,
  User,
  LogOut,
  Sparkles,
  QrCode,
  X,
  Printer,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import useAuthStore from '../../store/authStore';
import ChurchLogo from '../../assets/ChurchLogo.png';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { useLanguage } from '../../hooks/useLanguage';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import { formatGradeAmharic } from '../../constants/registrationOptions';

const StudentLayout = ({ children, onLogout }) => {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const navigate = useNavigate();
  const studentName = user?.fullName || 'ተማሪ';
  const studentId = user?.studentId || '';
  const { t, isAmharic } = useLanguage();
  const { isTelegram, setBackButton, triggerHaptic } = useTelegramWebApp();
  const canScanAttendance = hasPermission(user, PERMISSIONS.ATTENDANCE_SCAN);

  const [showQrModal, setShowQrModal] = useState(false);

  // Sync native Telegram BackButton with navigation
  useEffect(() => {
    if (isTelegram && setBackButton) {
      const isSubpage = location.pathname !== '/dashboard' && location.pathname !== '/dashboard/';
      if (isSubpage) {
        setBackButton(true, () => {
          triggerHaptic('light');
          navigate('/dashboard');
        });
      } else {
        setBackButton(false);
      }
    }
    return () => {
      if (isTelegram && setBackButton) setBackButton(false);
    };
  }, [location.pathname, isTelegram, setBackButton, triggerHaptic, navigate]);

  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('') || 'ተ';

  const navItems = [
    { label: t('home', 'መነሻ'), path: '/dashboard', icon: <Home className="w-4 h-4" />, end: true },
    { label: t('academic', 'አካዳሚክ'), path: '/dashboard/courses', icon: <BookOpen className="w-4 h-4" /> },
    { label: t('attendanceAndGrades', 'ተገኝነትና ውጤት'), path: '/dashboard/attendance', icon: <CalendarCheck className="w-4 h-4" /> },
    { label: t('analytics', 'አናሊቲክስ (Analytics)'), path: '/dashboard/analytics', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { label: t('announcements', 'ማስታወቂያዎች'), path: '/dashboard/announcements', icon: <Bell className="w-4 h-4" /> },
    ...(canScanAttendance
      ? [
          {
            label: isAmharic ? 'የQR መቃኛ (Scanner)' : 'QR Scanner',
            path: '/admin/qr-scanner',
            icon: <QrCode className="w-4 h-4 text-emerald-400 animate-pulse" />,
            isExternal: true,
          },
        ]
      : []),
  ];

  const handleTabClick = () => {
    triggerHaptic('selection');
  };

  const handleOpenQrModal = () => {
    triggerHaptic('medium');
    setShowQrModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans flex flex-col transition-colors duration-200 selection:bg-[var(--brand-gold)] selection:text-slate-950 pb-20 md:pb-6">
      {/* Top Navbar Header */}
      <header className="bg-[#1e3a8a] dark:bg-slate-900 text-white px-4 sm:px-8 py-3 flex justify-between items-center shadow-md border-b border-blue-900 dark:border-slate-800 sticky top-0 z-30">
        <Link to="/dashboard" onClick={handleTabClick} className="flex items-center space-x-3 space-x-reverse group">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white p-1 border border-amber-400/60 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
            <Image
              src={ChurchLogo}
              alt="Church Logo"
              width={44}
              height={44}
              style={{ width: 'auto', height: 'auto' }}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black tracking-tight text-white leading-tight">
              {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')}
            </span>
            <span className="text-[10px] sm:text-[11px] text-amber-300 font-extrabold uppercase tracking-wider">
              {t('studentPortal', 'የተማሪዎች ፖርታል')}
            </span>
          </div>
        </Link>

        {/* Right Top Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick QR ID Badge Button */}
          <button
            onClick={handleOpenQrModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-xs min-h-[38px] cursor-pointer active:scale-95"
            title={isAmharic ? 'የእኔ QR ባጅ (My QR Badge)' : 'My QR Attendance Badge'}
          >
            <QrCode className="w-4 h-4" />
            <span className="hidden sm:inline">{isAmharic ? 'የእኔ QR ባጅ' : 'My QR'}</span>
          </button>

          <LanguageToggle className="bg-white/10 text-white border-white/20 hover:bg-white/20 min-h-[38px]" />
          <ThemeToggle className="bg-white/10 text-white border-white/20 hover:bg-white/20 min-h-[38px] min-w-[38px]" />

          {/* Role Switcher to Admin if user has delegated staff/admin duties */}
          {(['admin', 'superadmin', 'department_admin', 'staff'].includes(user?.role?.toLowerCase()) ||
            (Array.isArray(user?.roles) && user.roles.some((r) => ['admin', 'superadmin', 'department_admin', 'staff'].includes(r?.toLowerCase()))) ||
            (Array.isArray(user?.permissions) && user.permissions.length > 0)) && (
            <a
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 border border-amber-400 text-xs font-black transition-all shadow-xs min-h-[38px]"
              title={t('switchToAdmin', 'ወደ አስተዳዳሪ ክፍል ይቀይሩ (Switch to Admin Portal)')}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('adminPortalLink', 'የአስተዳደር ክፍል')}</span>
            </a>
          )}

          {/* User Profile Pill */}
          <Link
            to="/dashboard/profile"
            onClick={handleTabClick}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all text-xs font-semibold min-h-[38px]"
            title={t('myProfile', 'የግል መረጃ ይመልከቱ')}
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
            title={t('logout', 'ከሲስተሙ ውጣ')}
          >
            <span className="hidden sm:inline">{t('logout', 'ውጣ')}</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 flex-1 w-full">
        {/* Consolidated 4-Category Navigation Tabs (Desktop & Tablet) */}
        <nav className="hidden md:flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-xs border border-slate-200/80 dark:border-slate-800 items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-none transition-colors">
          {navItems.map((item) => (
            item.isExternal ? (
              <a
                key={item.path}
                href={item.path}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 flex items-center gap-2 whitespace-nowrap select-none min-h-[40px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-500/30 shadow-xs"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={handleTabClick}
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
            )
          ))}
        </nav>

        {/* Dynamic Outlet / Main Body */}
        <main className="w-full">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Floating Bottom Navigation Dock (Optimized for Telegram Mini App) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-3 py-2 flex items-center justify-around shadow-2xl">
        <NavLink
          to="/dashboard"
          end
          onClick={handleTabClick}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <Home className="w-5 h-5" />
          <span>{isAmharic ? 'መነሻ' : 'Home'}</span>
        </NavLink>

        <NavLink
          to="/dashboard/courses"
          onClick={handleTabClick}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <BookOpen className="w-5 h-5" />
          <span>{isAmharic ? 'ትምህርቶች' : 'Courses'}</span>
        </NavLink>

        {/* Center Floating Gold QR Button */}
        <button
          onClick={handleOpenQrModal}
          className="relative -top-4 w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/30 flex flex-col items-center justify-center border-2 border-slate-900 active:scale-95 transition-transform cursor-pointer"
          title={isAmharic ? 'የእኔ QR ባጅ' : 'My QR'}
        >
          <QrCode className="w-6 h-6" />
        </button>

        <NavLink
          to="/dashboard/attendance"
          onClick={handleTabClick}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <CalendarCheck className="w-5 h-5" />
          <span>{isAmharic ? 'ክትትል' : 'Attendance'}</span>
        </NavLink>

        <NavLink
          to="/dashboard/profile"
          onClick={handleTabClick}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 text-[10px] font-bold transition-colors ${
              isActive ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <User className="w-5 h-5" />
          <span>{isAmharic ? 'ማህደር' : 'Profile'}</span>
        </NavLink>
      </div>

      {/* Digital QR Attendance Pass Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 text-white text-center relative shadow-2xl space-y-5">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isAmharic ? 'የተማሪ ይፋዊ ዲጂታል መታወቂያ' : 'Student Attendance ID Pass'}</span>
              </div>
              <h3 className="text-xl font-black text-white">{studentName}</h3>
              <p className="text-xs text-amber-300/90 font-mono font-bold tracking-wide">
                {studentId || user?.phone || 'STU-ACTIVE'}
              </p>
            </div>

            {/* High-Contrast QR Code */}
            <div className="p-4 bg-white rounded-2xl shadow-inner inline-block mx-auto border-2 border-amber-400/40">
              <QRCodeSVG
                value={studentId || user?.phone || String(user?._id || 'SUNDAY-STUDENT')}
                size={210}
                level="H"
                includeMargin={false}
              />
            </div>

            <div className="bg-slate-800/60 rounded-2xl p-3 text-xs text-slate-300 text-left space-y-1 border border-slate-700/50">
              <p className="font-bold text-amber-300 flex items-center gap-1.5">
                <span>💡</span>
                <span>{isAmharic ? 'ጠቃሚ ማሳሰቢያ' : 'Notice:'}</span>
              </p>
              <p className="leading-relaxed text-[11px] text-slate-300">
                {isAmharic
                  ? 'ይህን QR ኮድ ስክሪንሽት በማድረግ ወይም በማተም ለሰንበት ት/ቤት መግቢያና ለዕለታዊ ክትትል መጠቀም ይችላሉ። ሁልጊዜ በሲስተሙ መግባት አይጠበቅብዎትም።'
                  : 'You can screenshot or print this QR code for daily gate attendance. Logging into the system every time is not required.'}
              </p>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                window.print();
              }}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{isAmharic ? 'ባጁን አትም / Print Badge' : 'Print Badge'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLayout;