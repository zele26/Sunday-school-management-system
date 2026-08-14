// src/features/admin/ClassesManagement.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch, API_BASE_URL } from '../../api/apiClient';

const ClassesManagement = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/admin/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setClasses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">የክፍሎች አስተዳደር (Classes Management)</h2>
          <p className="text-xs text-slate-500 mt-1">ክፍሎችን እና የተመደቡ መምህራንን ያስተዳድሩ።</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
          + አዲስ ክፍል (Add Class)
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">በመጫን ላይ ነው...</div>
      ) : classes.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
          ምንም ክፍሎች አልተገኙም። (No classes found.)
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((c) => (
            <div key={c._id || c.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition">
              <h3 className="font-bold text-slate-800">{c.className || c.name}</h3>
              <p className="text-xs text-slate-500 mt-1">መምህር: {c.teacherName || 'አልተመደበም (Unassigned)'}</p>
              <div className="mt-4 flex justify-between items-center text-xs">
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-medium">
                  {c.studentCount || 0} ተማሪዎች
                </span>
                <button className="text-blue-600 font-semibold hover:underline">ዝርዝር ይመልከቱ</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassesManagement;