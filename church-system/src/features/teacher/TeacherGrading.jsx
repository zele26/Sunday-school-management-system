// src/features/teacher/TeacherGrading.jsx
import React from 'react';

const TeacherGrading = () => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">ውጤት መስጫ (Grading Center)</h2>
        <p className="text-xs text-slate-500 mt-1">የተማሪዎችን ፈተና እና የቤት ሥራ ውጤቶች ያስገቡ።</p>
      </div>
      <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
        ለውጤት አሰጣጥ የተላከ የቤት ሥራ የለም።
      </div>
    </div>
  );
};

export default TeacherGrading;