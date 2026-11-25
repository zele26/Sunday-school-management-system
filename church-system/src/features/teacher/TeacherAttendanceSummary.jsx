'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  BookOpen,
  Search,
  AlertTriangle,
  Download,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatGradeAmharic } from '../../constants/registrationOptions';
import { getEthiopianLocalDateString } from '../../utils/ethiopianDate';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '../../components/ui';

const TeacherAttendanceSummary = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyAtRisk, setOnlyAtRisk] = useState(false);

  // Fetch teacher's courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/api/teacher/my-courses');
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.courses || [];
          setCourses(list);
          if (list.length > 0) {
            setSelectedCourse(list[0]._id);
            fetchSummary(list[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  const fetchSummary = async (courseId) => {
    setLoading(true);
    try {
      const url = courseId
        ? `/api/teacher/attendance-summary?courseId=${courseId}`
        : `/api/teacher/attendance-summary`;

      const res = await apiFetch(url);
      if (res.ok) {
        const data = await res.json();
        if (courseId) {
          const courseSummary = data.find((s) => s.courseId === courseId);
          setSummary(courseSummary || null);
        } else {
          setSummary(data.length ? data[0] : null);
        }
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

  const filteredStudents = useMemo(() => {
    if (!summary?.students) return [];
    const q = searchTerm.trim().toLowerCase();
    return summary.students.filter((s) => {
      if (onlyAtRisk && !s.isAtRisk) return false;
      if (!q) return true;
      return (
        s.studentName?.toLowerCase().includes(q) ||
        s.studentCode?.toLowerCase().includes(q)
      );
    });
  }, [summary, searchTerm, onlyAtRisk]);

  const handleExportCSV = () => {
    if (!summary || !filteredStudents.length) return;
    const headers = ['ተማሪ', 'መለያ ቁጥር', 'ተገኝቷል', 'ዘግይቷል', 'በፈቃድ', 'አልተገኘም', 'ጠቅላላ ክፍለ-ጊዜ', 'ምጣኔ (%)'];
    const rows = filteredStudents.map((s) =>
      [
        `"${s.studentName || ''}"`,
        `"${s.studentCode || '-'}"`,
        s.present ?? s.attended ?? 0,
        s.late ?? 0,
        s.excused ?? 0,
        s.absent ?? 0,
        s.totalClasses ?? 0,
        s.attendanceRate !== null && s.attendanceRate !== undefined ? `${s.attendanceRate}%` : '-',
      ].join(',')
    );
    const blob = new Blob(['\uFEFF' + [headers.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-summary-${summary.courseName || 'course'}-${getEthiopianLocalDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card variant="default" padding="lg" className="space-y-6">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-[var(--brand-primary)]" />
          <span>የመገኘት ማጠቃለያና ትንታኔ</span>
        </CardTitle>

        {summary && filteredStudents.length > 0 && (
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-amber-600" />
            <span>CSV አውርድ</span>
          </button>
        )}
      </CardHeader>

      <CardContent className="space-y-5 p-0">
        {/* Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
          <div className="w-full sm:w-64">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">ኮርስ ይምረጡ</label>
            <select
              value={selectedCourse}
              onChange={handleCourseChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">-- ኮርስ ይምረጡ --</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  📖 {c.name} {c.grade ? `(${formatGradeAmharic(c.grade)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {summary && summary.students.length > 0 && (
            <>
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ተማሪ በስም ወይም መለያ ፈልግ..."
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#1e3a8a]"
                />
              </div>

              <button
                type="button"
                onClick={() => setOnlyAtRisk(!onlyAtRisk)}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  onlyAtRisk
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>ዝቅተኛ መገኘት (&lt;75%) ({summary.atRiskCount || 0})</span>
              </button>
            </>
          )}
        </div>

        {/* Summary KPI Cards */}
        {!loading && summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500">የተካሄዱ ክፍለ-ጊዜዎች</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {summary.totalClasses || 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#1e3a8a] dark:text-blue-300 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">አማካይ የክፍል መገኘት</p>
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
                  {summary.averageRate ?? 0}%
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/70 dark:border-rose-800/60 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300">ክትትል የሚያስፈልጋቸው (&lt;75%)</p>
                <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-0.5">
                  {summary.atRiskCount ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
          </div>
        )}

        {loading && <div className="py-6 text-center text-slate-400 text-sm">ማጠቃለያውን በመጫን ላይ ነው...</div>}

        {!loading && summary && summary.students.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 text-sm py-4 text-center bg-slate-50 dark:bg-slate-800/30 rounded-xl">
            በዚህ ኮርስ የተመዘገበ ተማሪ የለም።
          </p>
        )}

        {!loading && summary && summary.students.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>{summary.courseName}</span>
              {summary.grade && (
                <Badge variant="neutral" size="sm">
                  {formatGradeAmharic(summary.grade)}
                </Badge>
              )}
            </h3>
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-3 px-4 font-bold">የተማሪ ስም</th>
                    <th className="py-3 px-3 font-bold text-center text-emerald-600">ተገኝቷል</th>
                    <th className="py-3 px-3 font-bold text-center text-amber-600">ዘግይቷል</th>
                    <th className="py-3 px-3 font-bold text-center text-blue-600">በፈቃድ</th>
                    <th className="py-3 px-3 font-bold text-center text-rose-600">አልተገኘም</th>
                    <th className="py-3 px-4 font-bold text-right">የመገኘት ምጣኔ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-xs text-slate-400">
                        በተመረጠው ማጣሪያ ውስጥ ተማሪ አልተገኘም።
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const rate = s.attendanceRate;
                      const barColor =
                        rate === null || rate === undefined
                          ? 'bg-slate-300'
                          : rate >= 80
                          ? 'bg-emerald-500'
                          : rate >= 75
                          ? 'bg-amber-500'
                          : 'bg-rose-500';
                      return (
                        <tr key={s.studentId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div>
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                  {s.studentName}
                                </span>
                                {s.studentCode && (
                                  <span className="text-[10px] font-mono text-slate-400">{s.studentCode}</span>
                                )}
                              </div>
                              {s.isAtRisk && (
                                <span className="px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-[10px] font-black">
                                  ⚠️ ዝቅተኛ
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                            <span className="inline-flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              {s.present ?? 0}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                            <span className="inline-flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {s.late ?? 0}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-blue-600 dark:text-blue-400">
                            {s.excused ?? 0}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-rose-600 dark:text-rose-400">
                            <span className="inline-flex items-center gap-0.5">
                              <XCircle className="w-3 h-3" />
                              {s.absent ?? 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex flex-col items-end gap-1 min-w-[110px]">
                              <div className="flex items-center gap-1.5">
                                <Badge variant="subtle" size="sm">
                                  {s.attended}/{s.totalClasses}
                                </Badge>
                                <span
                                  className={`text-xs font-black ${
                                    rate === null || rate === undefined
                                      ? 'text-slate-400'
                                      : rate >= 80
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : rate >= 75
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-rose-600 dark:text-rose-400'
                                  }`}
                                >
                                  {rate !== null && rate !== undefined ? `${rate}%` : '—'}
                                </span>
                              </div>
                              <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                                  style={{ width: `${Math.min(rate || 0, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
