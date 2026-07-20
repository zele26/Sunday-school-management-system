// src/features/student/StudentProfileModule.jsx
import React from 'react';

const StudentProfileModule = () => {
  const userName = localStorage.getItem('userName') || 'ተማሪ';
  const userRole = localStorage.getItem('userRole') || 'student';

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">የግል መረጃ (Student Profile)</h2>
      </div>
      <div className="space-y-3 text-xs text-slate-600">
        <p><strong className="text-slate-800">ስም:</strong> {userName}</p>
        <p><strong className="text-slate-800">ሚና (Role):</strong> {userRole}</p>
      </div>
    </div>
  );
};

export default StudentProfileModule;