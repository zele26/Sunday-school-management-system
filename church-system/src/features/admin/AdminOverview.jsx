import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const quickAccessLinks = [
  { path: '/admin/users', label: 'Users', icon: '👤' },
  { path: '/admin/approvals', label: 'Approvals', icon: '✅' },
  { path: '/admin/classes', label: 'Classes', icon: '🏫' },
  { path: '/admin/courses', label: 'Courses', icon: '📚' },
  { path: '/admin/announcements', label: 'Announcements', icon: '📢' },
  { path: '/admin/resources', label: 'Resources', icon: '📄' },
  { path: '/admin/attendance', label: 'Attendance', icon: '📝' },
  { path: '/admin/reports', label: 'Reports', icon: '📊' },
  { path: '/admin/complaints', label: 'Complaints', icon: '⚠️' },
  { path: '/admin/certificates', label: 'Certificates', icon: '🎓' },
  { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
];

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 3,
    pendingApprovals: 2,
    classes: 2,
    courses: 1,
    activeComplaints: 1,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.warn('Backend endpoint connecting soon, using current local metrics:', err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Users', value: stats.users },
          { label: 'Pending Approvals', value: stats.pendingApprovals },
          { label: 'Classes', value: stats.classes },
          { label: 'Courses', value: stats.courses },
          { label: 'Active Complaints', value: stats.activeComplaints },
        ].map((s, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Access */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-4">Quick access</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickAccessLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:border-blue-500 hover:bg-blue-50/50 hover:text-blue-600 transition-all text-left group"
              >
                <span className="text-lg bg-slate-100 group-hover:bg-blue-100 p-2 rounded-lg transition-colors">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-4">Recent activity</h3>
          <div className="space-y-3">
            <div className="p-3 border border-slate-200 rounded-xl">
              <p className="text-sm font-semibold text-slate-800">Approved teacher account</p>
              <p className="text-xs text-slate-400 mt-0.5">Admin User • 09:20</p>
            </div>
            <div className="p-3 border border-slate-200 rounded-xl">
              <p className="text-sm font-semibold text-slate-800">Assigned teacher to Grade 1A</p>
              <p className="text-xs text-slate-400 mt-0.5">Admin User • 10:05</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;