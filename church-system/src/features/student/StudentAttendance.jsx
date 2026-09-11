'use client';

// src/features/student/StudentAttendance.jsx
import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Award,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Filter,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { FadeIn, MotionCard } from '../../components/motion';

const StudentAttendance = () => {
  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'grades'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await apiFetch('/api/student/exam-results');
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.warn('Failed to load exam results:', err);
      }
    };
    fetchResults();
  }, []);

  // Mock attendance records for rich visual presentation
  const attendanceLogs = [
    { id: 1, date: 'እሁድ፣ መስከረም 18/2017', course: 'የነገረ መለኮት ትምህርት', status: 'present', label: 'ተገኝቷል', time: '03:15' },
    { id: 2, date: 'እሁድ፣ መስከረም 25/2017', course: 'የሐዲስ ኪዳን ጥናት', status: 'present', label: 'ተገኝቷል', time: '03:00' },
    { id: 3, date: 'እሁድ፣ ጥቅምት 02/2017', course: 'የቤተክርስቲያን ታሪክ', status: 'excused', label: 'ፈቃድ', time: '-' },
    { id: 4, date: 'እሁድ፣ ጥቅምት 09/2017', course: 'የነገረ መለኮት ትምህርት', status: 'present', label: 'ተገኝቷል', time: '03:10' },
  ];

  // Academic subjects grade breakdown
  const gradeReports = [
    { id: 1, subject: 'የነገረ መለኮት ትምህርት (Systematic Theology)', teacher: 'መጋቤ ሐዲስ ተስፋዬ', attendance: 95, quiz: 28, finalExam: 62, total: 90, grade: 'A' },
    { id: 2, subject: 'የሐዲስ ኪዳን ጥናት (New Testament Study)', teacher: 'ቀሲስ ዳንኤል', attendance: 90, quiz: 26, finalExam: 59, total: 85, grade: 'A-' },
    { id: 3, subject: 'የቤተክርስቲያን ታሪክ (Church History)', teacher: 'መምህር ዮሐንስ', attendance: 88, quiz: 27, finalExam: 61, total: 88, grade: 'A' },
    { id: 4, subject: 'የሥርዓተ ቤተክርስቲያን መመሪያ (Liturgical Studies)', teacher: 'መምህር ሳሙኤል', attendance: 92, quiz: 29, finalExam: 63, total: 92, grade: 'A+' },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Sub-header Tabs: Attendance vs Report Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>የመገኘት መዝገብ (Attendance)</span>
          </button>

          <button
            onClick={() => setActiveTab('grades')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'grades'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>የትምህርት ውጤት (Report Card)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => alert('ሪፖርት በማዘጋጀት ላይ...')}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 self-start sm:self-auto border border-slate-200 dark:border-slate-700 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ሪፖርት አውርድ (PDF)</span>
        </button>
      </div>

      {activeTab === 'attendance' ? (
        <FadeIn className="space-y-6">
          {/* Attendance KPI Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-bold">የተገኘባቸው ክፍለ-ጊዜዎች</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">22</span>
                <span className="text-xs text-slate-400">/ 24</span>
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">92% የተገኝነት ምጣኔ</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-bold">በፈቃድ የቀረባቸው</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">2</span>
                <span className="text-xs text-slate-400">ቀናት</span>
              </div>
              <p className="text-[11px] text-slate-400">ማስረጃ የቀረበበት</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-bold">ያለፈቃድ የቀረባቸው</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">0</span>
                <span className="text-xs text-slate-400">ቀናት</span>
              </div>
              <p className="text-[11px] text-emerald-600 font-bold">ምርጥ ተሳትፎ ✨</p>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#1e3a8a] dark:text-blue-400" />
                <span>የቅርብ ጊዜ የተገኝነት ታሪክ</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-slate-700">
                  <tr>
                    <th className="p-4">ቀን</th>
                    <th className="p-4">የትምህርት ዓይነት</th>
                    <th className="p-4">የመግቢያ ሰዓት</th>
                    <th className="p-4">ሁኔታ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendanceLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">{log.date}</td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">{log.course}</td>
                      <td className="p-4 font-mono text-slate-500">{log.time}</td>
                      <td className="p-4">
                        {log.status === 'present' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{log.label}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                            <Clock className="w-3 h-3" />
                            <span>{log.label}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      ) : (
        <FadeIn className="space-y-6">
          {/* Grade Report Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>የ2017 ዓ.ም የመጀመሪያ መንፈቀ ዓመት የውጤት ዝርዝር</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">አጠቃላይ አማካይ፦ <strong>88.75% (ደረጃ፦ ጥሩ)</strong></p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-slate-700">
                  <tr>
                    <th className="p-4">የትምህርት ዓይነት</th>
                    <th className="p-4">አስተማሪ</th>
                    <th className="p-4 text-center">ተገኝነት (10%)</th>
                    <th className="p-4 text-center">የቤት ሥራ (30%)</th>
                    <th className="p-4 text-center">ፈተና (60%)</th>
                    <th className="p-4 text-center">ድምር (100%)</th>
                    <th className="p-4 text-center">ደረጃ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {gradeReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-bold text-slate-900 dark:text-white">{r.subject}</td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">{r.teacher}</td>
                      <td className="p-4 text-center font-mono font-medium">{r.attendance}%</td>
                      <td className="p-4 text-center font-mono font-medium">{r.quiz}/30</td>
                      <td className="p-4 text-center font-mono font-medium">{r.finalExam}/60</td>
                      <td className="p-4 text-center font-mono font-black text-[#1e3a8a] dark:text-blue-400">{r.total}%</td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-800 dark:text-amber-300 font-black text-xs border border-amber-300/40">
                          {r.grade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      )}
    </div>
  );
};

export default StudentAttendance;