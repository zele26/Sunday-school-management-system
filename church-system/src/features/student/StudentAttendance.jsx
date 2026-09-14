'use client';

// src/features/student/StudentAttendance.jsx
import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Download,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { FadeIn } from '../../components/motion';
import { useLanguage } from '../../hooks/useLanguage';

const StudentAttendance = () => {
  const { t, isAmharic } = useLanguage();
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'grades'
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);

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
          {/* Real Attendance KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total / Present */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
              <span className="text-xs text-slate-500 font-bold">
                {isAmharic ? 'የተገኘባቸው ክፍለ-ጊዜዎች' : 'Present Sessions'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {presentCount + lateCount}
                </span>
                <span className="text-xs text-slate-400">/ {totalSessions}</span>
              </div>
              {attendanceRate !== null && (
                <>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${attendanceRate}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                    {attendanceRate}% {isAmharic ? 'የተገኝነት ምጣኔ' : 'Attendance Rate'}
                  </p>
                </>
              )}
            </div>

            {/* Excused */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
              <span className="text-xs text-slate-500 font-bold">
                {isAmharic ? 'በፈቃድ የቀረባቸው' : 'Excused Absences'}
              </span>
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
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
              <span className="text-xs text-slate-500 font-bold">
                {isAmharic ? 'ያለፈቃድ የቀረባቸው' : 'Unexcused Absences'}
              </span>
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
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#1e3a8a] dark:text-blue-400" />
                <span>{isAmharic ? 'የተገኝነት ታሪክ መዝገብ' : 'Attendance Log History'}</span>
              </h3>
            </div>

            {attendanceRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <CalendarCheck className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {isAmharic
                    ? 'እስካሁን ምንም የመገኝነት መዝገብ አልተመዘገበም'
                    : 'No attendance records logged yet'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isAmharic
                    ? 'የእሁድ ክፍለ-ጊዜ ሲገቡ በአስተባባሪው ስካን ይደረጋል'
                    : 'Attendance will appear here once scanned on Sundays'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-slate-700">
                    <tr>
                      <th className="p-4">{isAmharic ? 'ቀን' : 'Date'}</th>
                      <th className="p-4">{isAmharic ? 'የትምህርት ዓይነት' : 'Course / Topic'}</th>
                      <th className="p-4">{isAmharic ? 'የመግቢያ ሰዓት' : 'Check-in Time'}</th>
                      <th className="p-4">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {attendanceRecords.map((log, idx) => (
                      <tr
                        key={log._id || log.id || idx}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-4 font-semibold text-slate-900 dark:text-white">
                          {formatEthiopianDate(log.date)}
                        </td>
                        <td className="p-4 text-slate-700 dark:text-slate-300">
                          {log.courseName || log.course?.name || (isAmharic ? 'አጠቃላይ ትምህርት' : 'General Session')}
                        </td>
                        <td className="p-4 font-mono text-slate-500">
                          {log.checkInTime
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
                      </tr>
                    ))}
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
                      <th className="p-4 text-center">{isAmharic ? 'ውጤት (Score)' : 'Score'}</th>
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