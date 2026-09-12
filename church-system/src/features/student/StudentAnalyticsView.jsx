import React from 'react';
import { motion } from 'framer-motion';
import { useStudentAnalytics } from '../../hooks/queries/useAnalytics';

export default function StudentAnalyticsView({ studentId = null }) {
  const { data, isLoading, error, refetch } = useStudentAnalytics(studentId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">የአናሊቲክስ መረጃ በመጫን ላይ...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 rounded-3xl border border-rose-200 dark:border-rose-800">
        <p className="text-rose-600 dark:text-rose-400 font-semibold mb-3">
          {error?.message || 'የአናሊቲክስ መረጃ ማግኘት አልተቻለም'}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
        >
          እንደገና ይሞክሩ 🔄
        </button>
      </div>
    );
  }

  const { student, summary, courseBreakdown = [], gradeRecords = [], atRiskAlerts = [], recentAttendanceLog = [] } = data;

  const getStatusBadge = (rate) => {
    if (rate >= 85) return { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200', text: 'በጣም ጥሩ (Excellent)' };
    if (rate >= 75) return { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200', text: 'ጥሩ (Good)' };
    return { bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200', text: 'ማስጠንቀቂያ (At Risk)' };
  };

  const overallBadge = getStatusBadge(summary.overallAttendanceRate);

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 backdrop-blur-md mb-3">
              📊 የግል ትምህርት አናሊቲክስ
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{student?.fullName}</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              የመታወቂያ ቁጥር፦ <span className="font-mono text-amber-300 font-bold">{student?.studentId || 'N/A'}</span> • {student?.grade} ({student?.shift === 'night' ? 'የማታ' : 'የቀን / Weekend'})
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-center shrink-0 min-w-[180px]">
            <p className="text-xs text-slate-300 font-semibold mb-1">አጠቃላይ የተገኝነት መጠን</p>
            <span className="text-4xl font-black text-amber-400">{summary.overallAttendanceRate}%</span>
            <div className={`mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${overallBadge.bg}`}>
              {overallBadge.text}
            </div>
          </div>
        </div>
      </div>

      {/* At-Risk Warning Banner if present */}
      {atRiskAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-2xl shadow-sm text-amber-900 dark:text-amber-200 space-y-2"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-amber-800 dark:text-amber-300">
            <span className="text-lg">⚠️</span> የትምህርት መገኘት ማስጠንቀቂያ ({atRiskAlerts.length})
          </div>
          {atRiskAlerts.map((alert, idx) => (
            <p key={idx} className="text-xs leading-relaxed ml-7">
              • {alert.message}
            </p>
          ))}
        </motion.div>
      )}

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">የተገኙባቸው ቀናት</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{summary.presentCount}</p>
          <span className="text-[10px] text-slate-400 font-semibold">ከ አጠቃላይ {summary.totalAttendanceCount} ቀናት</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">ዘግይተው የተገኙ</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{summary.lateCount}</p>
          <span className="text-[10px] text-slate-400 font-semibold">በሰዓቱ መድረስ ይመረጣል</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">የቀሩባቸው ቀናት</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{summary.absentCount}</p>
          <span className="text-[10px] text-slate-400 font-semibold">የተፈቀደ፦ {summary.excusedCount} ቀናት</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">የውጤት አማካይ (Marks)</p>
          <p className="text-2xl font-black text-[#1657b8] dark:text-blue-400 mt-1">{summary.averageScore} / 100</p>
          <span className="text-[10px] text-slate-400 font-semibold">በ {summary.totalCoursesCount} ትምህርቶች</span>
        </div>
      </div>

      {/* Course Breakdown List */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">በየትምህርቱ የተገኝነት ደረጃ</h2>
            <p className="text-xs text-slate-500">የእያንዳንዱ ትምህርት መገኘት መቶኛ</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {courseBreakdown.length} ትምህርቶች
          </span>
        </div>

        {courseBreakdown.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">እስካሁን የተመዘገበ የተገኝነት መረጃ የለም።</p>
        ) : (
          <div className="space-y-5">
            {courseBreakdown.map((c) => (
              <div key={c.courseId} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{c.courseName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      የተገኙ፦ <strong className="text-emerald-600">{c.present}</strong> | የቀሩ፦ <strong className="text-rose-600">{c.absent}</strong>
                    </span>
                    <span className={`font-black text-sm ${c.rate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {c.rate}%
                    </span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.rate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      c.rate >= 85 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : c.rate >= 75 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                    }`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Academic Marks Summary */}
      {gradeRecords.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            የፈተናና የቤት ሥራ ውጤቶች (Academic Records)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                  <th className="py-2.5 px-3">ትምህርት</th>
                  <th className="py-2.5 px-3">የቤት ሥራ (100)</th>
                  <th className="py-2.5 px-3">ፈተና (100)</th>
                  <th className="py-2.5 px-3">አጠቃላይ (Total)</th>
                  <th className="py-2.5 px-3">ደረጃ (Pass/Fail)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {gradeRecords.map((g, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{g.courseName}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{g.assignmentScore}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{g.finalExamScore || g.quizScore}</td>
                    <td className="py-3 px-3 font-black text-[#1657b8] dark:text-blue-400">{g.totalScore}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        g.passFail === 'Pass' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {g.passFail}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
