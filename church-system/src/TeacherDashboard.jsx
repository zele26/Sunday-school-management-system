import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = ({ onLogout }) => {
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('https://church-api-3l2c.onrender.com/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setTeacher(data);
      setLoading(false);
    };
    fetchTeacherData();
  }, []);

  if (loading) return <div className="h-screen flex items-center justify-center">በመጫን ላይ...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <nav className="bg-blue-900 text-white p-4 shadow-lg flex justify-between items-center">
        <h1 className="fo() => { onLogout(); navigate('/'); }text-lg italic">ተክለሳዊሮስ መምህራን መድረክ</h1>
        <button onClick={onLogout} className="bg-red-500 px-4 py-1 rounded-lg text-sm">ውጣ (Logout)</button>
      </nav>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 mb-8 flex items-center gap-6 hover:shadow-xl transition-shadow">
          <div className="text-5xl">👨‍🏫</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">እንኳን ደህና መጡ፣ መምህር {teacher?.fullName.split(' ')[0]}!</h2>
            <p className="text-gray-500">ዛሬ የእርስዎን ክፍል ያስተዳድሩ</p>
          </div>
        </div>

        {/* Teacher Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Attendance Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-green-500 hover:scale-105 transition-transform cursor-pointer hover:shadow-xl">
            <div className="text-3xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">የተማሪዎች መገኘት (Attendance)</h3>
            <p className="text-gray-500 text-sm">የዛሬውን የክፍል መገኘት እዚህ ይሙሉ</p>
          </div>

          {/* Student List Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-blue-500 hover:scale-105 transition-transform cursor-pointer hover:shadow-xl">
            <div className="text-3xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2">የእኔ ተማሪዎች</h3>
            <p className="text-gray-500 text-sm">የክፍልዎን ተማሪዎች ዝርዝር እና መረጃ ይመልከቱ</p>
          </div>

          {/* Lessons Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border-b-4 border-orange-500 hover:scale-105 transition-transform cursor-pointer hover:shadow-xl">
            <div className="text-3xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">ትምህርቶች (Lessons)</h3>
            <p className="text-gray-500 text-sm">የሳምንቱን የትምህርት ዝግጅት ይስቀሉ</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;