'use client';

// src/features/admin/AttendanceManagement.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ClipboardList,
  Calendar,
  Search,
  QrCode,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileSpreadsheet,
  Download,
  Filter,
  Check,
  X,
  UserCheck,
  UserX,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  RefreshCw,
  Edit2,
  Trash2,
  Phone,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { PageHeader, Card, Button, Badge } from '../../components/ui';
import { FadeIn, MotionCard } from '../../components/motion';

const GRADE_OPTIONS = [
  { value: 'Grade 7', label: '7ኛ ክፍል' },
  { value: 'Grade 8', label: '8ኛ ክፍል' },
  { value: 'Grade 9', label: '9ኛ ክፍል' },
  { value: 'Grade 10', label: '10ኛ ክፍል' },
  { value: 'Grade 11', label: '11ኛ ክፍል' },
  { value: 'Grade 12', label: '12ኛ ክፍል' },
  { value: 'Batch 1', label: 'ዙር 1 (የርቀት)' },
  { value: 'Batch 2', label: 'ዙር 2 (የርቀት)' },
];

const AttendanceManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'rollcall' | 'single'

  // --- TAB 1: TODAY'S LIVE OVERVIEW ---
  const [todayDate, setTodayDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayRecords, setTodayRecords] = useState([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todaySearch, setTodaySearch] = useState('');
  const [todayStatusFilter, setTodayStatusFilter] = useState('all');

  // --- TAB 2: CLASS ROLL CALL ---
  const [selectedGrade, setSelectedGrade] = useState('Grade 10');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [rollCallDate, setRollCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [courses, setCourses] = useState([]);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterStatuses, setRosterStatuses] = useState({});
  const [isSubmittingRoster, setIsSubmittingRoster] = useState(false);
  const [rosterMessage, setRosterMessage] = useState(null);

  // --- TAB 3: QUICK SINGLE CHECK-IN ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [singleStatus, setSingleStatus] = useState('Present');
  const [singleCourseId, setSingleCourseId] = useState('');
  const [singleDate, setSingleDate] = useState(new Date().toISOString().split('T')[0]);
  const [singleSubmitting, setSingleSubmitting] = useState(false);
  const [singleFeedback, setSingleFeedback] = useState(null);

  // Load courses & initial today's attendance
  useEffect(() => {
    fetchCourses();
    fetchTodayAttendance();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await apiFetch('/api/courses');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.courses || [];
        setCourses(list);
        if (list.length > 0 && !selectedCourseId) {
          setSelectedCourseId(list[0]._id);
        }
      }
    } catch (err) {
      console.warn('Courses fetch error:', err);
    }
  };

  const fetchTodayAttendance = async () => {
    setTodayLoading(true);
    try {
      const res = await apiFetch(`/api/admin/attendance/report?startDate=${todayDate}&endDate=${todayDate}`);
      if (res.ok) {
        const data = await res.json();
        setTodayRecords(data.attendances || []);
      }
    } catch (err) {
      console.warn('Today attendance fetch error:', err);
    } finally {
      setTodayLoading(false);
    }
  };

  // Fetch Class Roster for Roll Call
  const fetchClassRoster = async () => {
    setRosterLoading(true);
    setRosterMessage(null);
    try {
      const params = new URLSearchParams({
        grade: selectedGrade,
        date: rollCallDate,
      });
      if (selectedCourseId) params.append('courseId', selectedCourseId);

      const res = await apiFetch(`/api/admin/attendance/roster?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const list = data.roster || [];
        setRoster(list);

        // Pre-fill statuses from existing record or default to Present
        const initialMap = {};
        list.forEach((s) => {
          initialMap[s._id] = s.status || 'Present';
        });
        setRosterStatuses(initialMap);
      }
    } catch (err) {
      console.warn('Roster fetch error:', err);
    } finally {
      setRosterLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rollcall') {
      fetchClassRoster();
    }
  }, [selectedGrade, selectedCourseId, rollCallDate, activeTab]);

  // Bulk Roll Call Submit
  const handleSaveRollCall = async () => {
    if (roster.length === 0) return;
    setIsSubmittingRoster(true);
    setRosterMessage(null);

    const records = roster.map((student) => ({
      studentId: student._id,
      status: rosterStatuses[student._id] || 'Present',
    }));

    try {
      const res = await apiFetch('/api/admin/attendance/bulk', {
        method: 'POST',
        body: JSON.stringify({
          records,
          courseId: selectedCourseId || null,
          date: rollCallDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRosterMessage({ type: 'success', text: data.message || 'የክፍሉ ተገኝነት በተሳካ ሁኔታ ተመዝግቧል!' });
        fetchTodayAttendance();
        fetchClassRoster();
      } else {
        setRosterMessage({ type: 'error', text: data.message || 'ተገኝነት መመዝገብ አልተቻለም።' });
      }
    } catch (err) {
      setRosterMessage({ type: 'error', text: err.message || 'የኔትወርክ ስህተት ተፈጥሯል።' });
    } finally {
      setIsSubmittingRoster(false);
    }
  };

  // Mark all roster helpers
  const handleMarkAll = (targetStatus) => {
    const updated = {};
    roster.forEach((s) => {
      updated[s._id] = targetStatus;
    });
    setRosterStatuses(updated);
  };

  // Quick Single Student Search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiFetch(`/api/admin/students?search=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.students || [];
          setSearchResults(list.slice(0, 6));
        }
      } catch (err) {
        console.warn('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Submit Single Student Check-In
  const handleSingleCheckIn = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      setSingleFeedback({ type: 'error', text: 'እባክዎ ተማሪ ይምረጡ' });
      return;
    }

    setSingleSubmitting(true);
    setSingleFeedback(null);

    try {
      const res = await apiFetch('/api/admin/attendance/manual', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedStudent._id,
          courseId: singleCourseId || null,
          status: singleStatus,
          date: singleDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSingleFeedback({
          type: 'success',
          text: `የ${selectedStudent.firstName} ${selectedStudent.lastName} ተገኝነት እንደ [${singleStatus}] ተመዝግቧል!`,
        });
        setSelectedStudent(null);
        setSearchQuery('');
        setSearchResults([]);
        fetchTodayAttendance();
      } else {
        setSingleFeedback({ type: 'error', text: data.message || 'ተገኝነት መመዝገብ አልተቻለም' });
      }
    } catch (err) {
      setSingleFeedback({ type: 'error', text: err.message || 'የኔትወርክ ስህተት ተፈጥሯል' });
    } finally {
      setSingleSubmitting(false);
    }
  };

  // Quick Update Status for an existing attendance record
  const handleUpdateRecordStatus = async (recordId, newStatus) => {
    try {
      const res = await apiFetch(`/api/admin/attendance/${recordId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTodayRecords((prev) =>
          prev.map((r) => (r._id === recordId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.warn('Update status error:', err);
    }
  };

  // Today stats computation
  const todayStats = useMemo(() => {
    return {
      total: todayRecords.length,
      present: todayRecords.filter((r) => r.status === 'Present').length,
      late: todayRecords.filter((r) => r.status === 'Late').length,
      excused: todayRecords.filter((r) => r.status === 'Excused').length,
      absent: todayRecords.filter((r) => r.status === 'Absent').length,
    };
  }, [todayRecords]);

  // Filtered today records
  const filteredTodayRecords = useMemo(() => {
    return todayRecords.filter((r) => {
      const matchesSearch =
        !todaySearch ||
        r.studentName?.toLowerCase().includes(todaySearch.toLowerCase()) ||
        r.student?.studentId?.toLowerCase().includes(todaySearch.toLowerCase()) ||
        r.courseName?.toLowerCase().includes(todaySearch.toLowerCase());

      const matchesStatus =
        todayStatusFilter === 'all' || r.status?.toLowerCase() === todayStatusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [todayRecords, todaySearch, todayStatusFilter]);

  return (
    <div className="space-y-6 font-sans">
      {/* 🌟 Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#1e3a8a] text-white flex items-center justify-center shadow-md">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                የተማሪዎች የተገኝነት ቁጥጥር ማዕከል
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                የዕለቱን የተገኝነት ሁኔታ ይከታተሉ፣ በክፍል ጥሪ ያድርጉ ወይም ፈጣን ምዝገባ ያከናውኑ
              </p>
            </div>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/qr-scanner"
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-slate-950" />
            <span>ቀጥታ QR ስካነር</span>
          </Link>

          <Link
            to="/admin/attendance-reports"
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1e3a8a] dark:text-blue-400" />
            <span>ሪፖርትና ስታቲስቲክስ</span>
          </Link>
        </div>
      </div>

      {/* 🌟 3 Main Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'today'
              ? 'bg-[#1e3a8a] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>የዛሬው የተገኝነት ሁኔታ (Today Live)</span>
          {todayStats.total > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
              {todayStats.total}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rollcall')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'rollcall'
              ? 'bg-[#1e3a8a] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>የክፍል ጥሪ መዝገብ (Class Roll Call)</span>
        </button>

        <button
          onClick={() => setActiveTab('single')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'single'
              ? 'bg-[#1e3a8a] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>ፈጣን መዝጋቢ (Quick Single Check-In)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TODAY'S LIVE OVERVIEW & STREAM                                      */}
      {/* ========================================================================= */}
      {activeTab === 'today' && (
        <FadeIn className="space-y-6">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Present */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">ተገኝተዋል (Present)</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {todayStats.present}
                </span>
                <span className="text-xs text-slate-400">ተማሪዎች</span>
              </div>
            </div>

            {/* Late */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">ዘግይተዋል (Late)</span>
                <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                  {todayStats.late}
                </span>
                <span className="text-xs text-slate-400">ተማሪዎች</span>
              </div>
            </div>

            {/* Excused */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">በፈቃድ የቀሩ (Excused)</span>
                <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#1e3a8a] dark:text-blue-400">
                  {todayStats.excused}
                </span>
                <span className="text-xs text-slate-400">ተማሪዎች</span>
              </div>
            </div>

            {/* Absent */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">ያልተገኙ (Absent)</span>
                <span className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
                  {todayStats.absent}
                </span>
                <span className="text-xs text-slate-400">ተማሪዎች</span>
              </div>
            </div>
          </div>

          {/* Today's Stream Table & Filters */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  የዕለቱ የተመዘገቡ ተማሪዎች ዝርዝር ({todayDate})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={todayDate}
                  onChange={(e) => {
                    setTodayDate(e.target.value);
                    fetchTodayAttendance();
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={fetchTodayAttendance}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition-colors"
                  title="አድስ"
                >
                  <RefreshCw className={`w-4 h-4 ${todayLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="በተማሪ ስም፣ መለያ ቁጥር ወይም ኮርስ ፈልግ..."
                  value={todaySearch}
                  onChange={(e) => setTodaySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                {['all', 'Present', 'Late', 'Excused', 'Absent'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setTodayStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      todayStatusFilter === st
                        ? 'bg-[#1e3a8a] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {st === 'all'
                      ? 'ሁሉም'
                      : st === 'Present'
                      ? 'ተገኝቷል'
                      : st === 'Late'
                      ? 'ዘግይቷል'
                      : st === 'Excused'
                      ? 'ፈቃድ'
                      : 'አልተገኘም'}
                  </button>
                ))}
              </div>
            </div>

            {/* Records List Table */}
            {todayLoading ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="w-7 h-7 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>መረጃ በመጫን ላይ...</span>
              </div>
            ) : filteredTodayRecords.length === 0 ? (
              <div className="py-14 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                ለዚህ ቀን የተገኘ የመገኘት መዝገብ የለም።
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-slate-700">
                    <tr>
                      <th className="p-3.5">ተማሪ</th>
                      <th className="p-3.5">መለያ ቁጥር</th>
                      <th className="p-3.5">ክፍል / ባች</th>
                      <th className="p-3.5">ኮርስ</th>
                      <th className="p-3.5">የመግቢያ ሰዓት</th>
                      <th className="p-3.5">ሁኔታ</th>
                      <th className="p-3.5 text-center">ሁኔታ ቀይር</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTodayRecords.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {r.studentName || `${r.student?.firstName || ''} ${r.student?.lastName || ''}`}
                        </td>
                        <td className="p-3.5 font-mono text-slate-500 font-bold">
                          {r.student?.studentId || r.studentId || '-'}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {r.grade || r.student?.grade || '-'}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {r.courseName || r.course?.name || 'አጠቃላይ'}
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">
                          {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="p-3.5">
                          {r.status === 'Present' && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 text-xs font-bold">
                              ተገኝቷል
                            </span>
                          )}
                          {r.status === 'Late' && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 text-xs font-bold">
                              ዘግይቷል
                            </span>
                          )}
                          {r.status === 'Excused' && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 text-xs font-bold">
                              ፈቃድ
                            </span>
                          )}
                          {r.status === 'Absent' && (
                            <span className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 text-xs font-bold">
                              አልተገኘም
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <select
                            value={r.status}
                            onChange={(e) => handleUpdateRecordStatus(r._id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                          >
                            <option value="Present">ተገኝቷል</option>
                            <option value="Late">ዘግይቷል</option>
                            <option value="Excused">ፈቃድ</option>
                            <option value="Absent">አልተገኘም</option>
                          </select>
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

      {/* ========================================================================= */}
      {/* TAB 2: CLASS-BY-CLASS ROLL CALL & BULK MARKER                              */}
      {/* ========================================================================= */}
      {activeTab === 'rollcall' && (
        <FadeIn className="space-y-6">
          {/* Roll Call Filter & Control Bar */}
          <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Grade Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  ክፍል / ባች ይምረጡ
                </label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  የትምህርት ዓይነት (ኮርስ)
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- አጠቃላይ መገኘት --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  የተገኝነት ቀን
                </label>
                <input
                  type="date"
                  value={rollCallDate}
                  onChange={(e) => setRollCallDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                </input>
              </div>
            </div>

            {/* Quick Bulk Action Toggles */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">ፈጣን መራጭ፦</span>
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

              <div className="text-xs font-bold text-slate-500">
                ጠቅላላ ተማሪዎች፦ <strong>{roster.length}</strong>
              </div>
            </div>
          </div>

          {/* Feedback Message */}
          {rosterMessage && (
            <div
              className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                rosterMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {rosterMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{rosterMessage.text}</span>
            </div>
          )}

          {/* Roster Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            {rosterLoading ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                <div className="w-7 h-7 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>የተማሪዎች ዝርዝር በመጫን ላይ...</span>
              </div>
            ) : roster.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 m-6">
                ለዚህ ክፍል የተመዘገበ ተማሪ አልተገኘም።
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200/60 dark:border-slate-700">
                      <tr>
                        <th className="p-4 w-12 text-center">#</th>
                        <th className="p-4">የተማሪው ስም</th>
                        <th className="p-4">መለያ ቁጥር</th>
                        <th className="p-4">ስልክ</th>
                        <th className="p-4 text-center">የተገኝነት ሁኔታ (Status)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {roster.map((s, idx) => {
                        const currentStatus = rosterStatuses[s._id] || 'Present';
                        return (
                          <tr key={s._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="p-4 text-center font-mono text-slate-400">{idx + 1}</td>
                            <td className="p-4 font-bold text-slate-900 dark:text-white">
                              {s.fullName}
                            </td>
                            <td className="p-4 font-mono text-slate-500 font-bold">{s.studentId || '-'}</td>
                            <td className="p-4 text-slate-500">{s.phone || '-'}</td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-1.5">
                                {[
                                  { value: 'Present', label: 'ተገኝቷል', activeBg: 'bg-emerald-600 text-white shadow-xs' },
                                  { value: 'Late', label: 'ዘግይቷል', activeBg: 'bg-amber-500 text-white shadow-xs' },
                                  { value: 'Excused', label: 'ፈቃድ', activeBg: 'bg-blue-600 text-white shadow-xs' },
                                  { value: 'Absent', label: 'አልተገኘም', activeBg: 'bg-rose-600 text-white shadow-xs' },
                                ].map((opt) => (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                      setRosterStatuses((prev) => ({ ...prev, [s._id]: opt.value }))
                                    }
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                      currentStatus === opt.value
                                        ? opt.activeBg
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

                {/* Submit Roll Call Footer */}
                <div className="p-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button
                    onClick={handleSaveRollCall}
                    disabled={isSubmittingRoster || roster.length === 0}
                    className="bg-[#1e3a8a] hover:bg-[#163177] text-white px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmittingRoster ? 'በመመዝገብ ላይ...' : 'የክፍሉን ተገኝነት መዝግብ / አስቀምጥ'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUICK SINGLE STUDENT CHECK-IN                                       */}
      {/* ========================================================================= */}
      {activeTab === 'single' && (
        <FadeIn className="max-w-2xl mx-auto">
          <Card variant="default" padding="lg" className="space-y-6">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#1e3a8a] dark:text-blue-400" />
                <span>ፈጣን የተማሪ ተገኝነት መዝጋቢ (Single Student Check-In)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ተማሪውን በስም ወይም በመለያ ቁጥር ፈልገው በ1-ክሊክ ተገኝነት ይመዝግቡ
              </p>
            </div>

            {singleFeedback && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                  singleFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {singleFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{singleFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSingleCheckIn} className="space-y-5">
              {/* Student Search with Autocomplete */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  ተማሪ ፈልግ (በስም፣ መለያ ወይም ስልክ)
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ለምሳሌ፦ አበበ ወይም TKR-..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {isSearching && (
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {searchResults.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                    {searchResults.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => {
                          setSelectedStudent(s);
                          setSearchQuery([s.firstName, s.middleName, s.lastName].filter(Boolean).join(' '));
                          setSearchResults([]);
                        }}
                        className="w-full p-3 text-left hover:bg-blue-50/60 dark:hover:bg-slate-700 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-bold text-xs text-slate-900 dark:text-white">
                            {[s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{s.studentId || '-'}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-300">
                          {s.grade || s.batch || 'መደበኛ'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Student Card */}
              {selectedStudent && (
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#1e3a8a] text-white font-black flex items-center justify-center text-sm shadow-xs">
                      {selectedStudent.firstName?.[0] || 'ተ'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900 dark:text-white">
                        {[selectedStudent.firstName, selectedStudent.middleName, selectedStudent.lastName].filter(Boolean).join(' ')}
                      </p>
                      <p className="text-xs text-[#1e3a8a] dark:text-blue-300 font-mono font-bold">
                        መለያ፦ {selectedStudent.studentId || '-'} • ክፍል፦ {selectedStudent.grade || '-'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null);
                      setSearchQuery('');
                    }}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Course Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  የትምህርት ዓይነት (ኮርስ)
                </label>
                <select
                  value={singleCourseId}
                  onChange={(e) => setSingleCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <option value="">-- አጠቃላይ መገኘት --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    ቀን
                  </label>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    የተገኝነት ሁኔታ
                  </label>
                  <select
                    value={singleStatus}
                    onChange={(e) => setSingleStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200"
                  >
                    <option value="Present">ተገኝቷል (Present)</option>
                    <option value="Late">ዘግይቷል (Late)</option>
                    <option value="Excused">ፈቃድ (Excused)</option>
                    <option value="Absent">አልተገኘም (Absent)</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={singleSubmitting || !selectedStudent}
                className="w-full bg-[#1e3a8a] hover:bg-[#163177] text-white py-3 rounded-xl text-xs sm:text-sm font-black shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{singleSubmitting ? 'በመመዝገብ ላይ...' : 'ተገኝነት መዝግብ'}</span>
              </Button>
            </form>
          </Card>
        </FadeIn>
      )}
    </div>
  );
};

export default AttendanceManagement;