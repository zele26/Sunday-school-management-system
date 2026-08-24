// import React, { useState, useEffect } from 'react';
// import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
// import ErrorBoundary from '../../components/ErrorBoundary';

// const navItems = [
//   { path: '/admin', label: 'Overview', icon: '🏠', end: true },
//   { path: '/admin/users', label: 'Users', icon: '👤' },
//   { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
//   { path: '/admin/add-student', label: 'Add Student', icon: '🧑‍🎓' },
//   { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },   // moved up
//   { path: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },   // ✅ NEW
//   { path: '/admin/add-teacher', label: 'Add Teacher', icon: '👨‍🏫' },
//   { path: '/admin/classes', label: 'Classes', icon: '🏫' },
//   { path: '/admin/courses', label: 'Courses', icon: '📚' },
//   { path: '/admin/announcements', label: 'Announcements', icon: '📢' },
//   { path: '/admin/resources', label: 'Resources', icon: '📄' },
//   { path: '/admin/resource-approval', label: 'Resource Approval', icon: '✅' },
//   // { path: '/admin/attendance', label: 'Attendance', icon: '📝' },
//   { path: '/admin/reports', label: 'Reports', icon: '📊' },
//   { path: '/admin/complaints', label: 'Complaints', icon: '⚠️' },
//   { path: '/admin/certificates', label: 'Certificates', icon: '🎓' },
//   { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
//   { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
//   { path: '/admin/qr-scanner', label: 'QR Scanner', icon: '📷' },
//   { path: '/admin/attendance-reports', label: 'Attendance', icon: '📊' },
//   { path: '/admin/registrations', label: 'Registrations', icon: '📋' },
//   { path: '/admin/password-resets', label: 'Password Resets', icon: '🔑' },
// ];

// const AdminLayout = ({ onLogout }) => {
// const navigate = useNavigate();
// const location = useLocation();
// const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

// // Close mobile sidebar automatically when navigating to a new route
// useEffect(() => {
// setIsMobileSidebarOpen(false);
// }, [location]);

// // Lock body scroll when mobile menu is open
// useEffect(() => {
// if (isMobileSidebarOpen) {
// document.body.style.overflow = 'hidden';
// } else {
// document.body.style.overflow = 'unset';
// }
// }, [isMobileSidebarOpen]);

// const handleLogout = () => {
// if (onLogout) {
// onLogout();
// } else {
// localStorage.clear();
// }
// navigate('/', { replace: true });
// };

// return (
// <div>

//   {/* Mobile Overlay - Darkens background when sidebar is open */}
//   {isMobileSidebarOpen && (
//     <div 
//       className="fixed inset-0 bg-blue-950/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
//       onClick={() => setIsMobileSidebarOpen(false)}
//     />
//   )}

//   {/* Sidebar Navigation */}
//   <aside 
//     className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--brand-blue-dark)] text-white border-r border-white/10 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
//       isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
//     }`}
//   >
//     {/* Sidebar Header */}
//     <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
//       <div className="flex items-center gap-3 text-[var(--brand-yellow)]">
//         <span className="bg-white/10 p-1.5 rounded-lg text-lg">🛡️</span>
//         <span className="text-lg font-bold tracking-tight">Admin Center</span>
//       </div>
//     </div>

//     {/* Scrollable Nav Links */}
//     <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-1">
//       <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
//         Main Menu
//       </p>
      
//       {navItems.map((item) => (
//         <NavLink
//           key={item.path}
//           to={item.path}
//           end={item.end}
//           className={({ isActive }) =>
//             `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
//               isActive
//                 ? 'bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)] shadow-sm border border-[var(--brand-yellow)]/30'
//                 : 'text-blue-100 hover:bg-white/10 hover:text-white border border-transparent'
//             }`
//           }
//         >
//           <span className="text-lg">{item.icon}</span>
//           <span>{item.label}</span>
//         </NavLink>
//       ))}
//     </div>

//     {/* Sidebar Footer (Optional styling area) */}
//     <div className="p-4 border-t border-white/10 bg-white/10 shrink-0">
//       <div className="text-xs text-center text-blue-100">
//         v1.0.0 Dashboard
//       </div>
//     </div>
//   </aside>

//   {/* Main Content Wrapper (Shifts right on desktop to accommodate sidebar) */}
//   <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
    
//     {/* Top Header */}
//     <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      
//       <div className="flex items-center gap-4">
//         {/* Mobile Hamburger Button */}
//         <button
//           onClick={() => setIsMobileSidebarOpen(true)}
//           className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors"
//           aria-label="Open Sidebar"
//         >
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
//           </svg>
//         </button>
        
//         {/* Dynamic Page Context (Optional text) */}
//         <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
//           Dashboard Overview
//         </h1>
//       </div>

//       {/* Header Actions */}
//       <div className="flex items-center gap-3">
//         <button
//           type="button"
//           onClick={handleLogout}
//           className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 hover:text-red-600 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
//         >
//           <span>Logout</span>
//           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
//           </svg>
//         </button>
//       </div>
//     </header>

//     {/* Dynamic Page Content Area */}
//     <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto overflow-x-hidden">
//       {/* A subtle fade-in animation for page transitions */}
//       <div className="animate-in fade-in duration-300">
//         <ErrorBoundary>
//           <Outlet />
//         </ErrorBoundary>
//       </div>
//     </main>

//   </div>

// </div>


// );
// };

// export default AdminLayout;



import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';

const navItems = [
  { path: '/admin', label: 'Overview', icon: '🏠', end: true },
  { path: '/admin/people', label: 'People', icon: '👥' },
  { path: '/admin/departments', label: 'Departments', icon: '🏛️' },
  { path: '/admin/department-memberships', label: 'Memberships', icon: '🔗' },
  { path: '/admin/users', label: 'Users', icon: '👤' },
  { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
  { path: '/admin/add-student', label: 'Add Student', icon: '🧑‍🎓' },
  { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
  { path: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
  { path: '/admin/add-teacher', label: 'Add Teacher', icon: '👨‍🏫' },
  { path: '/admin/classes', label: 'Classes', icon: '🏫' },
  { path: '/admin/courses', label: 'Courses', icon: '📚' },
  { path: '/admin/announcements', label: 'Announcements', icon: '📢' },
  { path: '/admin/resources', label: 'Resources', icon: '📄' },
  { path: '/admin/resource-approval', label: 'Resource Approval', icon: '✅' },
  { path: '/admin/reports', label: 'Reports', icon: '📊' },
  { path: '/admin/complaints', label: 'Complaints', icon: '⚠️' },
  { path: '/admin/certificates', label: 'Certificates', icon: '🎓' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
  { path: '/admin/qr-scanner', label: 'QR Scanner', icon: '📷' },
  { path: '/admin/attendance-reports', label: 'Attendance', icon: '📊' },
  { path: '/admin/registrations', label: 'Registrations', icon: '📋' },
  { path: '/admin/password-resets', label: 'Password Resets', icon: '🔑' },
  { path: '/admin/student-profiles', label: 'Student Profiles', icon: '🎓' },
  { path: '/admin/programs', label: 'Programs', icon: '📘' },
  { path: '/admin/academic-years', label: 'Academic Years', icon: '📅' },
  { path: '/admin/academic-enrollments', label: 'Enrollments', icon: '📝' },
  { path: '/admin/manual-enrollment', label: 'Manual Enrollment', icon: '📝' },
];

const AdminLayout = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

  return (
    <div>
      {/* Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-blue-950/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--brand-blue-dark)] text-white border-r border-white/10 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 text-[var(--brand-yellow)]">
            <span className="bg-white/10 p-1.5 rounded-lg text-lg">🛡️</span>
            <span className="text-lg font-bold tracking-tight">Admin Center</span>
          </div>
        </div>

        {/* Scrollable Nav Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </p>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[var(--brand-yellow)]/20 text-[var(--brand-yellow)] shadow-sm border border-[var(--brand-yellow)]/30'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white border border-transparent'
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-white/10 shrink-0">
          <div className="text-xs text-center text-blue-100">
            v1.0.0 Dashboard
          </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors"
              aria-label="Open Sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">
              Dashboard Overview
            </h1>
          </div>

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