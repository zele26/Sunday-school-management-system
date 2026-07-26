// src/features/admin/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/admin', label: 'Overview', icon: '🏠', end: true },
  { path: '/admin/users', label: 'Users', icon: '👤' },
  { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
  { path: '/admin/add-student', label: 'Add Student', icon: '🧑‍🎓' },   // <-- NEW
  { path: '/admin/classes', label: 'Classes', icon: '🏫' },
  { path: '/admin/courses', label: 'Courses', icon: '📚' },
  { path: '/admin/announcements', label: 'Announcements', icon: '📢' },
  { path: '/admin/resources', label: 'Resources', icon: '📄' },
  //{ path: '/admin/attendance', label: 'Attendance', icon: '📝' },
  { path: '/admin/reports', label: 'Reports', icon: '📊' },
  { path: '/admin/complaints', label: 'Complaints', icon: '⚠️' },
  { path: '/admin/certificates', label: 'Certificates', icon: '🎓' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
  { path: '/admin/students', label: 'Students', icon: '👨‍🎓' },
  { path: '/admin/qr-scanner', label: 'QR Scanner', icon: '📷' },
  { path: '/admin/attendance-reports', label: 'Attendance', icon: '📊' },
  { path: '/admin/registrations', label: 'Registrations', icon: '📋' },
  { path: '/admin/add-teacher', label: 'Add Teacher', icon: '👨‍🏫' },
];

const AdminLayout = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      localStorage.clear();
    }
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Banner Header */}
      <header className="bg-blue-600 text-white p-6 shadow-md flex justify-between items-center rounded-b-2xl mx-4 mt-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Control Center</h1>
          <p className="text-sm text-blue-100 mt-1">
            Navigate each administration area through its own dedicated page.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="bg-white text-blue-600 px-4 py-2 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-sm cursor-pointer"
        >
          Logout
        </button>
      </header>

      {/* Main Grid Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <aside className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
            Admin Pages
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Dynamic Outlet Area for Sub-pages */}
        <main className="md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;