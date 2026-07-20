import React from 'react';

const ComplaintsManagement = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">ቅሬታዎችና ጥቆማዎች (Complaints)</h2>
        <p className="text-xs text-slate-500 mt-1">ከተማሪዎች እና መምህራን የቀረቡ ቅሬታዎችን ያስተዳድሩ።</p>
      </div>

      <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
        ምንም አዲስ የቀረበ ቅሬታ የለም። (No complaints received.)
      </div>
    </div>
  );
};

export default ComplaintsManagement;