'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Calendar } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../../components/ui';

const TeacherAttendance = () => {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', courseId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await apiFetch('/api/teacher/my-courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.courseId) params.append('courseId', filters.courseId);

      const res = await apiFetch(`/api/teacher/attendance?${params}`);
      if (!res.ok) throw new Error('የአቴንዳንስ መረጃዎችን ማምጣት አልተቻለም');
      const data = await res.json();
      setRecords(data);
    } catch (err) {
      setError(err.message || 'የግንኙነት ስህተት ተከስቷል');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <Card variant="default" padding="lg" className="space-y-6">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>የመገኘት ሪፖርት</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-0">
        <div className="flex flex-wrap gap-3 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">መጀመሪያ ቀን</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">ማብቂያ ቀን</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-slate-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">ኮርስ</label>
            <select
              name="courseId"
              value={filters.courseId}
              onChange={handleChange}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl text-sm text-slate-800 dark:text-slate-200"
            >
              <option value="">ሁሉም ኮርሶች</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <Button onClick={fetchAttendance} size="sm" className="font-bold h-fit">
            አጣራ
          </Button>
        </div>

        {error && <div className="py-4 text-center text-rose-500 font-semibold text-sm">❌ {error}</div>}
        {loading && <div className="py-8 text-center text-slate-400 text-sm">የመገኘት መረጃ በመጫን ላይ ነው...</div>}
        
        {!loading && !error && records.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl">
            ምንም የመገኘት መረጃ አልተገኘም።
          </p>
        )}
        
        {!loading && !error && records.length > 0 && (
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                  <th className="py-3 px-4 font-bold">የተማሪ ስም</th>
                  <th className="py-3 px-4 font-bold">ኮርስ</th>
                  <th className="py-3 px-4 font-bold">ቀን</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {records.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{r.student?.firstName} {r.student?.lastName}</td>
                    <td className="py-3 px-4">{r.course?.name || '-'}</td>
                    <td className="py-3 px-4 font-mono text-xs">{formatEthiopianDate(r.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherAttendance;