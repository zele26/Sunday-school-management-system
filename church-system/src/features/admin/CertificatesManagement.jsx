import React from 'react';

const CertificatesManagement = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">የምስክር ወረቀቶች (Certificates)</h2>
          <p className="text-xs text-slate-500 mt-1">ትምህርታቸውን ላጠናቀቁ ተማሪዎች ምስክር ወረቀት ያዘጋጁ።</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          + ምስክር ወረቀት ስጥ (Issue Certificate)
        </button>
      </div>

      <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
        ምንም የተሰጠ ምስክር ወረቀት የለም። (No certificates issued yet.)
      </div>
    </div>
  );
};

export default CertificatesManagement;