// src/features/teacher/TeacherAttendanceSummary.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { CalendarCheck, BookOpen } from 'lucide-react';
import { API_BASE_URL } from '../../api/apiClient';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui';

const TeacherAttendanceSummary = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch teacher's courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/teacher/my-courses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const fetchSummary = async (courseId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = courseId
        ? `${API_BASE_URL}/api/teacher/attendance-summary?courseId=${courseId}&token=${token}`
        : `${API_BASE_URL}/api/teacher/attendance-summary?token=${token}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      // Find the summary for the selected course (if specific) or show all
      if (courseId) {
        const courseSummary = data.find(s => s.courseId === courseId);
        setSummary(courseSummary || null);
      } else {
        setSummary(data.length ? data[0] : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    if (courseId) {
      fetchSummary(courseId);
    } else {
      setSummary(null);
    }
  };

  return (
    <Card variant="default" padding="lg" className="space-y-6">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>የመገኘት ማጠቃለያ (Attendance Summary)</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6 p-0">
        {/* Course Selector */}
        <div className="max-w-xs">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">ኮርስ ይምረጡ (Select Course)</label>
          <select
            value={selectedCourse}
            onChange={handleCourseChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">-- ኮርስ ይምረጡ --</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        {loading && <div className="py-6 text-center text-slate-400 text-sm">ማጠቃለያውን በመጫን ላይ...</div>}

        {!loading && summary && summary.students.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl">
            በዚህ ኮርስ የተመዘገበ ተማሪ የለም (No students enrolled in this course)
          </p>
        )}

        {!loading && summary && summary.students.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>{summary.courseName}</span>
            </h3>
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-3 px-4 font-bold">የተማሪ ስም (Student)</th>
                    <th className="py-3 px-4 font-bold text-right">የመገኘት ምጣኔ (Attendance)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {summary.students.map(s => (
                    <tr key={s.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">{s.studentName}</td>
                      <td className="py-3 px-4 text-right">
                        <Badge variant="subtle" size="sm">
                          {s.attended}/{s.totalClasses} ቀን
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeacherAttendanceSummary;