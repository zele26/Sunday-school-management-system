import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTeacherAnalytics } from '../../hooks/queries/useAnalytics';

export default function TeacherAnalyticsView() {
  const { data, isLoading, error, refetch } = useTeacherAnalytics();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">የመምህር አናሊቲክስ መረጃ በመጫን ላይ...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 rounded-3xl border border-rose-200 dark:border-rose-800 font-sans">
        <p className="text-rose-600 dark:text-rose-400 font-semibold mb-3">
          {error?.message || 'የመምህር አናሊቲክስ መረጃ ማግኘት አልተቻለም'}
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

  const { summary, courseStats = [], atRiskStudents = [], correlationData = [] } = data;

  const filteredAtRisk = atRiskStudents.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customStudentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 backdrop-blur-md mb-3">
              👨‍🏫 የመምህር ክፍሎች አናሊቲክስ
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">የክፍሎች ተገኝነትና ውጤት አናሊቲክስ</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              የሚያስተምሯቸውን ትምህርቶች የተገኝነት መጠን እና ልዩ ትኩረት የሚሹ ተማሪዎችን ይከታተሉ
            </p>
          </div>

          <div className="flex gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3.5 rounded-2xl text-center min-w-[130px]">
              <p className="text-[11px] text-slate-300 font-semibold mb-1">አጠቃላይ ተማሪዎች</p>
              <span className="text-3xl font-black text-amber-300">{summary.totalActiveStudents}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3.5 rounded-2xl text-center min-w-[130px]">
              <p className="text-[11px] text-slate-300 font-semibold mb-1">ትኩረት የሚሹ</p>
              <span className="text-3xl font-black text-rose-400">{summary.atRiskCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Attendance Overview Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>📚</span> የየክፍሎቹ አጠቃላይ የተገኝነት መጠን ({courseStats.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courseStats.map((c) => (
            <motion.div
              key={c.courseId}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{c.courseName}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {c.grade} • {c.shift === 'night' ? 'የማታ' : 'የቀን'}
                  </p>
                </div>
                <span className={`text-lg font-black ${c.attendanceRate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {c.attendanceRate}%
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${c.attendanceRate}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                <span>የተመዘገቡ ቀናት፦ <strong className="text-slate-700 dark:text-slate-300">{c.totalRecordings}</strong></span>
                <span>ሁኔታ፦ <strong className={c.attendanceRate >= 75 ? 'text-emerald-600' : 'text-rose-600'}>{c.attendanceRate >= 75 ? 'ጥሩ' : 'ዝቅተኛ'}</strong></span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* At-Risk Students Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="text-rose-500 text-xl">⚠️</span> ልዩ ትኩረትና ክትትል የሚሹ ተማሪዎች (At-Risk Students)
            </h2>
            <p className="text-xs text-slate-500">የተገኝነት መጠናቸው ከ 75% በታች የሆኑ ወይም ውጤታቸው አነስተኛ የሆኑ ተማሪዎች</p>
          </div>

          <input
            type="text"
            placeholder="ተማሪ በስም ወይም በክፍል ይፈልጉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
        </div>

        {filteredAtRisk.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            🎉 በክፍልዎ ውስጥ ልዩ ትኩረት የሚሻ ተማሪ የለም! የሁሉም ተማሪዎች ተገኝነትና ውጤት በጥሩ ደረጃ ላይ ይገኛል።
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500">
                  <th className="py-3 px-3">የተማሪው ስም</th>
                  <th className="py-3 px-3">የመታወቂያ ቁጥር</th>
                  <th className="py-3 px-3">ክፍል / ፈረቃ</th>
                  <th className="py-3 px-3">የተገኝነት መጠን</th>
                  <th className="py-3 px-3">የውጤት አማካይ</th>
                  <th className="py-3 px-3">ስልክ ቁጥር</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {filteredAtRisk.map((s) => (
                  <tr key={s.studentId} className="hover:bg-rose-50/50 dark:hover:bg-rose-950/20">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{s.fullName}</td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-600 dark:text-slate-400">{s.customStudentId || 'N/A'}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{s.grade} ({s.shift === 'night' ? 'የማታ' : 'የቀን'})</td>
                    <td className="py-3 px-3 font-black text-rose-600 dark:text-rose-400">{s.attendanceRate}%</td>
                    <td className="py-3 px-3 font-bold text-amber-600 dark:text-amber-400">{s.avgScore} / 100</td>
                    <td className="py-3 px-3 font-mono">
                      <a href={`tel:${s.phone}`} className="text-blue-600 hover:underline font-bold">
                        📞 {s.phone || 'የለም'}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
