'use client';

// src/features/teacher/TeacherAttendance.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  RefreshCw,
  QrCode,
  FileText,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate, getEthiopianLocalDateString } from '../../utils/ethiopianDate';
import { formatGradeAmharic } from '../../constants/registrationOptions';
import { Button } from '../../components/ui';
import { FadeIn } from '../../components/motion';

const normalizeCourseShift = (rawShift) => {
  if (!rawShift) return 'weekend';
  const s = String(rawShift).toLowerCase();
  if (s.includes('night') || s.includes('ማታ')) return 'night';
  return 'weekend';
};

const TeacherAttendance = () => {
  const [activeTab, setActiveTab] = useState('rollcall'); // 'rollcall' | 'history'
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [rollCallDate, setRollCallDate] = useState(() => getEthiopianLocalDateString());

  // Roll call state
  const [roster, setRoster] = useState([]);
  const [rosterStatuses, setRosterStatuses] = useState({});
  const [rosterReasons, setRosterReasons] = useState({});
  const [rosterSearch, setRosterSearch] = useState('');
  const [rosterLoading, setRosterLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // History state
  const [records, setRecords] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');

  const selectedCourse = useMemo(
    () => courses.find((c) => c._id === selectedCourseId) || null,
    [courses, selectedCourseId]
  );

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

  // Fetch student roster scoped to selected course (grade + studentType + shift)
  const fetchRoster = async () => {
    if (!selectedCourseId) return;
    setRosterLoading(true);
    setFeedbackMessage(null);
    try {
      const params = new URLSearchParams({
        courseId: selectedCourseId,
        date: rollCallDate,
      });
      if (selectedCourse?.grade) params.append('grade', selectedCourse.grade);
      if (selectedCourse?.studentType) params.append('studentType', selectedCourse.studentType);
      if (selectedCourse?.studentType !== 'distance' && selectedCourse?.shift) {
        params.append('shift', normalizeCourseShift(selectedCourse.shift));
      }

      const res = await apiFetch(`/api/admin/attendance/roster?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.roster || [];
        setRoster(list);
        const initialMap = {};
        const initialReasons = {};
        list.forEach((s) => {
          initialMap[s._id] = s.status || 'Unmarked';
          initialReasons[s._id] = s.excuseReason || s.note || '';
        });
        setRosterStatuses(initialMap);
        setRosterReasons(initialReasons);
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
      status: rosterStatuses[s._id] === 'Unmarked' ? 'Absent' : (rosterStatuses[s._id] || 'Absent'),
      excuseReason: rosterReasons[s._id] || '',
      note: rosterReasons[s._id] || '',
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

  // Auto-Mark Unscanned as Absent
  const handleAutoMarkAbsent = async () => {
    if (!selectedCourseId) return;
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const payload = {
        courseId: selectedCourseId,
        date: rollCallDate,
        defaultStatus: 'Absent',
        grade: selectedCourse?.grade || undefined,
        studentType: selectedCourse?.studentType || 'regular',
        shift:
          selectedCourse?.studentType === 'distance'
            ? undefined
            : normalizeCourseShift(selectedCourse?.shift),
      };

      const res = await apiFetch('/api/admin/attendance/mark-unscanned-absent', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage({
          type: 'success',
          text: data.message || `ያልተገኙ ተማሪዎች (${data.markedAbsentCount || 0}) 'አልተገኘም' ተብለው ተመዝግበዋል!`,
        });
        fetchRoster();
      } else {
        setFeedbackMessage({ type: 'error', text: data.message || 'ስህተት ተፈጥሯል' });
      }
    } catch (err) {
      setFeedbackMessage({ type: 'error', text: err.message || 'የኔትወርክ ስህተት ተፈጥሯል' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAll = (status) => {
    const updated = {};
    roster.forEach((s) => {
      if (rosterStatuses[s._id] === 'Excused' && status !== 'Excused') {
        updated[s._id] = 'Excused';
      } else {
        updated[s._id] = status;
      }
    });
    setRosterStatuses(updated);
  };

  // Live Roll Call Stats & Filtered Roster
  const rollCallStats = useMemo(() => {
    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;
    let unmarked = 0;
    roster.forEach((s) => {
      const st = rosterStatuses[s._id] || s.status || 'Unmarked';
      if (st === 'Present') present++;
      else if (st === 'Late') late++;
      else if (st === 'Excused') excused++;
      else if (st === 'Absent') absent++;
      else unmarked++;
    });
    return { total: roster.length, present, late, excused, absent, unmarked };
  }, [roster, rosterStatuses]);

  const filteredRoster = useMemo(() => {
    const q = rosterSearch.trim().toLowerCase();
    if (!q) return roster;
    return roster.filter(
      (s) =>
        s.fullName?.toLowerCase().includes(q) ||
        s.studentId?.toLowerCase().includes(q) ||
        s.christianName?.toLowerCase().includes(q)
    );
  }, [roster, rosterSearch]);

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

  const filteredHistory = useMemo(() => {
    if (historyStatusFilter === 'all') return records;
    return records.filter((r) => r.status === historyStatusFilter);
  }, [records, historyStatusFilter]);

  const handleExportHistoryCSV = () => {
    if (!filteredHistory.length) return;
    const headers = ['ቀን', 'ተማሪ', 'መለያ ቁጥር', 'ኮርስ / ክፍለ-ጊዜ', 'ሁኔታ', 'ማስታወሻ'];
    const rows = filteredHistory.map((r) => {
      const name =
        r.studentName ||
        r.student?.fullName ||
        [r.student?.firstName, r.student?.middleName, r.student?.lastName].filter(Boolean).join(' ') ||
        '-';
      const note = (r.excuseReason || r.note || '').replace(/"/g, '""');
      return [
        `"${formatEthiopianDate(r.date)}"`,
        `"${name}"`,
        `"${r.student?.studentId || r.studentId || '-'}"`,
        `"${r.courseName || r.course?.name || r.sessionId?.title || r.session || '-'}"`,
        `"${r.status || ''}"`,
        `"${note}"`,
      ].join(',');
    });
    const blob = new Blob(['\uFEFF' + [headers.join(','), ...rows].join('\n')], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teacher-attendance-${getEthiopianLocalDateString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/qr-scanner"
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-slate-950" />
            <span>ቀጥታ QR ስካነር</span>
          </Link>

          {/* Course Dropdown */}
          <div className="w-full sm:w-64">
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  📖 {c.name} {c.grade ? `(${formatGradeAmharic(c.grade)})` : ''}
                </option>
              ))}
            </select>
          </div>
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
          {/* Controls & Live Summary Strip */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">ቀን፦</label>
                  <input
                    type="date"
                    value={rollCallDate}
                    onChange={(e) => setRollCallDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={rosterSearch}
                    onChange={(e) => setRosterSearch(e.target.value)}
                    placeholder="ተማሪ በስም ወይም መለያ ፈልግ..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#1e3a8a]"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoMarkAbsent}
                  disabled={isSubmitting || roster.length === 0}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="ያላስነበቡትንና ያልተገኙትን ተማሪዎች በሙሉ አልተገኘም ብለህ መዝግብ"
                >
                  <span>⚡ ያልተገኙትን &quot;አልተገኘም&quot; አድርግ</span>
                </button>
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
                <button
                  type="button"
                  onClick={fetchRoster}
                  disabled={rosterLoading}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                  title="አድስ"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${rosterLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Live Roll Call Tally Pills */}
            {roster.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ጠቅላላ፦ {rollCallStats.total}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  ✓ ተገኝተዋል፦ {rollCallStats.present}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  🕒 ዘግይተዋል፦ {rollCallStats.late}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  📋 በፈቃድ፦ {rollCallStats.excused}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  ✗ አልተገኙም፦ {rollCallStats.absent}
                </span>
                {rollCallStats.unmarked > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    ⚪ ያልተመዘገቡ፦ {rollCallStats.unmarked}
                  </span>
                )}
              </div>
            )}
          </div>

          {feedbackMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                feedbackMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
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
            ) : filteredRoster.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 m-5">
                {roster.length === 0
                  ? 'በዚህ ኮርስ የተመዘገበ ተማሪ የለም።'
                  : 'በፍለጋው ውስጥ የሚዛመድ ተማሪ አልተገኘም።'}
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
                        <th className="p-3.5">የስካን ሁኔታ</th>
                        <th className="p-3.5 text-center">የተገኝነት ሁኔታ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredRoster.map((s, idx) => {
                        const curStatus = rosterStatuses[s._id] || (s.status || 'Unmarked');
                        return (
                          <tr key={s._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                            <td className="p-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-2.5">
                                {s.photoUrl ? (
                                  <img
                                    src={s.photoUrl}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                                    {s.fullName ? s.fullName.charAt(0) : 'ተ'}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 dark:text-white block leading-tight truncate">
                                    {s.fullName}
                                  </span>
                                  {s.christianName && (
                                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium block truncate">
                                      † {s.christianName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 font-mono text-slate-500 font-bold">{s.studentId || '-'}</td>
                            <td className="p-3.5">
                              {s.status === 'Present' || s.status === 'Late' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 text-[10px] font-bold">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>{s.status === 'Late' ? 'ዘግይቶ ተመዝግቧል' : 'ተመዝግቧል'}</span>
                                </span>
                              ) : s.status === 'Excused' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 text-[10px] font-bold">
                                  <AlertCircle className="w-3 h-3 text-blue-600" />
                                  <span>በፈቃድ የቀረ</span>
                                </span>
                              ) : s.status === 'Absent' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 text-[10px] font-bold">
                                  <span>አልተገኘም</span>
                                </span>
                              ) : (
                                <span className="text-slate-400 text-[10px]">⚪ ያልተመዘገበ</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-center gap-1.5 flex-wrap">
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
                                {curStatus === 'Excused' && (
                                  <div className="flex items-center justify-center">
                                    <input
                                      type="text"
                                      value={rosterReasons[s._id] || ''}
                                      onChange={(e) =>
                                        setRosterReasons((prev) => ({ ...prev, [s._id]: e.target.value }))
                                      }
                                      placeholder="የፈቃድ ምክንያት (አማራጭ)..."
                                      className="w-full max-w-[260px] px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 text-[11px] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    ያልተመረጡ ተማሪዎች ሲቀመጡ በራስ-ሰር &quot;አልተገኘም&quot; ይባላሉ
                  </span>
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
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
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
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">ሁኔታ፦</label>
                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="all">ሁሉም</option>
                  <option value="Present">ተገኝቷል</option>
                  <option value="Late">ዘግይቷል</option>
                  <option value="Excused">በፈቃድ</option>
                  <option value="Absent">አልተገኘም</option>
                </select>
              </div>
              <button
                onClick={fetchHistory}
                className="px-4 py-2 rounded-xl bg-[#1e3a8a] text-white text-xs font-bold hover:bg-[#163177] transition-all cursor-pointer"
              >
                አጣራ
              </button>
            </div>

            {filteredHistory.length > 0 && (
              <button
                type="button"
                onClick={handleExportHistoryCSV}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                <span>CSV አውርድ ({filteredHistory.length})</span>
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            {historyLoading ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="w-7 h-7 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>መረጃ በመጫን ላይ...</span>
              </div>
            ) : filteredHistory.length === 0 ? (
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
                      <th className="p-3.5">ኮርስ / ክፍለ-ጊዜ</th>
                      <th className="p-3.5">ሁኔታ</th>
                      <th className="p-3.5">ማስታወሻ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredHistory.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                          {formatEthiopianDate(r.date)}
                        </td>
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {r.studentName || r.student?.fullName || [r.student?.firstName, r.student?.middleName, r.student?.lastName].filter(Boolean).join(' ') || '-'}
                        </td>
                        <td className="p-3.5 font-mono text-slate-500 font-bold">
                          {r.student?.studentId || r.studentId || '-'}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {r.courseName || r.course?.name || r.sessionId?.title || r.session || '-'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              r.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : r.status === 'Late'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : r.status === 'Excused'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
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
                        <td className="p-3.5 text-slate-500 dark:text-slate-400">
                          {r.excuseReason || r.note ? (
                            <span className="inline-flex items-center gap-1 text-[11px]">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span>{r.excuseReason || r.note}</span>
                            </span>
                          ) : (
                            '—'
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
      )}
    </div>
  );
};

export default TeacherAttendance;
