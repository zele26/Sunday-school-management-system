'use client';

// src/features/student/StudentAttendance.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarCheck,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  XCircle,
  Search,
  Sparkles,
  FileText,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { FadeIn } from '../../components/motion';
import { useLanguage } from '../../hooks/useLanguage';

const StudentAttendance = () => {
  const { isAmharic } = useLanguage();
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'grades'
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [attRes, resultsRes] = await Promise.allSettled([
          apiFetch('/api/student/my-attendance'),
          apiFetch('/api/student/exam-results'),
        ]);

        if (!isMounted) return;

        if (attRes.status === 'fulfilled' && attRes.value.ok) {
          const attData = await attRes.value.json();
          if (Array.isArray(attData)) {
            setAttendanceRecords(attData);
          }
        }

        if (resultsRes.status === 'fulfilled' && resultsRes.value.ok) {
          const resData = await resultsRes.value.json();
          if (Array.isArray(resData)) {
            setExamResults(resData);
          }
        }
      } catch (err) {
        console.warn('Failed to load student attendance:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Real Attendance Calculations
  const totalSessions = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) =>
    ['Present', 'present'].includes(a.status)
  ).length;
  const lateCount = attendanceRecords.filter((a) =>
    ['Late', 'late'].includes(a.status)
  ).length;
  const excusedCount = attendanceRecords.filter((a) =>
    ['Excused', 'excused'].includes(a.status)
  ).length;
  const absentCount = attendanceRecords.filter((a) =>
    ['Absent', 'absent'].includes(a.status)
  ).length;

  const attendanceRate =
    totalSessions > 0
      ? Math.round(((presentCount + lateCount) / totalSessions) * 100)
      : null;

  const filteredAttendance = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return attendanceRecords.filter((log) => {
      const matchesStatus =
        statusFilter === 'all' ||
        (log.status || '').toLowerCase() === statusFilter.toLowerCase();
      if (!matchesStatus) return false;
      if (!q) return true;
      const topic = (
        log.sessionId?.title ||
        log.session ||
        log.courseName ||
        log.course?.name ||
        ''
      ).toLowerCase();
      const note = (log.excuseReason || log.note || '').toLowerCase();
      const dateStr = formatEthiopianDate(log.date).toLowerCase();
      return topic.includes(q) || note.includes(q) || dateStr.includes(q);
    });
  }, [attendanceRecords, statusFilter, searchTerm]);

  // Real Grade / Results Calculations
  const totalExams = examResults.length;
  const avgScore =
    totalExams > 0
      ? Math.round(
          examResults.reduce(
            (acc, curr) => acc + (curr.totalScore || curr.score || curr.percentage || 0),
            0
          ) / totalExams
        )
      : null;

  return (
    <div className="space-y-6 font-sans max-w-7xl mx-auto">
      {/* Sub-header Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{isAmharic ? 'የመገኘት መዝገብ' : 'Attendance Records'}</span>
          </button>

          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'grades'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{isAmharic ? 'የትምህርት ውጤት' : 'Academic Results'}</span>
          </button>
        </div>

        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl self-start sm:self-auto">
          {activeTab === 'attendance'
            ? isAmharic
              ? `${totalSessions} የተመዘገቡ ክፍለ-ጊዜዎች`
              : `${totalSessions} Recorded Sessions`
            : isAmharic
            ? `${totalExams} የፈተና ውጤቶች`
            : `${totalExams} Exam Results`}
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold">
            {isAmharic ? 'መረጃዎች በመጫን ላይ ናቸው...' : 'Loading records...'}
          </p>
        </div>
      ) : activeTab === 'attendance' ? (
        <FadeIn className="space-y-6">
          {/* Attendance Standing Alert Banner */}
          {attendanceRate !== null && attendanceRate < 75 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-black text-rose-800 dark:text-rose-200">
                  {isAmharic
                    ? `⚠️ የመገኘት ምጣኔዎ (${attendanceRate}%) ከ75% በታች ነው`
                    : `⚠️ Your attendance rate (${attendanceRate}%) is below the 75% requirement`}
                </p>
                <p className="text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                  {isAmharic
                    ? 'እባክዎ በሚቀጥሉት ክፍለ-ጊዜዎች በሰዓቱ በመገኘት ምጣኔዎን ያሻሽሉ፤ በምክንያት ከቀሩ አስቀድመው ለመምህርዎ ያሳውቁ።'
                    : 'Please attend upcoming sessions on time to improve your standing, or notify your teacher in advance for excused absences.'}
                </p>
              </div>
            </div>
          )}

          {attendanceRate !== null && attendanceRate >= 90 && totalSessions >= 3 && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                {isAmharic
                  ? `🌟 ድንቅ የመገኘት ምጣኔ (${attendanceRate}%)! በዚህ መልካም ትጋት ይቀጥሉ።`
                  : `🌟 Excellent attendance record (${attendanceRate}%)! Keep up the great dedication.`}
              </p>
            </div>
          )}

          {/* 4 KPI Cards (Present, Late, Excused, Absent) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* On-Time Present */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">
                  {isAmharic ? 'በሰዓቱ የተገኘ' : 'On-Time Present'}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {presentCount}
                </span>
                <span className="text-xs text-slate-400">/ {totalSessions}</span>
              </div>
              {attendanceRate !== null && (
                <>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${attendanceRate}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {attendanceRate}% {isAmharic ? 'አጠቃላይ መገኘት' : 'Overall Rate'}
                  </p>
                </>
              )}
            </div>

            {/* Late */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">
                  {isAmharic ? 'አርፍዶ የተገኘ' : 'Late Arrivals'}
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                  {lateCount}
                </span>
                <span className="text-xs text-slate-400">{isAmharic ? 'ቀናት' : 'days'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {lateCount === 0
                  ? isAmharic
                    ? 'ሁልጊዜ በሰዓቱ ✨'
                    : 'Always on time ✨'
                  : isAmharic
                  ? 'ከተመደበው ሰዓት በኋላ'
                  : 'Arrived after threshold'}
              </p>
            </div>

            {/* Excused */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-blue-200/80 dark:border-blue-900/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">
                  {isAmharic ? 'በፈቃድ የቀረ' : 'Excused'}
                </span>
                <AlertCircle className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">
                  {excusedCount}
                </span>
                <span className="text-xs text-slate-400">{isAmharic ? 'ቀናት' : 'days'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isAmharic ? 'ማስረጃ የቀረበበት' : 'Officially excused'}
              </p>
            </div>

            {/* Absent */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">
                  {isAmharic ? 'ያለፈቃድ የቀረ' : 'Absent'}
                </span>
                <XCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                  {absentCount}
                </span>
                <span className="text-xs text-slate-400">{isAmharic ? 'ቀናት' : 'days'}</span>
              </div>
              <p className="text-[11px] text-slate-400">
                {absentCount === 0
                  ? isAmharic
                    ? 'ምንም ያልተፈቀደ ቀሪ የለም ✨'
                    : 'Clean record ✨'
                  : isAmharic
                  ? 'ያልተፈቀደ ቀሪ'
                  : 'Unexcused'}
              </p>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#1e3a8a] dark:text-blue-400" />
                <span>{isAmharic ? 'የተገኝነት ታሪክ መዝገብ' : 'Attendance Log History'}</span>
              </h3>

              {attendanceRecords.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={isAmharic ? 'በኮርስ ወይም ቀን ፈልግ...' : 'Search topic or date...'}
                      className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#1e3a8a] w-44"
                    />
                  </div>
                  <div className="flex items-center gap-1 overflow-x-auto">
                    {[
                      { id: 'all', label: isAmharic ? 'ሁሉም' : 'All' },
                      { id: 'Present', label: isAmharic ? 'ተገኝቷል' : 'Present' },
                      { id: 'Late', label: isAmharic ? 'ዘግይቷል' : 'Late' },
                      { id: 'Excused', label: isAmharic ? 'ፈቃድ' : 'Excused' },
                      { id: 'Absent', label: isAmharic ? 'ቀሪ' : 'Absent' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setStatusFilter(st.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                          statusFilter === st.id
                            ? 'bg-[#1e3a8a] text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {attendanceRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CalendarCheck className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {isAmharic
                    ? 'እስካሁን ምንም የመገኘት መዝገብ አልተመዘገበም'
                    : 'No attendance records logged yet'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isAmharic
                    ? 'የእሁድ ክፍለ-ጊዜ ሲገቡ በአስተባባሪው ስካን ይደረጋል'
                    : 'Attendance will appear here once scanned on Sundays'}
                </p>
              </div>
            ) : filteredAttendance.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                {isAmharic ? 'በዚህ ማጣሪያ ውስጥ ምንም መዝገብ አልተገኘም።' : 'No records match this filter.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-slate-700">
                    <tr>
                      <th className="p-4">{isAmharic ? 'ቀን' : 'Date'}</th>
                      <th className="p-4">{isAmharic ? 'ክፍለ-ጊዜ / ኮርስ' : 'Session / Course'}</th>
                      <th className="p-4">{isAmharic ? 'የመግቢያ ሰዓት' : 'Check-in Time'}</th>
                      <th className="p-4">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
                      <th className="p-4">{isAmharic ? 'ማስታወሻ' : 'Note'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredAttendance.map((log, idx) => {
                      const sessionTitle =
                        log.sessionId?.title ||
                        log.session ||
                        log.courseName ||
                        log.course?.name ||
                        (isAmharic ? 'አጠቃላይ ትምህርት' : 'General Session');
                      const noteText = log.excuseReason || log.note || '';
                      return (
                        <tr
                          key={log._id || log.id || idx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="p-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                            {formatEthiopianDate(log.date)}
                          </td>
                          <td className="p-4 text-slate-700 dark:text-slate-300">
                            <span className="font-semibold block">{sessionTitle}</span>
                            {log.sessionId?.startTime && log.sessionId?.endTime && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {log.sessionId.startTime} – {log.sessionId.endTime}
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-slate-500">
                            {log.checkInTime && !['Absent', 'absent'].includes(log.status)
                              ? typeof log.checkInTime === 'string' &&
                                log.checkInTime.includes(':') &&
                                log.checkInTime.length <= 5
                                ? log.checkInTime
                                : new Date(log.checkInTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                              : '—'}
                          </td>
                          <td className="p-4">
                            {['Present', 'present'].includes(log.status) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>{isAmharic ? 'ተገኝቷል' : 'Present'}</span>
                              </span>
                            ) : ['Late', 'late'].includes(log.status) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                                <Clock className="w-3 h-3" />
                                <span>{isAmharic ? 'ዘግይቷል' : 'Late'}</span>
                              </span>
                            ) : ['Excused', 'excused'].includes(log.status) ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                                <AlertCircle className="w-3 h-3" />
                                <span>{isAmharic ? 'ፈቃድ' : 'Excused'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold">
                                <XCircle className="w-3 h-3" />
                                <span>{isAmharic ? 'አልተገኘም' : 'Absent'}</span>
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                            {noteText ? (
                              <span className="inline-flex items-center gap-1">
                                <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{noteText}</span>
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </FadeIn>
      ) : (
        <FadeIn className="space-y-6">
          {/* Real Grade Results Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>{isAmharic ? 'የተመዘገቡ የፈተና ውጤቶች' : 'Academic Exam Records'}</span>
                </h3>
                {avgScore !== null && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isAmharic ? 'አጠቃላይ አማካይ፦' : 'Average Score:'}{' '}
                    <strong className="text-slate-900 dark:text-white font-mono">{avgScore}%</strong>
                  </p>
                )}
              </div>
            </div>

            {examResults.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Award className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {isAmharic
                    ? 'እስካሁን የተመዘገበ የፈተና ውጤት የለም'
                    : 'No exam results submitted yet'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isAmharic
                    ? 'ፈተና ሲወስዱ ውጤትዎ እዚህ ይዘረዘራል'
                    : 'Exam submissions and grades will appear here'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-slate-700">
                    <tr>
                      <th className="p-4">{isAmharic ? 'የፈተና ርዕስ' : 'Exam Title'}</th>
                      <th className="p-4">{isAmharic ? 'ቀን' : 'Date'}</th>
                      <th className="p-4 text-center">{isAmharic ? 'ውጤት' : 'Score'}</th>
                      <th className="p-4 text-center">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {examResults.map((r, idx) => (
                      <tr
                        key={r._id || idx}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-4 font-bold text-slate-900 dark:text-white">
                          {r.quiz?.title || r.title || (isAmharic ? 'ፈተና' : 'Exam')}
                        </td>
                        <td className="p-4 text-slate-500 dark:text-slate-400">
                          {formatEthiopianDate(r.submittedAt || r.createdAt)}
                        </td>
                        <td className="p-4 text-center font-mono font-black text-[#1e3a8a] dark:text-blue-400 text-sm">
                          {r.totalScore !== undefined ? `${r.totalScore} / 100` : `${r.score || 0}%`}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              (r.totalScore || r.score || 0) >= 50
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {(r.totalScore || r.score || 0) >= 50
                              ? isAmharic
                                ? 'አልፏል'
                                : 'Passed'
                              : isAmharic
                              ? 'አላለፈም'
                              : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </FadeIn>
      )}
    </div>
  );
};

export default StudentAttendance;
