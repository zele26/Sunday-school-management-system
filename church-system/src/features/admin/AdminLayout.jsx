'use client';

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Link2,
  Church,
  UserCheck,
  CheckCircle2,
  Bell,
  KeyRound,
  Settings,
  ClipboardList,
  AlertTriangle,
  Globe,
  BookOpen,
  Calendar,
  GraduationCap,
  UserPlus,
  School,
  BarChart3,
  QrCode,
  FileText,
  Award,
  LogOut,
  Menu,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';
import ErrorBoundary from '../../components/ErrorBoundary';
import useAuthStore from '../../store/authStore';
import ChurchLogo from '../../assets/ChurchLogo.png';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Badge } from '../../components/ui/Badge';

const allNavSections = [
  {
    id: 'CORE',
    title: 'Core & Church Administration',
    items: [
      { path: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
      { path: '/admin/people', label: 'People', icon: Users },
      { path: '/admin/departments', label: 'Departments', icon: Building2 },
      { path: '/admin/department-memberships', label: 'Memberships', icon: Link2 },
      { path: '/admin/church-memberships', label: 'Church Memberships', icon: Church },
      { path: '/admin/users', label: 'Users & Roles', icon: UserCheck },
      { path: '/admin/approvals', label: 'Approvals', icon: CheckCircle2 },
      { path: '/admin/announcements', label: 'Announcements', icon: Bell },
      { path: '/admin/password-resets', label: 'Password Resets', icon: KeyRound },
      { path: '/admin/settings', label: 'Settings', icon: Settings },
      { path: '/admin/audit-logs', label: 'Audit Logs', icon: ClipboardList },
      { path: '/admin/complaints', label: 'Complaints', icon: AlertTriangle },
    ],
  },
  {
    id: 'EDUCATION',
    title: 'Education Module (Sunday School)',
    items: [
      { path: '/admin/distance-hub', label: 'Distance LMS Hub', icon: Globe },
      { path: '/admin/programs', label: 'Programs', icon: BookOpen },
      { path: '/admin/academic-years', label: 'Academic Years', icon: Calendar },
      { path: '/admin/student-profiles', label: 'Student Profiles', icon: GraduationCap },
      { path: '/admin/academic-enrollments', label: 'Enrollments', icon: ClipboardList },
      { path: '/admin/manual-enrollment', label: 'Manual Enrollment', icon: UserPlus },
      { path: '/admin/students', label: 'Students', icon: Users },
      { path: '/admin/add-student', label: 'Add Student', icon: UserPlus },
      { path: '/admin/teachers', label: 'Teachers', icon: Users },
      { path: '/admin/add-teacher', label: 'Add Teacher', icon: UserPlus },
      { path: '/admin/classes', label: 'Classes', icon: School },
      { path: '/admin/courses', label: 'Courses', icon: BookOpen },
      { path: '/admin/attendance-reports', label: 'Attendance', icon: BarChart3 },
      { path: '/admin/qr-scanner', label: 'QR Scanner', icon: QrCode },
      { path: '/admin/resources', label: 'Resources', icon: FileText },
      { path: '/admin/resource-approval', label: 'Resource Approval', icon: CheckCircle2 },
      { path: '/admin/certificates', label: 'Certificates', icon: Award },
      { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
      { path: '/admin/registrations', label: 'Registrations', icon: ClipboardList },
    ],
  },
];

const AdminLayout = ({ children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isSuperAdmin = user?.role === 'superadmin' || user?.role === 'admin';
  const isDeptAdmin = user?.role === 'department_admin';

  // Department filter scope (Super Admin can switch; Dept Admin is locked to their domain)
  const [activeScope, setActiveScope] = useState('ALL');

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileSidebarOpen]);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
    }
    navigate('/', { replace: true });
  };

  // Determine which sections to render based on user role and selected scope
  const visibleSections = allNavSections.filter((section) => {
    if (isDeptAdmin) {
      return section.id === 'EDUCATION';
    }
    if (activeScope === 'ALL') return true;
    return section.id === activeScope;
  });

  return (
    <div className="min-h-screen bg-[var(--surface-page)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-[#124796] via-[#0e3b7d] to-[#08224d] text-white border-r border-blue-900/40 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-lg ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header with Official Church Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-black/10">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex-shrink-0">
              <div className="relative w-full h-full p-1 rounded-full bg-white border border-amber-400 flex items-center justify-center overflow-hidden shadow-sm">
                <img src={ChurchLogo?.src || ChurchLogo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="min-w-0">
              <span className="text-sm font-extrabold tracking-tight text-white block leading-tight truncate">
                {user?.role === 'superadmin'
                  ? 'Super Admin Center'
                  : user?.role === 'department_admin'
                    ? 'Dept Admin Portal'
                    : 'Admin Portal'}
              </span>
              <div className="text-[11px] text-amber-300 font-bold truncate">
                ተክለ ሳዊሮስ ሰንበት ት/ቤት
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-300 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Super Admin Module Filter Switcher */}
        {isSuperAdmin && (
          <div className="px-3 pt-3 pb-1 shrink-0 border-b border-white/10">
            <div className="bg-black/20 p-1 rounded-xl flex gap-1 text-[11px] font-semibold border border-white/5">
              <button
                type="button"
                onClick={() => setActiveScope('ALL')}
                className={`flex-1 py-1 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                  activeScope === 'ALL'
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>All</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveScope('EDUCATION')}
                className={`flex-1 py-1 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                  activeScope === 'EDUCATION'
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3 h-3" />
                <span>Edu</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveScope('CORE')}
                className={`flex-1 py-1 rounded-lg transition-all text-center flex items-center justify-center gap-1 ${
                  activeScope === 'CORE'
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-black'
                    : 'text-blue-100 hover:text-white'
                }`}
              >
                <Church className="w-3 h-3" />
                <span>Core</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Nav Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-6">
          {visibleSections.map((section) => (
            <div key={section.id}>
              <p className="px-3 text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>{section.title}</span>
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                            : 'text-blue-50 hover:bg-white/10 hover:text-white border border-transparent'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 bg-black/10 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-blue-100 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{user?.role === 'superadmin' ? 'Full Control' : 'Scoped Access'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] text-rose-200 hover:text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Logout</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden focus:outline-none transition-colors"
              aria-label="Open Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-extrabold text-slate-800 dark:text-white hidden sm:block">
                Church Management System
              </h1>
              <Badge variant={user?.role === 'superadmin' ? 'gold' : 'active'} size="sm">
                {user?.role === 'superadmin' ? '👑 Super Admin' : user?.role || 'Admin'}
              </Badge>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 transition-colors shadow-sm focus:outline-none"
            >
              <span>Logout</span>
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Page Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
          <ErrorBoundary>
            {children || <Outlet />}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;