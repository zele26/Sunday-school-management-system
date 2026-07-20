import React from 'react';

const ReportsManagement = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-bold text-slate-800">ሪፖርቶችና ስታቲስቲክስ (Reports & Analytics)</h2>
        <p className="text-xs text-slate-500 mt-1">የሰንበት ትምህርት ቤቱን አጠቃላይ እንቅስቃሴ ሪፖርቶች ይመልከቱ።</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border rounded-xl bg-blue-50/50 border-blue-100">
          <p className="text-xs font-semibold text-blue-600 uppercase">አጠቃላይ ተማሪዎች</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">0</p>
        </div>
        <div className="p-4 border rounded-xl bg-emerald-50/50 border-emerald-100">
          <p className="text-xs font-semibold text-emerald-600 uppercase">አጠቃላይ መምህራን</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">0</p>
        </div>
        <div className="p-4 border rounded-xl bg-purple-50/50 border-purple-100">
          <p className="text-xs font-semibold text-purple-600 uppercase">የተጠናቀቁ ኮርሶች</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">0</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsManagement;