// src/features/student/StudentAttendance.jsx
import React from 'react';

const StudentAttendance = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">የመገኘት መዝገብ (Attendance History)</h2>
      </div>
      <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
        ምንም የመገኘት መዝገብ አልተገኘም።
      </div>
    </div>
  );
};

export default StudentAttendance;