import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import useAuthStore from '../../store/authStore';
import ChurchLogo from '../../assets/ChurchLogo.png';

const allNavSections = [
  {
    id: 'CORE',
    title: 'Core & Church Administration',
    items: [
      { path: '/admin', label: 'Overview', icon: '🏠', end: true },
      { path: '/admin/people', label: 'People', icon: '👥' },
      { path: '/admin/departments', label: 'Departments', icon: '🏛️' },
      { path: '/admin/department-memberships', label: 'Memberships', icon: '🔗' },
      { path: '/admin/church-memberships', label: 'Church Memberships', icon: '⛪' },
      { path: '/admin/users', label: 'Users & Roles', icon: '👤' },
      { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
      { path: '/admin/announcements', label: 'Announcements', icon: '📢' },
      { path: '/admin/password-resets', label: 'Password Resets', icon: '🔑' },
      { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
      { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
      { path: '/admin/complaints', label: 'Complaints', icon: '⚠️' },
    ],
  },
  {
    id: 'EDUCATION',
    title: 'Education Module (Sunday School)',
    items: [
      { path: '/admin/distance-hub', label: 'Distance LMS Hub', icon: '🌐' },
      { path: '/admin/programs', label: 'Programs', icon: '📘' },
      { path: '/admin/academic-years', label: 'Academic Years', icon: '📅' },
      { path: '/admin/student-profiles', label: 'Student Profiles', icon: '🎓' },
      { path: '/admin/academic-enrollments', label: 'Enrollments', icon: '📝' },
      { path: '/admin/manual-enrollment', label: 'Manual Enrollment', icon: '✍️' },
      { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
      { path: '/admin/add-student', label: 'Add Student', icon: '🧑‍🎓' },
      { path: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
      { path: '/admin/add-teacher', label: 'Add Teacher', icon: '➕' },
      { path: '/admin/classes', label: 'Classes', icon: '🏫' },
      { path: '/admin/courses', label: 'Courses', icon: '📚' },
      { path: '/admin/attendance-reports', label: 'Attendance', icon: '📊' },
      { path: '/admin/qr-scanner', label: 'QR Scanner', icon: '📷' },
      { path: '/admin/resources', label: 'Resources', icon: '📄' },
      { path: '/admin/resource-approval', label: 'Resource Approval', icon: '✅' },
      { path: '/admin/certificates', label: 'Certificates', icon: '🎓' },
      { path: '/admin/reports', label: 'Reports', icon: '📈' },
      { path: '/admin/registrations', label: 'Registrations', icon: '📋' },
    ],
  },
];

const AdminLayout = ({ onLogout }) => {
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
      // If department admin for education or general
      return section.id === 'EDUCATION';
    }
    if (activeScope === 'ALL') return true;
    return section.id === activeScope;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-blue-950/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--brand-blue-dark)] text-white border-r border-white/10 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
      >
        {/* Sidebar Header with Official Church Logo */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0 bg-black/20">
          <div className="relative w-12 h-12 flex-shrink-0">
            <div className="absolute inset-0 rounded-full bg-amber-400 blur-sm opacity-60"></div>
            <div className="relative w-full h-full p-1 rounded-full bg-white border border-amber-400 flex items-center justify-center overflow-hidden shadow-md">
              <img src={ChurchLogo} alt="Logo" className="w-full h-full object-contain" />
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

        {/* Super Admin Module Filter Switcher */}
        {isSuperAdmin && (
          <div className="px-3 pt-3 pb-1 shrink-0 border-b border-white/5">
            <div className="bg-black/20 p-1 rounded-xl flex gap-1 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setActiveScope('ALL')}
                className={`flex-1 py-1 rounded-lg transition-all text-center ${activeScope === 'ALL'
                    ? 'bg-[var(--brand-yellow)] text-slate-950 shadow-sm font-bold'
                    : 'text-blue-200 hover:text-white'
                  }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setActiveScope('EDUCATION')}
                className={`flex-1 py-1 rounded-lg transition-all text-center ${activeScope === 'EDUCATION'
                    ? 'bg-[var(--brand-yellow)] text-slate-950 shadow-sm font-bold'
                    : 'text-blue-200 hover:text-white'
                  }`}
              >
                🎓 Education
              </button>
              <button
                type="button"
                onClick={() => setActiveScope('CORE')}
                className={`flex-1 py-1 rounded-lg transition-all text-center ${activeScope === 'CORE'
                    ? 'bg-[var(--brand-yellow)] text-slate-950 shadow-sm font-bold'
                    : 'text-blue-200 hover:text-white'
                  }`}
              >
                🏛️ Core
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Nav Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-6">
          {visibleSections.map((section) => (
            <div key={section.id}>
              <p className="px-3 text-[11px] font-bold text-amber-400/90 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <span>{section.title}</span>
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                        ? 'bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)] shadow-sm border border-[var(--brand-yellow)]/30 font-semibold'
                        : 'text-blue-100 hover:bg-white/10 hover:text-white border border-transparent'
                      }`
                    }
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-white/10 bg-white/5 shrink-0 flex items-center justify-between">
          <div className="text-[11px] text-blue-200 font-medium">
            {user?.role === 'superadmin' ? '👑 Full Control' : '🛡️ Scoped Access'}
          </div>
          <button
            onClick={handleLogout}
            className="text-[11px] text-rose-300 hover:text-rose-100 font-semibold flex items-center gap-1"
          >
            Logout ➔
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors"
              aria-label="Open Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-800 hidden sm:block">
                Church Management System
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${user?.role === 'superadmin'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                {user?.role === 'superadmin' ? '👑 Super Admin' : user?.role || 'Admin'}
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:text-red-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <span>Logout</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
          <div className="animate-in fade-in duration-300">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;