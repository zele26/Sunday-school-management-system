import React, { useState } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const ResourcesManagement = () => {
  const [resources, setResources] = useState([]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">የመጽሐፍትና ዲጂታል ግብአቶች (Resources)</h2>
          <p className="text-xs text-slate-500 mt-1">የዲጂታል መጽሐፍትን እና የትምህርት መረጃዎችን እዚህ ያስተዳድሩ።</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          + ግብአት ጫን (Upload Resource)
        </button>
      </div>

      {resources.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
          ምንም የተጫኑ ግብአቶች የሉም። (No resources uploaded yet.)
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((item, idx) => (
            <div key={idx} className="p-4 border rounded-xl flex justify-between items-center">
              <span>{item.title}</span>
              <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-600 font-semibold text-xs">
                አውርድ (Download)
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourcesManagement;