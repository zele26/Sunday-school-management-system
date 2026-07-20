// src/features/student/StudentOverview.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const StudentOverview = () => {
  const [data, setData] = useState({ coursesCount: 0, attendancePercentage: '0%' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/student/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const resData = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error('Error fetching student overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500">የተመዘገቡ ኮርሶች</p>
          <p className="text-3xl font-black text-slate-800 mt-2">{loading ? '...' : data.coursesCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500">የመገኘት መቶኛ</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{loading ? '...' : data.attendancePercentage}</p>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;