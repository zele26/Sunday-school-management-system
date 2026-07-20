// src/features/teacher/TeacherOverview.jsx
import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

const TeacherOverview = () => {
  const [stats, setStats] = useState({ classes: 0, students: 0, assignments: 0, pendingExams: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/teacher/dashboard-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Error fetching teacher stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'የተመደቡ ክፍሎች', value: stats.classes },
          { label: 'ተማሪዎች', value: stats.students },
          { label: 'የቤት ሥራዎች', value: stats.assignments },
          { label: 'የሚጠበቁ ፈተናዎች', value: stats.pendingExams },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">{card.label}</p>
            <p className="text-3xl font-black text-slate-800 mt-2">{loading ? '...' : card.value}</p>
          </div>
        ))}
      </div>

      {/* Activities & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800">የቅርብ ጊዜ የክፍል እንቅስቃሴዎች</h3>
          <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
            <li>ለክፍል 1ሀ አዲስ የትምህርት እቅድ ተዘጋጅቷል።</li>
            <li>ለወላጆች የማስታወቂያ መረጃ ተልኳል።</li>
            <li>የተማሪዎች ውጤት ተገምግሞ አዲስ የመማሪያ ማስታወሻ ተጭኗል።</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800">ፈጣን ተግባራት</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-blue-600 text-white text-xs font-bold py-3 rounded-xl hover:bg-blue-700 transition">
              ትምህርት ወይም ፈተና ያዘጋጁ
            </button>
            <button className="bg-emerald-600 text-white text-xs font-bold py-3 rounded-xl hover:bg-emerald-700 transition">
              የተማሪዎች ሥራዎችን ይገምግሙ
            </button>
            <button className="bg-purple-600 text-white text-xs font-bold py-3 rounded-xl hover:bg-purple-700 transition">
              ማስታወቂያ ይላኩ
            </button>
            <button className="bg-orange-600 text-white text-xs font-bold py-3 rounded-xl hover:bg-orange-700 transition">
              ሪፖርት ያውጡ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherOverview;