// src/features/student/StudentLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const StudentLayout = ({ onLogout }) => {
  const studentName = localStorage.getItem('userName') || 'ተማሪ';

  const navItems = [
    { label: 'መነሻ ገጽ (Dashboard)', path: '/dashboard', end: true },
    { label: 'የኔ ኮርሶች (My Courses)', path: '/dashboard/courses' },
    { label: 'የመገኘት ሁኔታ (Attendance)', path: '/dashboard/attendance' },
    { label: 'ማስታወቂያዎች (Announcements)', path: '/dashboard/announcements' },
    { label: 'የግል መረጃ (Profile)', path: '/dashboard/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <header className="bg-slate-900 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <h1 className="text-base font-bold italic">የተማሪዎች ፖርታል (Student Portal)</h1>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition"
        >
          ይውጡ (Logout)
        </button>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="text-4xl bg-blue-100 p-3 rounded-2xl">🎓</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">ሰላም፣ {studentName}!</h2>
            <p className="text-xs text-slate-500 mt-1">የሰንበት ትምህርት ቤት ትምህርቶችዎን እና እንቅስቃሴዎችዎን ይከታተሉ።</p>
          </div>
        </div>

        <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;