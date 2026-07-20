// src/features/teacher/TeacherReports.jsx
import React from 'react';

const TeacherReports = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">የመምህራን ሪፖርት (Teacher Reports)</h2>
        <p className="text-xs text-slate-500 mt-1">የክፍል መገኘት እና የውጤት ሪፖርቶችን ያውጡ።</p>
      </div>
      <div className="flex gap-3">
        <button className="bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-900 transition">
          የመገኘት ሪፖርት (PDF)
        </button>
        <button className="bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-slate-900 transition">
          የውጤት ሪፖርት (Excel)
        </button>
      </div>
    </div>
  );
};

export default TeacherReports;