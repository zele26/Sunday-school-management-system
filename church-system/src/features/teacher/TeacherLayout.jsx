// src/features/teacher/TeacherLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const TeacherLayout = ({ onLogout }) => {
  const teacherName = localStorage.getItem('userName') || 'kasahun';

  const navItems = [
    { label: 'አጠቃላይ እይታ (Overview)', path: '/teacher', end: true },
    { label: 'ክፍሎች (Classes)', path: '/teacher/classes' },
    { label: 'ኮርሶች (Courses)', path: '/teacher/courses' },
    { label: 'ይዘት እና ፈተናዎች (Content)', path: '/teacher/content' },
    { label: 'ውጤት መስጫ (Grading)', path: '/teacher/grading' },
    { label: 'ግንኙነት (Communication)', path: '/teacher/communication' },
    { label: 'ሪፖርቶች (Reports)', path: '/teacher/reports' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      {/* Top Navigation Bar */}
      <header className="bg-blue-900 text-white px-6 py-3 flex justify-between items-center shadow-md">
        <h1 className="text-base font-bold italic">ተክለሃይማኖት መምህራን መድረክ (Teachers Portal)</h1>
        <button
          onClick={onLogout}
          className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-1.5 rounded-md transition"
        >
          ይውጡ (Logout)
        </button>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Welcome Banner */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="text-4xl bg-yellow-100 p-3 rounded-2xl">👨‍🏫</div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              እንኳን ደህና መጡ፣ መምህር {teacherName}!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              ክፍሎችን፣ የትምህርት ቄሳርነቶችን፣ ፈተናዎችን፣ መገኘት እና ግንኙነቶችን ከአንድ ቦታ ያደራጁ።
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
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

        {/* Dynamic Sub-Module Output */}
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;