'use client';

// src/features/admin/AttendanceManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Zap,
  Plus,
  Play,
  Square,
  ShieldAlert,
  CalendarCheck,
  CalendarX,
  Sliders,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { formatGradeAmharic } from '../../constants/registrationOptions';
import { PageHeader, Card, Button, Badge } from '../../components/ui';
import { FadeIn, MotionCard } from '../../components/motion';
import { toast } from '../../utils/toast';

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

const DAYS_OF_WEEK = [
  { value: 0, labelAm: 'እሑድ (Sunday)', labelEn: 'Sunday' },
  { value: 1, labelAm: 'ሰኞ (Monday)', labelEn: 'Monday' },
  { value: 2, labelAm: 'ማክሰኞ (Tuesday)', labelEn: 'Tuesday' },
  { value: 3, labelAm: 'ረቡዕ (Wednesday)', labelEn: 'Wednesday' },
  { value: 4, labelAm: 'ሐሙስ (Thursday)', labelEn: 'Thursday' },
  { value: 5, labelAm: 'ዓርብ (Friday)', labelEn: 'Friday' },
  { value: 6, labelAm: 'ቅዳሜ (Saturday)', labelEn: 'Saturday' },
];

const AttendanceManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'schedules' | 'sessions' | 'rollcall' | 'single'

  // --- TAB 1: TODAY'S LIVE OVERVIEW ---
  const [todayDate, setTodayDate] = useState(new Date().toISOString().split('T')[0]);
  const [todayRecords, setTodayRecords] = useState([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todaySearch, setTodaySearch] = useState('');
  const [todayStatusFilter, setTodayStatusFilter] = useState('all');

  // --- TAB 2: RECURRING TIMETABLES (ClassSchedule) ---
  const [schedules, setSchedules] = useState([]);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    grade: 'Grade 8',
    studentType: 'regular',
    shift: 'weekend',
    dayOfWeek: 0,
    startTime: '17:00',
    endTime: '19:00',
    lateThresholdMinutes: 15,
    assignedTakers: [],
    location: '',
    notes: '',
  });

  // --- TAB 3: CLASS SESSIONS & CALENDAR ---
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionFilterGrade, setSessionFilterGrade] = useState('all');
  const [sessionFilterStatus, setSessionFilterStatus] = useState('all');
  const [sessionStartDate, setSessionStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionEndDate, setSessionEndDate] = useState('');
  const [selectedSessionForRoster, setSelectedSessionForRoster] = useState(null);
  const [sessionRoster, setSessionRoster] = useState([]);
  const [sessionRosterLoading, setSessionRosterLoading] = useState(false);

  // Reschedule & Cancel & Makeup Modals
  const [rescheduleModalSession, setRescheduleModalSession] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  const [cancelModalSession, setCancelModalSession] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const [showMakeupModal, setShowMakeupModal] = useState(false);
  const [makeupForm, setMakeupForm] = useState({
    title: '',
    grade: 'Grade 8',
    studentType: 'regular',
    shift: 'weekend',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '17:00',
    endTime: '19:00',
    lateThresholdMinutes: 15,
    location: '',
    notes: '',
  });

  // --- TAB 4: CLASS ROLL CALL ---
  const [selectedGrade, setSelectedGrade] = useState('Grade 10');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [rollCallDate, setRollCallDate] = useState(new Date().toISOString().split('T')[0]);
  const [courses, setCourses] = useState([]);
  const [roster, setRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterStatuses, setRosterStatuses] = useState({});
  const [rosterReasons, setRosterReasons] = useState({});
  const [isSubmittingRoster, setIsSubmittingRoster] = useState(false);
  const [isAutoFinalizing, setIsAutoFinalizing] = useState(false);
  const [rosterMessage, setRosterMessage] = useState(null);

  // Excuse modal state
  const [excuseModalStudent, setExcuseModalStudent] = useState(null);
  const [excuseReasonInput, setExcuseReasonInput] = useState('');

  // --- TAB 5: QUICK SINGLE CHECK-IN ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [singleStatus, setSingleStatus] = useState('Present');
  const [singleExcuseReason, setSingleExcuseReason] = useState('');
  const [singleCourseId, setSingleCourseId] = useState('');
  const [singleDate, setSingleDate] = useState(new Date().toISOString().split('T')[0]);
  const [singleSubmitting, setSingleSubmitting] = useState(false);
  const [singleFeedback, setSingleFeedback] = useState(null);

  // 1. Initial Load
  useEffect(() => {
    fetchCourses();
    fetchTeachers();
    fetchTodayAttendance();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await apiFetch('/api/education/courses');
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : data.courses || []);
      }
    } catch (err) {}
  };

  const fetchTeachers = async () => {
    try {
      const res = await apiFetch('/api/admin/teachers');
      if (res.ok) {
        const data = await res.json();
        setTeachersList(Array.isArray(data) ? data : data.teachers || []);
      }
    } catch (err) {}
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
    } finally {
      setTodayLoading(false);
    }
  };

  // 2. Fetch Recurring Schedules
  const fetchSchedules = useCallback(async () => {
    setSchedulesLoading(true);
    try {
      const res = await apiFetch('/api/education/attendance/schedules');
      if (res.ok) {
        const data = await res.json();
        setSchedules(data.schedules || []);
      }
    } catch (err) {
      toast.error('Failed to load schedules');
    } finally {
      setSchedulesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'schedules') fetchSchedules();
  }, [activeTab, fetchSchedules]);

  // 3. Fetch Class Sessions
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const params = new URLSearchParams();
      if (sessionStartDate) params.append('startDate', sessionStartDate);
      if (sessionEndDate) params.append('endDate', sessionEndDate);
      if (sessionFilterGrade !== 'all') params.append('grade', sessionFilterGrade);
      if (sessionFilterStatus !== 'all') params.append('status', sessionFilterStatus);

      const res = await apiFetch(`/api/education/attendance/sessions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      toast.error('Failed to load class sessions');
    } finally {
      setSessionsLoading(false);
    }
  }, [sessionStartDate, sessionEndDate, sessionFilterGrade, sessionFilterStatus]);

  useEffect(() => {
    if (activeTab === 'sessions') fetchSessions();
  }, [activeTab, fetchSessions]);

  // Handle Save / Edit Schedule
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const endpoint = editingSchedule
        ? `/api/education/attendance/schedules/${editingSchedule._id}`
        : '/api/education/attendance/schedules';
      const method = editingSchedule ? 'PUT' : 'POST';

      const res = await apiFetch(endpoint, {
        method,
        body: JSON.stringify(scheduleForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(editingSchedule ? 'መርሃ-ግብሩ ተስተካክሏል' : 'አዲስ ሳምንታዊ መርሃ-ግብር ተመዝግቧል');
        setShowScheduleModal(false);
        setEditingSchedule(null);
        fetchSchedules();
      } else {
        toast.error(data.message || 'ስህተት ተፈጥሯል');
      }
    } catch (err) {
      toast.error('የኔትወርክ ስህተት ተፈጥሯል');
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('ይህን ሳምንታዊ መርሃ-ግብር መሰረዝ እርግጠኛ ነዎት?')) return;
    try {
      const res = await apiFetch(`/api/education/attendance/schedules/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('መርሃ-ግብሩ ተሰርዟል');
        fetchSchedules();
      }
    } catch (err) {
      toast.error('ስህተት ተፈጥሯል');
    }
  };

  // Handle Reschedule Session
  const handleExecuteReschedule = async () => {
    if (!rescheduleModalSession) return;
    try {
      const res = await apiFetch(`/api/education/attendance/sessions/${rescheduleModalSession._id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify({
          newDate: rescheduleDate,
          newStartTime: rescheduleStartTime,
          reason: rescheduleReason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('ክፍለ-ጊዜው ወደ ሌላ ቀን/ሰዓት ተቀይሯል');
        setRescheduleModalSession(null);
        fetchSessions();
      } else {
        toast.error(data.message || 'ስህተት ተፈጥሯል');
      }
    } catch (err) {
      toast.error('የኔትወርክ ስህተት');
    }
  };

  // Handle Cancel Session
  const handleExecuteCancel = async () => {
    if (!cancelModalSession) return;
    try {
      const res = await apiFetch(`/api/education/attendance/sessions/${cancelModalSession._id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: cancelReason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('ክፍለ-ጊዜው ተሰርዟል (ተማሪዎች ሳይቀጡ)');
        setCancelModalSession(null);
        fetchSessions();
      } else {
        toast.error(data.message || 'ስህተት ተፈጥሯል');
      }
    } catch (err) {
      toast.error('የኔትወርክ ስህተት');
    }
  };

  // Handle Create Make-up Session
  const handleCreateMakeup = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/api/education/attendance/sessions/makeup', {
        method: 'POST',
        body: JSON.stringify(makeupForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('ተጨማሪ/ማካካሻ ክፍለ-ጊዜ ተፈጥሯል');
        setShowMakeupModal(false);
        fetchSessions();
      } else {
        toast.error(data.message || 'ስህተት ተፈጥሯል');
      }
    } catch (err) {
      toast.error('የኔትወርክ ስህተት');
    }
  };

  // View Session Live Roster
  const handleViewSessionRoster = async (session) => {
    setSelectedSessionForRoster(session);
    setSessionRosterLoading(true);
    try {
      const res = await apiFetch(`/api/education/attendance/sessions/${session._id}/live-roster`);
      if (res.ok) {
        const data = await res.json();
        setSessionRoster(data.roster || []);
      }
    } catch (err) {
      toast.error('ሮስተር መጫን አልተቻለም');
    } finally {
      setSessionRosterLoading(false);
    }
  };

  // Roll Call Helpers
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
        const initialStatusMap = {};
        const initialReasonMap = {};
        list.forEach((s) => {
          initialStatusMap[s._id] = s.status || 'Unmarked';
          initialReasonMap[s._id] = s.excuseReason || s.note || '';
        });
        setRosterStatuses(initialStatusMap);
        setRosterReasons(initialReasonMap);
      }
    } catch (err) {
    } finally {
      setRosterLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rollcall') fetchClassRoster();
  }, [selectedGrade, selectedCourseId, rollCallDate, activeTab]);

  const handleSaveRollCall = async () => {
    if (roster.length === 0) return;
    setIsSubmittingRoster(true);
    setRosterMessage(null);

    const records = roster.map((student) => ({
      studentId: student._id,
      status: rosterStatuses[student._id] === 'Unmarked' ? 'Absent' : (rosterStatuses[student._id] || 'Absent'),
      excuseReason: rosterReasons[student._id] || '',
      note: rosterReasons[student._id] || '',
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

  // Quick Single Student Check-In Search
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
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // Stats computation
  const todayStats = useMemo(() => {
    return {
      total: todayRecords.length,
      present: todayRecords.filter((r) => r.status === 'Present').length,
      late: todayRecords.filter((r) => r.status === 'Late').length,
      excused: todayRecords.filter((r) => r.status === 'Excused').length,
      absent: todayRecords.filter((r) => r.status === 'Absent').length,
    };
  }, [todayRecords]);

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
                ሳምንታዊ መርሃ-ግብር ይመድቡ፣ የክፍለ-ጊዜዎችን ሁኔታ ይቆጣጠሩ ወይም ቀጥታ ስካነር ይክፈቱ
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

      {/* 🌟 5 Main Navigation Tabs */}
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
          <span>የዛሬው የተገኝነት ሁኔታ</span>
          {todayStats.total > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
              {todayStats.total}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'schedules'
              ? 'bg-[#1e3a8a] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>ሳምንታዊ ፕሮግራሞች (Timetables)</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'sessions'
              ? 'bg-[#1e3a8a] text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>የክፍለ-ጊዜዎች ካላንደር (Sessions)</span>
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
          <span>የክፍል ጥሪ መዝገብ (Roll Call)</span>
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
          <span>ፈጣን መዝጋቢ</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TODAY'S LIVE OVERVIEW                                              */}
      {/* ========================================================================= */}
      {activeTab === 'today' && (
        <FadeIn className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                >
                  <RefreshCw className={`w-4 h-4 ${todayLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="በተማሪ ስም፣ መለያ ቁጥር ፈልግ..."
                  value={todaySearch}
                  onChange={(e) => setTodaySearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

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

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-3 px-3">ተማሪ</th>
                    <th className="py-3 px-3">ክፍል</th>
                    <th className="py-3 px-3">ሰዓት</th>
                    <th className="py-3 px-3">ሁኔታ</th>
                    <th className="py-3 px-3">መዝጋቢ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {todayLoading ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        በመጫን ላይ...
                      </td>
                    </tr>
                  ) : filteredTodayRecords.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        ምንም የተመዘገበ ተማሪ አልተገኘም
                      </td>
                    </tr>
                  ) : (
                    filteredTodayRecords.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {r.studentName}
                          <span className="block text-[10px] text-slate-400 font-mono font-normal">
                            {r.student?.studentId || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-3">{formatGradeAmharic(r.grade)}</td>
                        <td className="py-3 px-3 font-mono">
                          {r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              r.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : r.status === 'Late'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : r.status === 'Excused'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
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
                        <td className="py-3 px-3 text-slate-400">{r.recordedBy?.fullName || r.teacherName || 'አስተዳዳሪ'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RECURRING TIMETABLES & TAKER ASSIGNMENTS                            */}
      {/* ========================================================================= */}
      {activeTab === 'schedules' && (
        <FadeIn className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                ሳምንታዊ የክፍል መርሃ-ግብሮችና የተመደቡ መዝጋቢዎች
              </h3>
              <p className="text-xs text-slate-500">
                መደበኛ ሳምንታዊ የትምህርት ቀናትንና የተፈቀደላቸውን መምህራን እዚህ ይመድቡ
              </p>
            </div>

            <Button
              onClick={() => {
                setEditingSchedule(null);
                setScheduleForm({
                  name: '',
                  grade: 'Grade 8',
                  studentType: 'regular',
                  shift: 'weekend',
                  dayOfWeek: 0,
                  startTime: '17:00',
                  endTime: '19:00',
                  lateThresholdMinutes: 15,
                  assignedTakers: [],
                  location: '',
                  notes: '',
                });
                setShowScheduleModal(true);
              }}
              className="bg-[#1e3a8a] text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>አዲስ ሳምንታዊ ፕሮግራም መድብ</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schedulesLoading ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#1e3a8a]" />
                <span>መርሃ-ግብሮች እየተጫኑ ነው...</span>
              </div>
            ) : schedules.length === 0 ? (
              <div className="col-span-full py-12 text-center text-xs text-slate-400">
                ምንም የተመደበ ሳምንታዊ መርሃ-ግብር የለም። "አዲስ መድብ" የሚለውን ቁልፍ ይጠቀሙ።
              </div>
            ) : (
              schedules.map((sch) => {
                const dayObj = DAYS_OF_WEEK.find((d) => d.value === sch.dayOfWeek);

                return (
                  <div
                    key={sch._id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-[#1e3a8a] dark:text-blue-400">
                              {formatGradeAmharic(sch.grade)}
                            </span>
                            {sch.studentType === 'distance' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                                🌐 የርቀት
                              </span>
                            ) : sch.shift === 'night' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                🌙 የማታ ፈረቃ
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                ☀️ የቀን / ቅዳሜ-እሁድ
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1">
                            {sch.name || (dayObj ? dayObj.labelAm : 'ሳምንታዊ')}
                          </h4>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                          ንቁ ፕሮግራም
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>
                            {sch.startTime} – {sch.endTime} (መዘግየት፦ {sch.lateThresholdMinutes || 15} ደቂቃ)
                          </span>
                        </div>

                        {sch.location && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>ቦታ፦ {sch.location}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-bold text-slate-500 block mb-1">
                            የተመደቡ መዝጋቢዎች / መምህራን፦
                          </span>
                          {sch.assignedTakers && sch.assignedTakers.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {sch.assignedTakers.map((t) => (
                                <span
                                  key={t._id || t}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                >
                                  👤 {t.fullName || 'መምህር'}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                              ⚠️ አልተመደበም (አስተዳዳሪዎች ብቻ)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSchedule(sch);
                          setScheduleForm({
                            name: sch.name || '',
                            grade: sch.grade,
                            studentType: sch.studentType || (sch.grade?.toLowerCase().includes('batch') || sch.grade?.includes('ዙር') ? 'distance' : 'regular'),
                            shift: sch.shift || 'weekend',
                            dayOfWeek: sch.dayOfWeek,
                            startTime: sch.startTime,
                            endTime: sch.endTime,
                            lateThresholdMinutes: sch.lateThresholdMinutes || 15,
                            assignedTakers: sch.assignedTakers ? sch.assignedTakers.map((t) => t._id || t) : [],
                            location: sch.location || '',
                            notes: sch.notes || '',
                          });
                          setShowScheduleModal(true);
                        }}
                        className="p-2 text-slate-500 hover:text-[#1e3a8a] dark:hover:text-white transition-colors cursor-pointer"
                        title="አስተካክል"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(sch._id)}
                        className="p-2 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="ሰርዝ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </FadeIn>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CLASS SESSIONS & CALENDAR                                          */}
      {/* ========================================================================= */}
      {activeTab === 'sessions' && (
        <FadeIn className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                የክፍለ-ጊዜዎች ዝርዝርና የቀን/ሰዓት ማስተካከያ
              </h3>
              <p className="text-xs text-slate-500">
                ማንኛውንም የተለየ ክፍለ-ጊዜ ወደ ሌላ ቀን ያዛውሩ፣ ይሰርዙ ወይም ማካካሻ ክፍለ-ጊዜ ይፍጠሩ
              </p>
            </div>

            <Button
              onClick={() => setShowMakeupModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>ተጨማሪ/ማካካሻ ክፍለ-ጊዜ ፍጠር</span>
            </Button>
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">ቀን፦</span>
              <input
                type="date"
                value={sessionStartDate}
                onChange={(e) => setSessionStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">ክፍል፦</span>
              <select
                value={sessionFilterGrade}
                onChange={(e) => setSessionFilterGrade(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                <option value="all">ሁሉም ክፍሎች</option>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">ሁኔታ፦</span>
              <select
                value={sessionFilterStatus}
                onChange={(e) => setSessionFilterStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
              >
                <option value="all">ሁሉም</option>
                <option value="scheduled">የተያዘ (Scheduled)</option>
                <option value="open">ክፍት (Open)</option>
                <option value="closed">የተዘጋ (Closed)</option>
                <option value="cancelled">የተሰረዘ (Cancelled)</option>
                <option value="rescheduled">የተዛወረ (Rescheduled)</option>
              </select>
            </div>

            <Button
              variant="outline"
              onClick={fetchSessions}
              className="ml-auto rounded-xl text-xs font-bold cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${sessionsLoading ? 'animate-spin' : ''}`} />
              <span>አድስ</span>
            </Button>
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            {sessionsLoading ? (
              <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#1e3a8a]" />
                <span>ክፍለ-ጊዜዎች እየተጫኑ ነው...</span>
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6">
                ለተመረጠው ቀን/ማጣሪያ ምንም ክፍለ-ጊዜ አልተገኘም።
              </div>
            ) : (
              sessions.map((sess) => {
                const isOpen = sess.status === 'open';
                const isClosed = sess.status === 'closed';
                const isCancelled = sess.status === 'cancelled';
                const isRescheduled = sess.status === 'rescheduled';

                return (
                  <div
                    key={sess._id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-[#1e3a8a] dark:text-blue-400">
                          {formatGradeAmharic(sess.grade)}
                        </span>
                        {sess.studentType === 'distance' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                            🌐 የርቀት
                          </span>
                        ) : sess.shift === 'night' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            🌙 የማታ ፈረቃ
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            ☀️ የቀን ፈረቃ
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isOpen
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isClosed
                              ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isRescheduled
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {sess.status}
                        </span>
                        {sess.isMakeUp && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            ማካካሻ ክፍለ-ጊዜ
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {sess.title || `${sess.grade} Session`}
                      </h4>

                      <p className="text-xs text-slate-500 flex items-center gap-2">
                        <span>📅 {sess.sessionDate}</span>
                        <span>•</span>
                        <span>🕒 {sess.startTime} – {sess.endTime}</span>
                        {sess.location && (
                          <>
                            <span>•</span>
                            <span>📍 {sess.location}</span>
                          </>
                        )}
                      </p>

                      {sess.notes && (
                        <p className="text-[11px] text-slate-400 italic">
                          ማስታወሻ፦ {sess.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
                      <Button
                        variant="outline"
                        onClick={() => handleViewSessionRoster(sess)}
                        className="rounded-xl text-xs font-bold cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 mr-1" />
                        <span>የተማሪዎች ዝርዝር</span>
                      </Button>

                      {!isClosed && !isCancelled && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRescheduleModalSession(sess);
                              setRescheduleDate(sess.sessionDate);
                              setRescheduleStartTime(sess.startTime);
                              setRescheduleReason('');
                            }}
                            className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <CalendarCheck className="w-3.5 h-3.5 text-purple-600" />
                            <span>ቀይር (Reschedule)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setCancelModalSession(sess);
                              setCancelReason('');
                            }}
                            className="px-3 py-2 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-800/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-all cursor-pointer flex items-center gap-1"
                          >
                            <CalendarX className="w-3.5 h-3.5" />
                            <span>ሰርዝ (Cancel)</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </FadeIn>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CLASS ROLL CALL                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'rollcall' && (
        <FadeIn className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">ክፍል፦</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 block mb-1">ቀን፦</label>
                <input
                  type="date"
                  value={rollCallDate}
                  onChange={(e) => setRollCallDate(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSaveRollCall}
                disabled={isSubmittingRoster || roster.length === 0}
                className="bg-[#1e3a8a] text-white rounded-xl text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
              >
                {isSubmittingRoster ? 'በማስቀመጥ ላይ...' : 'የተገኝነት መዝገብ አስቀምጥ'}
              </Button>
            </div>
          </div>

          {rosterMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs font-bold ${
                rosterMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}
            >
              {rosterMessage.text}
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">ተማሪ</th>
                    <th className="py-3 px-3">መለያ ቁጥር</th>
                    <th className="py-3 px-3">ሁኔታ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {rosterLoading ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        የክፍሉ ተማሪዎች እየተጫኑ ነው...
                      </td>
                    </tr>
                  ) : roster.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-8 text-center text-slate-400">
                        በዚህ ክፍል የተመዘገበ ተማሪ የለም
                      </td>
                    </tr>
                  ) : (
                    roster.map((s, idx) => (
                      <tr key={s._id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                          {[s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">{s.studentId || '-'}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {['Present', 'Late', 'Excused', 'Absent'].map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => setRosterStatuses((prev) => ({ ...prev, [s._id]: st }))}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  rosterStatuses[s._id] === st
                                    ? st === 'Present'
                                      ? 'bg-emerald-600 text-white'
                                      : st === 'Late'
                                      ? 'bg-amber-500 text-white'
                                      : st === 'Excused'
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-rose-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                              >
                                {st === 'Present'
                                  ? 'ተገኝቷል'
                                  : st === 'Late'
                                  ? 'ዘግይቷል'
                                  : st === 'Excused'
                                  ? 'ፈቃድ'
                                  : 'አልተገኘም'}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: QUICK SINGLE CHECK-IN                                              */}
      {/* ========================================================================= */}
      {activeTab === 'single' && (
        <FadeIn className="max-w-2xl mx-auto">
          <Card className="p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              የነጠላ ተማሪ ፈጣን ተገኝነት መመዝገቢያ
            </h3>

            {singleFeedback && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  singleFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                {singleFeedback.text}
              </div>
            )}

            <form onSubmit={handleSingleCheckIn} className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  ተማሪ ፈልግ
                </label>
                <input
                  type="text"
                  placeholder="የተማሪ ስም ወይም መለያ ቁጥር ይጻፉ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />

                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                    {searchResults.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        onClick={() => {
                          setSelectedStudent(s);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                        className="w-full p-3 text-left hover:bg-blue-50 dark:hover:bg-slate-700 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-900 dark:text-white">
                          {[s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{s.studentId || '-'}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedStudent && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs flex items-center justify-between">
                  <span className="font-bold text-[#1e3a8a] dark:text-blue-300">
                    🎯 {[selectedStudent.firstName, selectedStudent.lastName].join(' ')} ({selectedStudent.grade})
                  </span>
                  <button type="button" onClick={() => setSelectedStudent(null)} className="text-slate-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ሁኔታ
                  </label>
                  <select
                    value={singleStatus}
                    onChange={(e) => setSingleStatus(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="Present">ተገኝቷል (Present)</option>
                    <option value="Late">ዘግይቷል (Late)</option>
                    <option value="Excused">ፈቃድ (Excused)</option>
                    <option value="Absent">አልተገኘም (Absent)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ቀን
                  </label>
                  <input
                    type="date"
                    value={singleDate}
                    onChange={(e) => setSingleDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={singleSubmitting || !selectedStudent}
                  className="bg-[#1e3a8a] text-white rounded-xl text-xs font-black shadow-md cursor-pointer disabled:opacity-50"
                >
                  {singleSubmitting ? 'በመመዝገብ ላይ...' : 'ተገኝነት መዝግብ'}
                </Button>
              </div>
            </form>
          </Card>
        </FadeIn>
      )}

      {/* 🌟 MODAL: ADD / EDIT RECURRING SCHEDULE */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {editingSchedule ? 'ሳምንታዊ መርሃ-ግብር አስተካክል' : 'አዲስ ሳምንታዊ መርሃ-ግብር መድብ'}
                </h3>
                <p className="text-xs text-slate-500">
                  የክፍል፣ የፈረቃ (የቀን/የማታ) እና የመዝጋቢዎችን ሳምንታዊ የጊዜ ሠሌዳ ያዘጋጁ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-3.5">
              {/* Row 1: Grade, Track, Shift */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ክፍል (Class)
                  </label>
                  <select
                    value={scheduleForm.grade}
                    onChange={(e) => {
                      const val = e.target.value;
                      const isDist = val.toLowerCase().includes('batch') || val.includes('ዙር');
                      setScheduleForm({
                        ...scheduleForm,
                        grade: val,
                        studentType: isDist ? 'distance' : scheduleForm.studentType,
                        shift: isDist ? '' : (scheduleForm.shift || 'weekend'),
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    የትምህርት ዘርፍ (Track)
                  </label>
                  <select
                    value={scheduleForm.studentType}
                    onChange={(e) => {
                      const sType = e.target.value;
                      setScheduleForm({
                        ...scheduleForm,
                        studentType: sType,
                        shift: sType === 'distance' ? '' : (scheduleForm.shift || 'weekend'),
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="regular">🏛️ መደበኛ (Regular)</option>
                    <option value="distance">🌐 የርቀት (Distance)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    የመማሪያ ፈረቃ (Shift)
                  </label>
                  <select
                    value={scheduleForm.shift}
                    disabled={scheduleForm.studentType === 'distance'}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, shift: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold disabled:opacity-50"
                  >
                    <option value="weekend">☀️ የቀን / ቅዳሜ-እሁድ (Weekend)</option>
                    <option value="night">🌙 የማታ ፈረቃ (Night)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Day of Week & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    የሳምንቱ ቀን
                  </label>
                  <select
                    value={scheduleForm.dayOfWeek}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.labelAm}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    መጀመሪያ ሰዓት
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ማብቂያ ሰዓት
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Row 3: Late Threshold & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    የመዘግየት ደቂቃ (Late Mins)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={scheduleForm.lateThresholdMinutes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, lateThresholdMinutes: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ቦታ / የመማሪያ ክፍል
                  </label>
                  <input
                    type="text"
                    placeholder="ለምሳሌ፡ አዳራሽ B ወይም ክፍል 102"
                    value={scheduleForm.location}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Row 4: Assigned Takers */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  የተፈቀደላቸው መዝጋቢዎች / መምህራን (Assigned Takers)
                </label>
                <select
                  multiple
                  value={scheduleForm.assignedTakers}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                    setScheduleForm({ ...scheduleForm, assignedTakers: selected });
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs h-24"
                >
                  {teachersList.map((t) => (
                    <option key={t._id || t.userId} value={t.userId || t._id}>
                      {t.fullName} ({t.phone || 'Teacher'})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400">Ctrl በመጫን ከአንድ በላይ መዝጋቢዎችን መምረጥ ይችላሉ</span>
              </div>

              {/* Row 5: Schedule Name / Label (Optional) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  የመርሃ-ግብር ስም / መለያ (አማራጭ)
                </label>
                <input
                  type="text"
                  placeholder="ለምሳሌ፡ 8ኛ ክፍል - የማታ ፈረቃ ሳምንታዊ መርሐ-ግብር"
                  value={scheduleForm.name}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowScheduleModal(false)}
                  className="rounded-xl text-xs font-bold cursor-pointer"
                >
                  ተመለስ
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1e3a8a] text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  {editingSchedule ? 'አስተካክልና አስቀምጥ' : 'መርሃ-ግብሩን መዝግብ'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 MODAL: RESCHEDULE SPECIFIC SESSION */}
      {rescheduleModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              ክፍለ-ጊዜ ወደ ሌላ ቀን/ሰዓት ቀይር (Reschedule)
            </h3>
            <p className="text-xs text-slate-500">
              ክፍል፦ {formatGradeAmharic(rescheduleModalSession.grade)} (የቀድሞ ቀን፦ {rescheduleModalSession.sessionDate})
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  አዲሱ ቀን
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  አዲሱ መጀመሪያ ሰዓት
                </label>
                <input
                  type="time"
                  value={rescheduleStartTime}
                  onChange={(e) => setRescheduleStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  የመቀየሪያ ምክንያት
                </label>
                <input
                  type="text"
                  placeholder="ለምሳሌ፡ የበዓል ቀን በመሆኑ..."
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRescheduleModalSession(null)}
                  className="rounded-xl text-xs font-bold cursor-pointer"
                >
                  ተመለስ
                </Button>
                <Button
                  onClick={handleExecuteReschedule}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  ቀይር
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MODAL: CANCEL SESSION */}
      {cancelModalSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-rose-600">
              ክፍለ-ጊዜውን ሰርዝ (Cancel Session)
            </h3>
            <p className="text-xs text-slate-500">
              ይህን ክፍለ-ጊዜ ሲሰርዙ ተማሪዎች "አልተገኙም" ተብለው አይቀጡም።
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  የመሰረዣ ምክንያት
                </label>
                <input
                  type="text"
                  placeholder="ለምሳሌ፡ የአዳራሽ ጥገና..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancelModalSession(null)}
                  className="rounded-xl text-xs font-bold cursor-pointer"
                >
                  ተመለስ
                </Button>
                <Button
                  onClick={handleExecuteCancel}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  ክፍለ-ጊዜውን ሰርዝ
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 MODAL: CREATE MAKE-UP SESSION */}
      {showMakeupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  ተጨማሪ / ማካካሻ ክፍለ-ጊዜ ፍጠር (Make-Up Session)
                </h3>
                <p className="text-xs text-slate-500">
                  ለተወሰነ ክፍልና ፈረቃ የተለየ ማካካሻ ክፍለ-ጊዜ ያዘጋጁ
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMakeupModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMakeup} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ክፍል
                  </label>
                  <select
                    value={makeupForm.grade}
                    onChange={(e) => {
                      const val = e.target.value;
                      const isDist = val.toLowerCase().includes('batch') || val.includes('ዙር');
                      setMakeupForm({
                        ...makeupForm,
                        grade: val,
                        studentType: isDist ? 'distance' : makeupForm.studentType,
                        shift: isDist ? '' : (makeupForm.shift || 'weekend'),
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    የትምህርት ዘርፍ
                  </label>
                  <select
                    value={makeupForm.studentType}
                    onChange={(e) => {
                      const sType = e.target.value;
                      setMakeupForm({
                        ...makeupForm,
                        studentType: sType,
                        shift: sType === 'distance' ? '' : (makeupForm.shift || 'weekend'),
                      });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="regular">🏛️ መደበኛ (Regular)</option>
                    <option value="distance">🌐 የርቀት (Distance)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    የመማሪያ ፈረቃ
                  </label>
                  <select
                    value={makeupForm.shift}
                    disabled={makeupForm.studentType === 'distance'}
                    onChange={(e) => setMakeupForm({ ...makeupForm, shift: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold disabled:opacity-50"
                  >
                    <option value="weekend">☀️ የቀን ፈረቃ (Weekend)</option>
                    <option value="night">🌙 የማታ ፈረቃ (Night)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ቀን
                  </label>
                  <input
                    type="date"
                    value={makeupForm.sessionDate}
                    onChange={(e) => setMakeupForm({ ...makeupForm, sessionDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    መጀመሪያ ሰዓት
                  </label>
                  <input
                    type="time"
                    value={makeupForm.startTime}
                    onChange={(e) => setMakeupForm({ ...makeupForm, startTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    ማብቂያ ሰዓት
                  </label>
                  <input
                    type="time"
                    value={makeupForm.endTime}
                    onChange={(e) => setMakeupForm({ ...makeupForm, endTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ቦታ / የመማሪያ ክፍል
                </label>
                <input
                  type="text"
                  placeholder="ለምሳሌ፡ አዳራሽ B"
                  value={makeupForm.location}
                  onChange={(e) => setMakeupForm({ ...makeupForm, location: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMakeupModal(false)}
                  className="rounded-xl text-xs font-bold cursor-pointer"
                >
                  ተመለስ
                </Button>
                <Button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  ማካካሻ ክፍለ-ጊዜ ፍጠር
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 MODAL: SESSION ROSTER VIEWER */}
      {selectedSessionForRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  የክፍለ-ጊዜው ተማሪዎች ዝርዝርና የተገኝነት ሁኔታ
                </h3>
                <p className="text-xs text-slate-500">
                  {formatGradeAmharic(selectedSessionForRoster.grade)} ({selectedSessionForRoster.sessionDate})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSessionForRoster(null)}
                className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {sessionRosterLoading ? (
                <div className="py-12 text-center text-xs text-slate-400">እየተጫነ ነው...</div>
              ) : sessionRoster.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">ተማሪዎች አልተገኙም</div>
              ) : (
                sessionRoster.map((s, idx) => (
                  <div
                    key={s.studentId}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 font-mono text-slate-400">{idx + 1}</span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{s.code ? `ID: ${s.code}` : ''}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        s.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : s.status === 'Late'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : s.status === 'Absent'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {s.status === 'Present'
                        ? 'ተገኝቷል'
                        : s.status === 'Late'
                        ? 'ዘግይቷል'
                        : s.status === 'Absent'
                        ? 'አልተገኘም'
                        : 'ገና አልተቃኘም'}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <Button
                onClick={() => setSelectedSessionForRoster(null)}
                className="bg-[#1e3a8a] text-white rounded-xl text-xs font-bold"
              >
                ዝጋ
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;