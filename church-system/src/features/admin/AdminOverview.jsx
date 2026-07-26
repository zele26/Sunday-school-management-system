import React, { useEffect, useState } from 'react';
import { useNavigate, MemoryRouter, useInRouterContext } from 'react-router-dom';

const quickAccessLinks = [
  { path: '/admin/users', label: 'ተጠቃሚዎች', icon: '👤' },
  { path: '/admin/approvals', label: 'ማረጋገጫዎች', icon: '✅' },
  { path: '/admin/classes', label: 'ክፍሎች', icon: '🏫' },
  { path: '/admin/courses', label: 'ትምህርቶች', icon: '📚' },
  { path: '/admin/announcements', label: 'ማስታወቂያዎች', icon: '📢' },
  { path: '/admin/resources', label: 'የትምህርት መርጃዎች', icon: '📄' },
  { path: '/admin/attendance', label: 'ክትትል', icon: '📝' },
  { path: '/admin/reports', label: 'ሪፖርቶች', icon: '📊' },
  { path: '/admin/complaints', label: 'ቅሬታዎች', icon: '⚠️' },
  { path: '/admin/certificates', label: 'ምስክር ወረቀቶች', icon: '🎓' },
  { path: '/admin/settings', label: 'መቼቶች', icon: '⚙️' },
  { path: '/admin/audit-logs', label: 'የሲስተም መዝገቦች', icon: '📋' },
];

const AdminOverviewContent = () => {
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
        // Mocking the backend response to ensure the UI compiles and runs smoothly
        await new Promise(resolve => setTimeout(resolve, 500));
        setStats({
          users: 142,
          pendingApprovals: 7,
          classes: 12,
          courses: 5,
          activeComplaints: 0,
        });
      } catch (err) {
        console.warn('የዳሽቦርድ መረጃ አልተገኘም፣ ነባሪ ዋጋዎችን በመጠቀም ላይ:', err);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { 
      label: 'አጠቃላይ ተጠቃሚዎች', 
      value: stats.users, 
      icon: '👥',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'hover:border-blue-200'
    },
    { 
      label: 'የሚጠበቁ ማረጋገጫዎች', 
      value: stats.pendingApprovals, 
      icon: '⏳',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'hover:border-amber-200'
    },
    { 
      label: 'ንቁ ክፍሎች', 
      value: stats.classes, 
      icon: '🏫',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'hover:border-emerald-200'
    },
    { 
      label: 'አጠቃላይ ትምህርቶች', 
      value: stats.courses, 
      icon: '📚',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'hover:border-purple-200'
    },
    { 
      label: 'ያልተፈቱ ቅሬታዎች', 
      value: stats.activeComplaints, 
      icon: '⚠️',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'hover:border-rose-200'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* Top Stat Cards Section */}
      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-4 px-1">የሲስተም አጠቃላይ እይታ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((stat, idx) => (
            <div 
              key={idx} 
              className={`group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md ${stat.border}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Quick Access Links */}
        <div className="xl:col-span-2">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 px-1">ፈጣን መዳረሻ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4">
            {quickAccessLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-0.5 text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors duration-300">
                  {item.icon}
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {item.label}
                  </span>
                  <span className="block text-xs text-slate-400 mt-0.5 group-hover:text-blue-400 transition-colors">
                    {item.label} ያስተዳድሩ
                  </span>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-blue-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="xl:col-span-1">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 px-1">የቅርብ ጊዜ እንቅስቃሴዎች</h3>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full max-h-[500px] overflow-y-auto custom-scrollbar">
            
            <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
              
              {/* Activity Item 1 */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-tight">የመምህር አካውንት ጸድቋል</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">ሲስተም አድሚን</span>
                  <span className="text-xs text-slate-400">03:20 ጠዋት</span>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="relative pl-6">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-tight">መምህር ለ1ኛ 'ሀ' ክፍል ተመድቧል</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">ሲስተም አድሚን</span>
                  <span className="text-xs text-slate-400">04:05 ጠዋት</span>
                </div>
              </div>

              {/* Empty state visual filler for the timeline */}
              <div className="relative pl-6 pt-4 opacity-50">
                <div className="absolute -left-[9px] top-5 w-4 h-4 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                </div>
                <p className="text-sm italic text-slate-400">የቅርብ ጊዜ እንቅስቃሴዎች መጨረሻ</p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

const AdminOverview = () => {
  // Safe-guard to allow the component to be previewed in isolation without crashing
  const inRouterContext = useInRouterContext();
  
  if (!inRouterContext) {
    return (
      <MemoryRouter>
        <AdminOverviewContent />
      </MemoryRouter>
    );
  }
  
  return <AdminOverviewContent />;
};


import { apiFetch } from '../../api/apiClient';

// Temporary function – remove after use
const fixSparseIndexes = async () => {
  try {
    const res = await apiFetch('/api/admin/fix-sparse-indexes', { method: 'POST' });
    const data = await res.json();
    alert(data.message || 'Indexes fixed');
  } catch (err) {
    alert('Network error');
  }
};

// JSX button
<div className="flex justify-end mt-4">
  <button
    onClick={fixSparseIndexes}
    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-semibold"
  >
    🔧 Fix Sparse Indexes
  </button>
</div>

export default AdminOverview;