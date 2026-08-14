// src/features/teacher/TeacherClasses.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch, API_BASE_URL } from '../../api/apiClient';

const TeacherClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/teacher/classes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setClasses(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching teacher classes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">የተመደቡ ክፍሎች (My Assigned Classes)</h2>
          <p className="text-xs text-slate-500 mt-1">የሚያስተምሯቸውን ክፍሎች እና ተማሪዎችን ይመልከቱ።</p>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">በመጫን ላይ ነው...</div>
      ) : classes.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
          ምንም የተመደቡ ክፍሎች አልተገኙም።
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => (
            <div key={cls._id || cls.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-sm transition">
              <h3 className="font-bold text-slate-800">{cls.className || cls.name}</h3>
              <p className="text-xs text-slate-500 mt-1">ተማሪዎች: {cls.studentCount || 0}</p>
              <button className="mt-4 text-xs font-semibold text-blue-600 hover:underline">
                የተማሪዎች ዝርዝር ይመልከቱ →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;