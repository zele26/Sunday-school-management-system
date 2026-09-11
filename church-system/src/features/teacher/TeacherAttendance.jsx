'use client';

// src/features/teacher/TeacherAttendance.jsx
import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Calendar,
  Search,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Download,
  BookOpen,
  RefreshCw,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../../components/ui';
import { FadeIn } from '../../components/motion';

const TeacherAttendance = () => {
  const [activeTab, setActiveTab] = useState('rollcall'); // 'rollcall' | 'history'
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [rollCallDate, setRollCallDate] = useState(new Date().toISOString().split('T')[0]);

  // Roll call state
  const [roster, setRoster] = useState([]);
  const [rosterStatuses, setRosterStatuses] = useState({});
  const [rosterLoading, setRosterLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // History state
  const [records, setRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const res = await apiFetch('/api/teacher/my-courses');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.courses || [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourseId(list[0]._id);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch courses:', err);
    }
  };

  // Fetch student roster when course changes
  const fetchRoster = async () => {
    if (!selectedCourseId) return;
    setRosterLoading(true);
    setFeedbackMessage(null);
    try {
      const res = await apiFetch(`/api/admin/attendance/roster?courseId=${selectedCourseId}&date=${rollCallDate}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.roster || [];
        setRoster(list);
        const initialMap = {};
        list.forEach((s) => {
          initialMap[s._id] = s.status || 'Present';
        });
        setRosterStatuses(initialMap);
      }
    } catch (err) {
      console.warn('Failed to fetch roster:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rollcall' && selectedCourseId) {
      fetchRoster();
    }
  }, [selectedCourseId, rollCallDate, activeTab]);

  // Save Roll Call
  const handleSaveRollCall = async () => {
    if (roster.length === 0) return;
    setIsSubmitting(true);
    setFeedbackMessage(null);

    const recordsPayload = roster.map((s) => ({
      studentId: s._id,
      status: rosterStatuses[s._id] || 'Present',
    }));

    try {
      const res = await apiFetch('/api/admin/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({
          records: recordsPayload,
          courseId: selectedCourseId,
          date: rollCallDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage({ type: 'success', text: data.message || 'የክፍሉ ተገኝነት በተሳካ ሁኔታ ተመዝግቧል!' });
        fetchRoster();
      } else {
        setFeedbackMessage({ type: 'error', text: data.message || 'ተገኝነት ማስቀመጥ አልተቻለም' });
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message || 'የኔትወርክ ችግር አጋጥሟል' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAll = (status) => {
    const updated = {};
    roster.forEach((s) => {
      updated[s._id] = status;
    });
    setRosterStatuses(updated);
  };

  // Fetch History
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCourseId) params.append('courseId', selectedCourseId);
      if (historyStartDate) params.append('startDate', historyStartDate);
      if (historyEndDate) params.append('endDate', historyEndDate);

      const res = await apiFetch(`/api/teacher/attendance?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRecords(Array.isArray(data) ? data : data.attendances || []);
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, selectedCourseId]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center shadow-md">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              የመምህራን የተገኝነት መዝገብ
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              የክፍል ተማሪዎችዎን ተገኝነት በ1-ክሊክ ይመዝግቡ እና ሪፖርቶችን ይከታተሉ
            </p>
          </div>
        </div>

        {/* Course Dropdown */}
        <div className="w-full sm:w-64">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                📖 {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs w-fit">
        <button
          onClick={() => setActiveTab('rollcall')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rollcall'
              ? 'bg-[#1e3a8a] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>የዕለቱ የክፍል ጥሪ (Roll Call)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#1e3a8a] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>የተገኝነት ታሪክ (History)</span>
        </button>
      </div>

      {/* TAB 1: ROLL CALL */}
      {activeTab === 'rollcall' && (
        <FadeIn className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">ቀን፦</label>
              <input
                type="date"
                value={rollCallDate}
                onChange={(e) => setRollCallDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
              >
                ✓ ሁሉንም ተገኝቷል አድርግ
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Absent')}
                className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold border border-rose-200 transition-colors cursor-pointer"
              >
                ✗ ሁሉንም አልተገኘም አድርግ
              </button>
            </div>
          </div>

          {feedbackMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {feedbackMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{feedbackMessage.text}</span>
            </div>
          )}

          {/* Roster List */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            {rosterLoading ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="w-7 h-7 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>ተማሪዎችን በመጫን ላይ...</span>
              </div>
            ) : roster.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 m-5">
                በዚህ ኮርስ የተመዘገበ ተማሪ የለም።
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-slate-700">
                      <tr>
                        <th className="p-3.5 w-10 text-center">#</th>
                        <th className="p-3.5">የተማሪው ስም</th>
                        <th className="p-3.5">መለያ ቁጥር</th>
                        <th className="p-3.5 text-center">ሁኔታ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {roster.map((s, idx) => {
                        const curStatus = rosterStatuses[s._id] || 'Present';
                        return (
                          <tr key={s._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                            <td className="p-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                              {s.fullName}
                            </td>
                            <td className="p-3.5 font-mono text-slate-500 font-bold">{s.studentId || '-'}</td>
                            <td className="p-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                {[
                                  { value: 'Present', label: 'ተገኝቷል', activeBg: 'bg-emerald-600 text-white' },
                                  { value: 'Late', label: 'ዘግይቷል', activeBg: 'bg-amber-500 text-white' },
                                  { value: 'Excused', label: 'ፈቃድ', activeBg: 'bg-blue-600 text-white' },
                                  { value: 'Absent', label: 'አልተገኘም', activeBg: 'bg-rose-600 text-white' },
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                      setRosterStatuses((prev) => ({ ...prev, [s._id]: opt.value }))
                                    }
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      curStatus === opt.value
                                        ? `${opt.activeBg} shadow-xs`
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button
                    onClick={handleSaveRollCall}
                    disabled={isSubmitting || roster.length === 0}
                    className="bg-[#1e3a8a] hover:bg-[#163177] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'በመመዝገብ ላይ...' : 'የዕለቱን ተገኝነት መዝግብ'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {/* TAB 2: HISTORY */}
      {activeTab === 'history' && (
        <FadeIn className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">ከቀን፦</label>
              <input
                type="date"
                value={historyStartDate}
                onChange={(e) => setHistoryStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">እስከ ቀን፦</label>
              <input
                type="date"
                value={historyEndDate}
                onChange={(e) => setHistoryEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
              />
            </div>
            <button
              onClick={fetchHistory}
              className="mt-5 px-4 py-2 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold hover:bg-[#163177] transition-all cursor-pointer"
            >
              አጣራ
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            {historyLoading ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="w-7 h-7 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>መረጃ በመጫን ላይ...</span>
              </div>
            ) : records.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 m-5">
                ምንም የተገኝነት ታሪክ አልተገኘም።
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-slate-700">
                    <tr>
                      <th className="p-3.5">ቀን</th>
                      <th className="p-3.5">ተማሪ</th>
                      <th className="p-3.5">መለያ ቁጥር</th>
                      <th className="p-3.5">ኮርስ</th>
                      <th className="p-3.5">ሁኔታ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {records.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                          {formatEthiopianDate(r.date)}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {r.studentName || `${r.student?.firstName || ''} ${r.student?.lastName || ''}`}
                        </td>
                        <td className="p-3.5 font-mono text-slate-500 font-bold">
                          {r.student?.studentId || r.studentId || '-'}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{r.courseName || r.course?.name || '-'}</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              r.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700'
                                : r.status === 'Late'
                                ? 'bg-amber-50 text-amber-700'
                                : r.status === 'Excused'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {r.status === 'Present'
                              ? 'ተገኝቷል'
                              : r.status === 'Late'
                              ? 'ዘግይቷል'
                              : r.status === 'Excused'
                              ? 'ፈቃድ'
                              : 'አልተገኘም'}
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

export default TeacherAttendance;