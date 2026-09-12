import React from 'react';
import { motion } from 'framer-motion';
import { useAdminAnalytics } from '../../hooks/queries/useAnalytics';

export default function AdminAnalyticsDashboard() {
  const { data, isLoading, error, refetch } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4 font-sans">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">የአስተዳደር አናሊቲክስ መረጃ በመጫን ላይ...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 rounded-3xl border border-rose-200 dark:border-rose-800 font-sans">
        <p className="text-rose-600 dark:text-rose-400 font-semibold mb-3">
          {error?.message || 'የአስተዳደር አናሊቲክስ መረጃ ማግኘት አልተቻለም'}
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

  const { summary, shiftBreakdown, gradeBreakdown = [] } = data;

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/20 backdrop-blur-md mb-3">
              🛡️ የሰንበት ትምህርት ቤት አጠቃላይ አናሊቲክስ
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">የተገኝነትና የትምህርት አፈጻጸም ዳሽቦርድ</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              በፈረቃ (Weekend vs Night) እና በክፍል ደረጃ የመገኘት ሁኔታዎችን ይተንትኑ
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl text-center min-w-[200px] shrink-0">
            <p className="text-xs text-slate-300 font-semibold mb-1">የሰንበት ትምህርት ቤቱ መገኘት</p>
            <span className="text-4xl font-black text-emerald-400">{summary.overallSchoolRate}%</span>
            <p className="text-[11px] text-slate-300 mt-1 font-medium">ከ አጠቃላይ {summary.totalStudentsCount} ተማሪዎች</p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">አጠቃላይ ተማሪዎች</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{summary.totalStudentsCount}</p>
          <span className="text-[10px] text-slate-400 font-semibold">የተመዘገቡ ተማሪዎች</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">አጠቃላይ የተገኝነት መዝገቦች</p>
          <p className="text-3xl font-black text-[#1657b8] dark:text-blue-400 mt-1">{summary.totalAttendancesCount}</p>
          <span className="text-[10px] text-slate-400 font-semibold">በሲስተሙ የተመዘገቡ</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">የቀን/Weekend ተገኝነት</p>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{shiftBreakdown.weekend.rate}%</p>
          <span className="text-[10px] text-slate-400 font-semibold">ቅዳሜ እና እሑድ</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">የማታ (Night) ተገኝነት</p>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-1">{shiftBreakdown.night.rate}%</p>
          <span className="text-[10px] text-slate-400 font-semibold">ከሰኞ እስከ ዓርብ</span>
        </div>
      </div>

      {/* Shift Comparison Section */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>⚖️</span> በፈረቃ (Shift) የተገኝነት ንጽጽር
          </h2>
          <p className="text-xs text-slate-500">የሳምንቱ መጨረሻ (Weekend) እና የማታ (Night) ፈረቃዎች ንጽጽር</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weekend Card */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">የቀን ፈረቃ</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Weekend Shift</h3>
              </div>
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{shiftBreakdown.weekend.rate}%</span>
            </div>

            <div className="w-full bg-blue-200/60 dark:bg-blue-900/60 h-3 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${shiftBreakdown.weekend.rate}%` }}></div>
            </div>

            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 pt-2 border-t border-blue-100 dark:border-blue-900/40">
              <span>የተገኙ መዝገቦች፦ <strong className="text-emerald-600">{shiftBreakdown.weekend.present}</strong></span>
              <span>የቀሩ መዝገቦች፦ <strong className="text-rose-600">{shiftBreakdown.weekend.absent}</strong></span>
            </div>
          </div>

          {/* Night Shift Card */}
          <div className="bg-purple-50/50 dark:bg-purple-950/20 p-6 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">የማታ ፈረቃ</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Night Shift</h3>
              </div>
              <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{shiftBreakdown.night.rate}%</span>
            </div>

            <div className="w-full bg-purple-200/60 dark:bg-purple-900/60 h-3 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: `${shiftBreakdown.night.rate}%` }}></div>
            </div>

            <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 pt-2 border-t border-purple-100 dark:border-purple-900/40">
              <span>የተገኙ መዝገቦች፦ <strong className="text-emerald-600">{shiftBreakdown.night.present}</strong></span>
              <span>የቀሩ መዝገቦች፦ <strong className="text-rose-600">{shiftBreakdown.night.absent}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Level Breakdown */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🏫</span> በክፍል ደረጃ የተገኝነት ደረጃ (Grade 7 - Grade 12)
          </h2>
          <p className="text-xs text-slate-500">ከ 7ኛ እስከ 12ኛ ክፍል ያሉ የተማሪዎች ተገኝነት መጠን</p>
        </div>

        {gradeBreakdown.length === 0 ? (
          <p className="text-center py-6 text-slate-500 text-sm">የክፍል ደረጃ መረጃ አልተገኘም።</p>
        ) : (
          <div className="space-y-4">
            {gradeBreakdown.map((g) => (
              <div key={g.grade} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{g.grade}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      የተመዘገቡ ቀናት፦ <strong className="text-slate-700 dark:text-slate-300">{g.totalLogs}</strong>
                    </span>
                    <span className={`font-black text-sm ${g.rate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {g.rate}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${g.rate}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      g.rate >= 85 ? 'bg-emerald-500' : g.rate >= 75 ? 'bg-blue-500' : 'bg-rose-500'
                    }`}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
