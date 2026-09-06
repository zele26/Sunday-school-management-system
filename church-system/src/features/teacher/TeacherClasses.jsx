// src/features/teacher/TeacherClasses.jsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui';

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
    <Card variant="default" padding="lg" className="space-y-6 font-sans">
      <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <CardTitle>የተመደቡ ክፍሎች (My Assigned Classes)</CardTitle>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">የሚያስተምሯቸውን ክፍሎች እና ተማሪዎችን ይመልከቱ።</p>
        </div>
        <Badge variant="gold" size="sm">{classes.length} ክፍሎች</Badge>
      </div>

      {loading ? (
        <div className="py-8 text-center text-slate-400 text-sm">በመጫን ላይ ነው...</div>
      ) : classes.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          ምንም የተመደቡ ክፍሎች አልተገኙም።
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map((cls) => (
            <Card key={cls._id || cls.id} variant="default" padding="md" className="hover:border-amber-400 transition-colors">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cls.className || cls.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ተማሪዎች: {cls.studentCount || 0}</p>
              <button className="mt-3 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                የተማሪዎች ዝርዝር ይመልከቱ →
              </button>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default TeacherClasses;