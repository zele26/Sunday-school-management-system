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
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import useAuthStore from '../../store/authStore';
import ChurchLogo from '../../assets/ChurchLogo.png';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { useLanguage } from '../../hooks/useLanguage';
import { useTelegramWebApp } from '../../hooks/useTelegramWebApp';
import { hasPermission, PERMISSIONS } from '../../utils/permissions';
import { formatGradeAmharic } from '../../constants/registrationOptions';
import { toast } from '../../utils/toast';

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
  const [isSavingBadge, setIsSavingBadge] = useState(false);

  const handleLogoutClick = () => {
    triggerHaptic('medium');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tg_manual_logout', 'true');
    }
    if (typeof onLogout === 'function') {
      onLogout();
    } else {
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      } else {
        navigate('/');
      }
    }
  };

  const getBadgeCanvas = () => {
    const qrCanvas = document.getElementById('student-qr-canvas');
    if (!qrCanvas) return null;

    const width = 600;
    const height = 860;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Draw Dark Card Background with gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#091024');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#091024');

    // Helper for rounded rectangle
    const drawRoundRect = (x, y, w, h, r, fill, stroke, strokeColor, strokeWidth) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fill();
      }
      if (stroke && strokeColor) {
        ctx.lineWidth = strokeWidth || 2;
        ctx.strokeStyle = strokeColor;
        ctx.stroke();
      }
    };

    // Main Card Outer Body
    drawRoundRect(0, 0, width, height, 32, bgGrad, true, '#f59e0b', 6);

    // Inner subtle frame
    drawRoundRect(14, 14, width - 28, height - 28, 22, null, true, 'rgba(245, 158, 11, 0.3)', 1.5);

    // Header Pill Tag
    drawRoundRect(140, 36, 320, 38, 19, 'rgba(245, 158, 11, 0.15)', true, 'rgba(245, 158, 11, 0.45)', 1.5);
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 15px "Noto Sans Ethiopic", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🛡️ የተማሪ ይፋዊ ዲጂታል መታወቂያ', 300, 61);

    // Church Header
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 23px "Noto Sans Ethiopic", sans-serif';
    ctx.fillText('ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት', 300, 112);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('ST. TEKLE SAWIROS SUNDAY SCHOOL', 300, 134);

    // Student Full Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px "Noto Sans Ethiopic", sans-serif';
    ctx.fillText(studentName, 300, 186);

    // Student ID Tag
    const displayId = studentId || user?.phone || 'STU-ACTIVE';
    drawRoundRect(170, 206, 260, 34, 12, '#020617', true, '#f59e0b', 1.5);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(displayId, 300, 229);

    // Student Grade Label
    const gradeLabel = user?.grade ? (formatGradeAmharic(user.grade) || user.grade) : '';
    if (gradeLabel) {
      ctx.fillStyle = '#93c5fd';
      ctx.font = 'bold 14px "Noto Sans Ethiopic", sans-serif';
      ctx.fillText(gradeLabel, 300, 264);
    }

    // White Box for QR Code
    const qrBoxY = gradeLabel ? 285 : 265;
    drawRoundRect(150, qrBoxY, 300, 300, 24, '#ffffff', true, 'rgba(245, 158, 11, 0.6)', 4);

    // Draw QR image
    ctx.drawImage(qrCanvas, 165, qrBoxY + 15, 270, 270);

    // Notice & Security Box
    const noticeY = qrBoxY + 325;
    drawRoundRect(40, noticeY, 520, 110, 18, 'rgba(30, 41, 59, 0.9)', true, 'rgba(148, 163, 184, 0.25)', 1.5);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#fde68a';
    ctx.font = 'bold 14px "Noto Sans Ethiopic", sans-serif';
    ctx.fillText('💡 ጠቃሚ ማሳሰቢያ / Usage Note:', 60, noticeY + 30);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px "Noto Sans Ethiopic", sans-serif';
    ctx.fillText('• ይህን QR ኮድ በስልክዎ በማስቀመጥ ወይም በማተም ለሰንበት ት/ቤት መግቢያ ይጠቀሙ።', 60, noticeY + 60);
    ctx.fillText('• Keep this digital ID badge on your phone for daily church gate attendance.', 60, noticeY + 86);

    // Bottom Official Seal / Verification
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '11px monospace';
    ctx.fillText('OFFICIAL DIGITAL ATTENDANCE PASS • VERIFIED STUDENT', 300, height - 32);

    return canvas;
  };

  const handleDownloadBadge = async () => {
    triggerHaptic('medium');
    setIsSavingBadge(true);
    try {
      const canvas = getBadgeCanvas();
      if (!canvas) {
        toast.error(isAmharic ? 'የባጅ መረጃ ማግኘት አልተቻለም' : 'Could not generate badge canvas');
        return;
      }

      const fileName = `TekleSawiros-Badge-${studentId || 'student'}.png`;

      // Check if mobile device supports Web Share API with files
      canvas.toBlob(async (blob) => {
        if (!blob) {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = fileName;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success(isAmharic ? 'ባጁ ወደ ስልክዎ ተቀምጧል! 📥' : 'Badge image downloaded! 📥');
          setIsSavingBadge(false);
          return;
        }

        const file = new File([blob], fileName, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: isAmharic ? 'የተማሪ ይፋዊ መታወቂያ' : 'Student Attendance ID Pass',
              text: `${studentName} (${studentId || ''}) - ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት`,
              files: [file],
            });
            toast.success(isAmharic ? 'ባጁ በተሳካ ሁኔታ ተጋርቷል/ተቀምጧል!' : 'Badge shared/saved successfully!');
            setIsSavingBadge(false);
            return;
          } catch (shareErr) {
            if (shareErr.name === 'AbortError') {
              setIsSavingBadge(false);
              return;
            }
          }
        }

        // Standard link download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 2000);

        toast.success(isAmharic ? 'ባጁ ወደ ስልክዎ ተቀምጧል! 📥' : 'Badge image downloaded! 📥');
        triggerHaptic('success');
      }, 'image/png');
    } catch (err) {
      console.error('Error saving badge:', err);
      toast.error(isAmharic ? 'ባጁን ማስቀመጥ አልተቻለም' : 'Failed to save badge image');
    } finally {
      setIsSavingBadge(false);
    }
  };

  const handlePrintBadge = () => {
    triggerHaptic('light');

    // On Telegram Mini App or WebViews where printing is disabled, save directly as image
    if (isTelegram) {
      handleDownloadBadge();
      toast.info(
        isAmharic
          ? 'በቴሌግራም ውስጥ ባጁ በምስል ተቀምጧል። ከስልክ ጋለሪዎ ማተም ይችላሉ።'
          : 'Badge saved as image to your device for printing.'
      );
      return;
    }

    const qrEl = document.getElementById('student-qr-canvas');
    const qrDataUrl = qrEl ? qrEl.toDataURL('image/png') : '';
    const gradeLabel = user?.grade ? (formatGradeAmharic(user.grade) || user.grade) : '';
    const displayId = studentId || user?.phone || 'STU-ACTIVE';

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      // If popup blocked or mobile, fallback to download
      handleDownloadBadge();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student ID Badge - ${studentName}</title>
          <style>
            @page { size: auto; margin: 8mm; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Ethiopic", sans-serif;
              background: #ffffff;
              color: #0f172a;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 16px;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .badge-card {
              width: 330px;
              border: 2px solid #0f172a;
              border-radius: 18px;
              padding: 22px;
              text-align: center;
              box-sizing: border-box;
            }
            .church-name { font-size: 16px; font-weight: 900; margin-bottom: 2px; color: #1e3a8a; }
            .church-sub { font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 12px; }
            .tag { display: inline-block; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 999px; margin-bottom: 12px; }
            .name { font-size: 20px; font-weight: 900; margin-bottom: 4px; color: #0f172a; }
            .id { font-family: monospace; font-size: 14px; font-weight: 800; color: #d97706; margin-bottom: 10px; }
            .grade { font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 14px; }
            .qr-wrap { background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; padding: 10px; display: inline-block; margin-bottom: 14px; }
            .qr-img { width: 210px; height: 210px; display: block; }
            .footer { font-size: 10px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 10px; font-weight: 600; }
            @media print {
              body { padding: 0; }
              .badge-card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="badge-card">
            <div class="church-name">ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት</div>
            <div class="church-sub">St. Tekle Sawiros Sunday School</div>
            <div class="tag">🛡️ የተማሪ ይፋዊ መታወቂያ / Student ID</div>
            <div class="name">${studentName}</div>
            <div class="id">${displayId}</div>
            ${gradeLabel ? '<div class="grade">' + gradeLabel + '</div>' : ''}
            <div class="qr-wrap">
              <img class="qr-img" src="${qrDataUrl}" alt="Student QR Code" />
            </div>
            <div class="footer">ይፋዊ የተማሪ መግቢያ ባጅ • OFFICIAL ATTENDANCE PASS</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 700);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
    { label: isAmharic ? 'አናሊቲክስ' : 'Analytics', path: '/dashboard/analytics', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { label: t('announcements', 'ማስታወቂያዎች'), path: '/dashboard/announcements', icon: <Bell className="w-4 h-4" /> },
    ...(canScanAttendance
      ? [
          {
            label: isAmharic ? 'የQR መቃኛ' : 'QR Scanner',
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
      <header className="bg-[#1e3a8a] dark:bg-slate-900 text-white px-3 sm:px-8 py-2.5 sm:py-3 flex justify-between items-center shadow-md border-b border-blue-900 dark:border-slate-800 sticky top-0 z-30">
        <Link to="/dashboard" onClick={handleTabClick} className="flex items-center space-x-2 sm:space-x-3 space-x-reverse group min-w-0 flex-shrink">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white p-1 border border-amber-400/60 flex items-center justify-center shadow-xs flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
            <Image
              src={ChurchLogo}
              alt="Church Logo"
              width={44}
              height={44}
              style={{ width: 'auto', height: 'auto' }}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-base font-black tracking-tight text-white leading-tight truncate">
              {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')}
            </span>
            <span className="text-[9px] sm:text-[11px] text-amber-300 font-extrabold uppercase tracking-wider truncate">
              {t('studentPortal', 'የተማሪዎች ፖርታል')}
            </span>
          </div>
        </Link>

        {/* Right Top Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <LanguageToggle className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-8 sm:h-9 px-2 sm:px-2.5 text-[11px]" />
          <ThemeToggle className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-8 w-8 sm:h-9 sm:w-9 min-w-[32px] sm:min-w-[36px]" />

          {/* Role Switcher to Admin if user has delegated staff/admin duties */}
          {(['admin', 'superadmin', 'department_admin', 'staff'].includes(user?.role?.toLowerCase()) ||
            (Array.isArray(user?.roles) && user.roles.some((r) => ['admin', 'superadmin', 'department_admin', 'staff'].includes(r?.toLowerCase()))) ||
            (Array.isArray(user?.permissions) && user.permissions.length > 0)) && (
            <a
              href="/admin"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300 border border-amber-400 text-xs font-black transition-all shadow-xs h-8 sm:h-9"
              title={isAmharic ? 'ወደ አስተዳዳሪ ክፍል ይቀይሩ' : 'Switch to Admin Portal'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('adminPortalLink', 'የአስተዳደር ክፍል')}</span>
            </a>
          )}

          {/* Logout Button (Always prominent, clear, and visible) */}
          <button
            onClick={handleLogoutClick}
            className="bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-400/40 hover:border-rose-500 text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer h-8 sm:h-9 flex-shrink-0"
            title={t('logout', 'ከሲስተሙ ውጣ')}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('logout', 'ውጣ')}</span>
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
          title={isAmharic ? 'የእኔ ዲጂታል መታወቂያ' : 'My QR'}
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
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
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
              {user?.grade && (
                <p className="text-[11px] text-blue-300 font-bold">
                  {formatGradeAmharic(user.grade) || user.grade}
                </p>
              )}
            </div>

            {/* High-Contrast QR Code View + Canvas */}
            <div className="p-4 bg-white rounded-2xl shadow-inner inline-block mx-auto border-2 border-amber-400/40">
              <QRCodeCanvas
                id="student-qr-canvas"
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
                  ? 'ይህን የQR ባጅ በስልክዎ በማስቀመጥ ወይም በማተም ለሰንበት ት/ቤት መግቢያና ለዕለታዊ ክትትል መጠቀም ይችላሉ።'
                  : 'Save or print this QR pass for daily church gate attendance. Quick check-in without logging in each time.'}
              </p>
            </div>

            {/* Action Buttons: 1. Save Image (PNG) 2. Print */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleDownloadBadge}
                disabled={isSavingBadge}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSavingBadge ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isAmharic ? '💾 ምስሉን አስቀምጥ' : '💾 Save Badge Image (PNG)'}</span>
              </button>

              <button
                onClick={handlePrintBadge}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isAmharic ? '🖨️ ባጁን አትም' : '🖨️ Print Badge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentLayout;