'use client';

// src/features/admin/QRScanner.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Play,
  Square,
  Clock,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Upload,
  Camera,
  RefreshCw,
  Sparkles,
  Users,
  Check,
  X,
  ShieldCheck,
  ChevronDown,
  Info,
  Layers,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  Building,
  GraduationCap,
  FlipHorizontal,
  Zap,
  Download,
  Trash2,
  Lock,
  Calendar,
  Languages,
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatGradeAmharic } from '../../constants/registrationOptions';
import { toast } from '../../utils/toast';
import { useLanguage } from '../../hooks/useLanguage';

// ------------------------------------------------------------------
// Audio & Haptic feedback generator (Zero browser alerts!)
// ------------------------------------------------------------------
const playFeedback = (type = 'success', soundEnabled = true) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    if (type === 'success') {
      navigator.vibrate(80);
    } else if (type === 'warning') {
      navigator.vibrate([60, 40, 60]);
    } else {
      navigator.vibrate([120, 60, 120]);
    }
  }

  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'warning') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {}
};

const QRScanner = () => {
  // Language Support (Sync with app or local toggle)
  const langCtx = useLanguage();
  const [lang, setLang] = useState(langCtx?.isAmharic === false ? 'en' : 'am');
  const isAm = lang === 'am';

  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'file'
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'

  // 🛡️ Mandatory Session Configuration (Clean defaults)
  const [studentTypeFilter, setStudentTypeFilter] = useState('regular'); // 'regular' | 'distance'
  const [gradeFilter, setGradeFilter] = useState(''); // 'Grade 7' ... 'Grade 12' | 'Batch 1' ... 'Batch 4'
  const [shiftFilter, setShiftFilter] = useState('weekend'); // 'weekend' | 'night'

  // Course selection (Optional - defaults to General Attendance)
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Late detection settings
  const [useLateDetection, setUseLateDetection] = useState(false);
  const [classStartTime, setClassStartTime] = useState('08:30');
  const [graceMinutes, setGraceMinutes] = useState(15);

  // Manual student search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Live session scanned list & stats
  const [recentScans, setRecentScans] = useState([]);
  const [lastScannedStudent, setLastScannedStudent] = useState(null);

  // Custom UI Modals (Zero Browser Alert/Confirm!)
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);

  // Cooldown refs
  const html5QrCodeRef = useRef(null);
  const lastScannedRef = useRef('');
  const lastScanTimeRef = useRef(0);
  const fileInputRef = useRef(null);

  // 🛡️ Check if session configuration is complete
  const isSessionConfigured = useMemo(() => {
    if (!studentTypeFilter) return false;
    if (!gradeFilter) return false;
    if (studentTypeFilter === 'regular' && !shiftFilter) return false;
    return true;
  }, [studentTypeFilter, gradeFilter, shiftFilter]);

  // Clean Grade Options (No messy double text)
  const availableGradeOptions = useMemo(() => {
    if (studentTypeFilter === 'distance') {
      return [
        { value: 'Batch 1', labelAm: 'ዙር 1', labelEn: 'Batch 1' },
        { value: 'Batch 2', labelAm: 'ዙር 2', labelEn: 'Batch 2' },
        { value: 'Batch 3', labelAm: 'ዙር 3', labelEn: 'Batch 3' },
        { value: 'Batch 4', labelAm: 'ዙር 4', labelEn: 'Batch 4' },
      ];
    }
    return [
      { value: 'Grade 7', labelAm: '7ኛ ክፍል', labelEn: 'Grade 7' },
      { value: 'Grade 8', labelAm: '8ኛ ክፍል', labelEn: 'Grade 8' },
      { value: 'Grade 9', labelAm: '9ኛ ክፍል', labelEn: 'Grade 9' },
      { value: 'Grade 10', labelAm: '10ኛ ክፍል', labelEn: 'Grade 10' },
      { value: 'Grade 11', labelAm: '11ኛ ክፍል', labelEn: 'Grade 11' },
      { value: 'Grade 12', labelAm: '12ኛ ክፍል', labelEn: 'Grade 12' },
    ];
  }, [studentTypeFilter]);

  // Clean Grade Display helper
  const getGradeTitle = (gradeVal) => {
    if (!gradeVal) return '';
    const item = availableGradeOptions.find((o) => o.value === gradeVal);
    if (item) return isAm ? item.labelAm : item.labelEn;
    return formatGradeAmharic(gradeVal);
  };

  // Filtered courses based on mode and grade
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (studentTypeFilter && c.studentType && c.studentType !== studentTypeFilter) return false;
      if (gradeFilter && c.grade) {
        const norm = (str) => {
          const m = str.match(/\d+/);
          if (m) return str.toLowerCase().includes('batch') || str.includes('ዙር') ? `batch_${m[0]}` : `grade_${m[0]}`;
          return str.toLowerCase().replace(/\s+/g, '');
        };
        if (norm(c.grade) !== norm(gradeFilter)) return false;
      }
      return true;
    });
  }, [courses, studentTypeFilter, gradeFilter]);

  // Auto-reset selectedCourseId if no longer in filtered courses
  useEffect(() => {
    if (selectedCourseId && filteredCourses.length > 0) {
      const exists = filteredCourses.some((c) => c._id === selectedCourseId);
      if (!exists) setSelectedCourseId('');
    }
  }, [filteredCourses, selectedCourseId]);

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/api/admin/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : data.courses || []);
        } else {
          const fallbackRes = await apiFetch('/api/education/courses');
          if (fallbackRes.ok) {
            const data = await fallbackRes.json();
            setCourses(Array.isArray(data) ? data : data.courses || []);
          }
        }
      } catch (err) {
        console.warn('Courses fetch error:', err);
      }
    };
    fetchCourses();
  }, []);

  // Handlers for session filters (Stops camera if changing while active)
  const handleStudentTypeChange = (val) => {
    if (isScanning) stopCamera();
    setStudentTypeFilter(val);
    if (val === 'distance') {
      setShiftFilter('');
      if (!gradeFilter.toLowerCase().includes('batch')) setGradeFilter('');
    } else {
      setShiftFilter('weekend');
      if (gradeFilter.toLowerCase().includes('batch')) setGradeFilter('');
    }
  };

  const handleGradeChange = (val) => {
    if (isScanning) stopCamera();
    setGradeFilter(val);
    setSelectedCourseId('');
  };

  const handleShiftChange = (val) => {
    if (isScanning) stopCamera();
    setShiftFilter(val);
  };

  // Manual search debounced
  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          search: searchTerm.trim(),
          limit: '8',
        });
        if (studentTypeFilter) params.append('studentType', studentTypeFilter);
        if (studentTypeFilter === 'regular' && shiftFilter) params.append('shift', shiftFilter);
        if (gradeFilter) params.append('grade', gradeFilter);

        const res = await apiFetch(`/api/admin/students?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.students || []);
        }
      } catch (err) {
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, studentTypeFilter, shiftFilter, gradeFilter]);

  // Determine status based on late detection rules
  const determineStatus = () => {
    if (!useLateDetection || !classStartTime) return 'Present';
    const now = new Date();
    const [h, m] = classStartTime.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const graceEnd = new Date(start.getTime() + graceMinutes * 60000);
    return now > graceEnd ? 'Late' : 'Present';
  };

  // Process scanned or manual payload
  const processAttendanceRecord = async (payload, isManual = false) => {
    if (!isSessionConfigured) {
      toast.error(isAm ? 'እባክዎ መጀመሪያ ክፍል እና ፈረቃ ይምረጡ!' : 'Please select Class and Shift first!');
      return;
    }

    const endpoint = isManual ? '/api/admin/attendance/manual' : '/api/admin/attendance/scan';
    const status = determineStatus();

    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          courseId: selectedCourseId || undefined,
          studentType: studentTypeFilter,
          shift: studentTypeFilter === 'regular' ? shiftFilter : undefined,
          grade: gradeFilter,
          status,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const studentFullName =
          data.student?.name ||
          [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(' ') ||
          (isAm ? 'ተማሪ' : 'Student');

        const studentInfo = {
          id: data.student?.id || data.student?._id || payload.studentId || 'ID',
          name: studentFullName,
          grade: data.student?.grade || payload.grade || gradeFilter,
          studentId: data.student?.studentId || payload.studentId || '',
          studentType: data.student?.studentType || payload.studentType || studentTypeFilter,
          shift: data.student?.shift || payload.shift || shiftFilter,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: data.alreadyRecorded ? 'Already Checked' : status,
          alreadyRecorded: !!data.alreadyRecorded,
          message: data.message || (isAm ? 'መገኘት ተመዝግቧል' : 'Recorded successfully'),
          isMismatch: false,
        };

        setLastScannedStudent(studentInfo);

        if (data.alreadyRecorded) {
          playFeedback('warning', soundEnabled);
          toast.info(`${studentFullName} — ${isAm ? 'ቀደም ሲል ተመዝግቧል' : 'Already checked in today'}`);
        } else {
          playFeedback('success', soundEnabled);
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.7 },
              colors: ['#0f4c9c', '#f59e0b', '#10b981', '#ffcc00'],
            });
          } catch (e) {}

          toast.success(
            `${studentFullName} — ${
              status === 'Late'
                ? isAm ? '🕒 አርፍዶ ተመዝግቧል' : '🕒 Marked Late'
                : isAm ? '✅ ተገኝቷል' : '✅ Marked Present'
            }`
          );
        }

        // Deduplicate recent scans
        setRecentScans((prev) => {
          const exists = prev.some(
            (s) => (s.studentId && s.studentId === studentInfo.studentId) || (s.id && s.id === studentInfo.id) || s.name === studentInfo.name
          );
          if (exists) return prev;
          return [studentInfo, ...prev.slice(0, 49)];
        });
      } else {
        // Mismatch or Not Assigned Warning
        playFeedback('warning', soundEnabled);
        toast.error(data.message || (isAm ? 'ይህ ተማሪ ለተመረጠው ክፍለ-ጊዜ አልተመደበም' : 'Student does not match active session'));

        if (data.student) {
          setLastScannedStudent({
            id: data.student?.id || 'ID',
            name: data.student?.name || (isAm ? 'ያልተመደበ ተማሪ' : 'Unassigned Student'),
            grade: data.student?.grade || '',
            studentType: data.student?.studentType || 'regular',
            shift: data.student?.shift || '',
            studentId: data.student?.studentId || '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: 'Mismatch',
            isMismatch: true,
            message: data.message || (isAm ? 'የክፍል ወይም የፈረቃ አለመዛመድ' : 'Class or Shift mismatch'),
          });
        }
      }
    } catch (err) {
      playFeedback('error', soundEnabled);
      toast.error(isAm ? 'የሰርቨር ግንኙነት ችግር አጋጥሟል' : 'Server connection error');
    }
  };

  // QR Scan Callback
  const handleScan = useCallback(
    async (decodedText) => {
      const now = Date.now();
      if (decodedText === lastScannedRef.current && now - lastScanTimeRef.current < 4000) {
        return;
      }
      lastScannedRef.current = decodedText;
      lastScanTimeRef.current = now;

      await processAttendanceRecord({ qrCode: decodedText }, false);
    },
    [selectedCourseId, studentTypeFilter, shiftFilter, gradeFilter, useLateDetection, classStartTime, graceMinutes, soundEnabled, isSessionConfigured]
  );

  // Start Camera Scanner
  const startCamera = async (overrideFacing) => {
    if (!isSessionConfigured) {
      toast.error(isAm ? 'እባክዎ መጀመሪያ ክፍል እና ፈረቃ ይምረጡ!' : 'Please select Class and Shift first!');
      return;
    }

    setCameraError('');
    setIsScanning(true);
    const useFacing = overrideFacing || facingMode;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-viewport');
      } else if (html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      await html5QrCodeRef.current.start(
        { facingMode: useFacing },
        {
          fps: 20,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {}
      );
    } catch (err) {
      console.error('Camera start error:', err);
      setIsScanning(false);
      setCameraError(
        err?.message?.includes('Permission') || err?.name === 'NotAllowedError'
          ? isAm ? 'የካሜራ ፈቃድ አልተሰጠም። እባክዎ በብሮውዘርዎ ውስጥ ፈቃድ ይስጡ።' : 'Camera permission was denied.'
          : isAm ? 'ካሜራውን መክፈት አልተቻለም። ሌላ መተግበሪያ እየተጠቀመው አለመሆኑን ያረጋግጡ።' : 'Could not access camera.'
      );
    }
  };

  // Switch Front / Back Camera
  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isScanning) {
      await startCamera(nextFacing);
    }
  };

  // Stop Camera Scanner
  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        await html5QrCodeRef.current.clear();
      }
    } catch (err) {
    } finally {
      setIsScanning(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {}).then(() => {
          html5QrCodeRef.current?.clear().catch(() => {});
        });
      }
    };
  }, []);

  // Scan from Uploaded File
  const handleFileUpload = async (e) => {
    if (!isSessionConfigured) {
      toast.error(isAm ? 'እባክዎ መጀመሪያ ክፍል ይምረጡ!' : 'Please select class first!');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-viewport');
      }
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      if (decodedText) {
        await handleScan(decodedText);
      }
    } catch (err) {
      playFeedback('error', soundEnabled);
      toast.error(isAm ? 'በዚህ ምስል ላይ ትክክለኛ የQR ኮድ አልተገኘም' : 'No valid QR code found in this image');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Manual Check-in selection
  const handleManualMark = async (student) => {
    if (!isSessionConfigured) {
      toast.error(isAm ? 'እባክዎ መጀመሪያ ክፍል ይምረጡ!' : 'Please select class first!');
      return;
    }

    await processAttendanceRecord(
      {
        studentId: student._id,
        firstName: student.firstName,
        middleName: student.middleName,
        lastName: student.lastName,
        grade: student.grade || student.batch || '',
        studentType: student.studentType || 'regular',
        shift: student.shift || '',
      },
      true
    );
    setSearchTerm('');
    setSearchOpen(false);
  };

  // Finalize attendance session
  const handleExecuteFinalizeSession = async () => {
    setIsFinalizing(true);
    try {
      const res = await apiFetch('/api/admin/attendance/mark-unscanned-absent', {
        method: 'POST',
        body: JSON.stringify({
          grade: gradeFilter,
          studentType: studentTypeFilter,
          shift: studentTypeFilter === 'regular' ? shiftFilter : undefined,
          courseId: selectedCourseId || undefined,
          defaultStatus: 'Absent',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowFinalizeModal(false);
        toast.success(
          data.message ||
            (isAm
              ? `ለ${getGradeTitle(gradeFilter)} ያልተገኙ ተማሪዎች (${data.markedAbsentCount || 0}) 'አልተገኘም' ተብለው ተመዝግበዋል!`
              : `Unscanned students in ${getGradeTitle(gradeFilter)} (${data.markedAbsentCount || 0}) marked as Absent!`)
        );
        playFeedback('success', soundEnabled);
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
      } else {
        toast.error(data.message || (isAm ? 'ክፍለ-ጊዜ ማጠናቀቅ አልተቻለም' : 'Could not finalize session'));
        playFeedback('error', soundEnabled);
      }
    } catch (err) {
      toast.error(isAm ? 'የኔትወርክ ስህተት ተፈጥሯል' : 'Network error occurred');
    } finally {
      setIsFinalizing(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (recentScans.length === 0) {
      toast.info(isAm ? 'ምንም የተመዘገበ ተማሪ የለም' : 'No recorded students in this session');
      return;
    }
    const headers = [
      isAm ? 'ስም' : 'Full Name',
      isAm ? 'መለያ ቁጥር' : 'Student ID',
      isAm ? 'ክፍል' : 'Class',
      isAm ? 'ምዝገባ' : 'Track',
      isAm ? 'ፈረቃ' : 'Shift',
      isAm ? 'ሰዓት' : 'Time',
      isAm ? 'ሁኔታ' : 'Status',
    ];
    const rows = recentScans.map((s) => [
      s.name,
      s.studentId || '-',
      getGradeTitle(s.grade),
      s.studentType === 'distance' ? (isAm ? 'ርቀት' : 'Distance') : isAm ? 'መደበኛ' : 'Regular',
      s.shift === 'night' ? (isAm ? 'ማታ' : 'Night') : isAm ? 'ቀን' : 'Day',
      s.timestamp,
      s.status === 'Present' ? (isAm ? 'ተገኝቷል' : 'Present') : s.status === 'Late' ? (isAm ? 'አርፍዷል' : 'Late') : s.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${gradeFilter || 'session'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presentCount = recentScans.filter((s) => s.status === 'Present').length;
  const lateCount = recentScans.filter((s) => s.status === 'Late').length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12 font-sans">
      {/* Viewport styling for clean camera feed */}
      <style>{`
        #qr-reader-viewport {
          width: 100% !important;
          max-width: 320px !important;
          border: none !important;
          border-radius: 1.25rem !important;
          overflow: hidden !important;
          background: #0b132b !important;
        }
        #qr-reader-viewport video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          border-radius: 1.25rem !important;
        }
        #qr-reader-viewport img[alt="Info icon"],
        #qr-reader-viewport > div:nth-child(1) {
          border: none !important;
        }
        #qr-reader-viewport #qr-shaded-region {
          border-color: rgba(15, 76, 156, 0.5) !important;
          border-radius: 1.25rem !important;
        }
      `}</style>

      {/* 🌟 1. Header with Language Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0f4c9c] text-white flex items-center justify-center shadow-md shadow-blue-900/20 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              {isAm ? 'የቀጥታ QR የመገኘት መመዝገቢያ' : 'Live QR Attendance Scanner'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAm
                ? 'የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት • ፈጣን የዲጂታል መገኘት መቆጣጠሪያ'
                : 'Teklesawiros Sunday School • Fast Digital Attendance Station'}
            </p>
          </div>
        </div>

        {/* Top Controls: Language Switcher & Sound Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Language Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setLang('am')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isAm ? 'bg-[#0f4c9c] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              አማርኛ
            </button>
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isAm ? 'bg-[#0f4c9c] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? (isAm ? 'ድምፅ አጥፋ' : 'Mute') : isAm ? 'ድምፅ አብራ' : 'Unmute'}
            className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* 🌟 2. SIMPLE, SLEEK SESSION CONFIGURATION BAR (Clean & Uncluttered) */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Track / Sector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#0f4c9c] dark:text-amber-400" />
              <span>{isAm ? '1. የምዝገባ ዘርፍ' : '1. Registration Track'}</span>
            </label>
            <select
              value={studentTypeFilter}
              onChange={(e) => handleStudentTypeChange(e.target.value)}
              className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0f4c9c] transition-all cursor-pointer"
            >
              <option value="regular">{isAm ? '🏛️ መደበኛ' : '🏛️ Regular'}</option>
              <option value="distance">{isAm ? '🌐 የርቀት' : '🌐 Distance'}</option>
            </select>
          </div>

          {/* 2. Class / Grade */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#0f4c9c] dark:text-amber-400" />
                <span>{isAm ? '2. ክፍል / ባች' : '2. Class / Grade'}</span>
              </span>
              {!gradeFilter && <span className="text-[10px] text-amber-600 font-bold">{isAm ? '*ይምረጡ' : '*Select'}</span>}
            </label>
            <select
              value={gradeFilter}
              onChange={(e) => handleGradeChange(e.target.value)}
              className={`w-full p-2.5 text-xs font-bold rounded-xl outline-none transition-all cursor-pointer ${
                !gradeFilter
                  ? 'bg-amber-50/70 dark:bg-amber-950/30 border-2 border-amber-400/80 text-slate-800 dark:text-amber-200'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-[#0f4c9c]'
              }`}
            >
              <option value="">{isAm ? '-- ክፍል ይምረጡ --' : '-- Select Class --'}</option>
              {availableGradeOptions.map((g) => (
                <option key={g.value} value={g.value}>
                  {isAm ? g.labelAm : g.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Study Shift */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              {shiftFilter === 'night' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{isAm ? '3. የመማሪያ ፈረቃ' : '3. Study Shift'}</span>
            </label>
            <select
              value={shiftFilter}
              onChange={(e) => handleShiftChange(e.target.value)}
              disabled={studentTypeFilter === 'distance'}
              className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-[#0f4c9c] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="weekend">{isAm ? '☀️ የቀን ፈረቃ' : '☀️ Day Shift'}</option>
              <option value="night">{isAm ? '🌙 የማታ ፈረቃ' : '🌙 Night Shift'}</option>
            </select>
          </div>

          {/* 4. Course Name (Optional) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#0f4c9c] dark:text-amber-400" />
                <span>{isAm ? '4. የትምህርት ዓይነት' : '4. Course'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">{isAm ? '(አማራጭ)' : '(Optional)'}</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#0f4c9c] transition-all cursor-pointer"
            >
              <option value="">{isAm ? '🏛️ አጠቃላይ መገኘት' : '🏛️ General Attendance'}</option>
              {filteredCourses.map((c) => (
                <option key={c._id} value={c._id}>
                  📖 {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clean status pill and late toggle */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">{isAm ? 'የተመረጠው፦' : 'Active:'}</span>
            {isSessionConfigured ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-black text-xs">
                <span>🎯 {getGradeTitle(gradeFilter)}</span>
                <span>•</span>
                <span>{studentTypeFilter === 'distance' ? (isAm ? 'የርቀት' : 'Distance') : isAm ? 'መደበኛ' : 'Regular'}</span>
                <span>•</span>
                <span>{studentTypeFilter === 'distance' ? '' : shiftFilter === 'night' ? (isAm ? '🌙 ማታ' : '🌙 Night') : isAm ? '☀️ ቀን' : '☀️ Day'}</span>
                {selectedCourseId && <span>• 📖 {courses.find((c) => c._id === selectedCourseId)?.name}</span>}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold text-xs">
                ⚠️ {isAm ? 'እባክዎ ክፍል ይምረጡ' : 'Please select class'}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setUseLateDetection(!useLateDetection)}
            className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              useLateDetection
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{useLateDetection ? (isAm ? '🕒 ማርፈጃ ነቅቷል' : '🕒 Late Tracking On') : isAm ? '⚪ ማርፈጃ ጠፍቷል' : '⚪ Late Tracking Off'}</span>
          </button>
        </div>

        {/* Expandable Late Settings */}
        {useLateDetection && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-600 dark:text-slate-400 mb-1 block font-medium">
                {isAm ? 'የትምህርት መጀመሪያ ሰዓት' : 'Class Start Time'}
              </label>
              <input
                type="time"
                value={classStartTime}
                onChange={(e) => setClassStartTime(e.target.value)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>
            <div>
              <label className="text-slate-600 dark:text-slate-400 mb-1 block font-medium">
                {isAm ? 'የማስተናገጃ ደቂቃ' : 'Grace Period (Minutes)'}
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(Number(e.target.value))}
                className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>
        )}
      </div>

      {/* 🌟 3. MAIN SCANNING & DASHBOARD STATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Camera Scanner */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm relative">
            {/* Viewport Top Bar */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isScanning
                    ? `${getGradeTitle(gradeFilter)} ${isAm ? 'በመቃኘት ላይ...' : 'Scanning...'}`
                    : isSessionConfigured
                    ? `${getGradeTitle(gradeFilter)} ${isAm ? 'ለመቃኘት ዝግጁ' : 'Ready'}`
                    : isAm ? 'ክፍል ይምረጡ' : 'Select Class'}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {isScanning && (
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer flex items-center gap-1 text-xs font-semibold"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                    <span>{isAm ? 'ቀይር' : 'Flip'}</span>
                  </button>
                )}

                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl">
                  <button
                    onClick={() => setActiveTab('camera')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      activeTab === 'camera' ? 'bg-[#0f4c9c] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Camera className="w-3 h-3" />
                    <span>{isAm ? 'ካሜራ' : 'Camera'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (isScanning) stopCamera();
                      setActiveTab('file');
                    }}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                      activeTab === 'file' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Upload className="w-3 h-3" />
                    <span>{isAm ? 'ምስል' : 'Image'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Viewport Canvas Stage */}
            <div className="relative min-h-[360px] bg-gradient-to-b from-blue-50/30 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center p-5 overflow-hidden">
              {/* html5-qrcode target */}
              <div
                id="qr-reader-viewport"
                className={`w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden ${
                  isScanning && activeTab === 'camera' ? 'block shadow-2xl ring-4 ring-[#0f4c9c]/30' : 'hidden'
                }`}
              />

              {/* Laser Reticle when active */}
              {isScanning && activeTab === 'camera' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
                  <div className="w-[240px] h-[240px] relative border border-white/25 rounded-2xl">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-xl shadow-[0_0_12px_#f59e0b]" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl shadow-[0_0_12px_#f59e0b]" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl shadow-[0_0_12px_#f59e0b]" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-xl shadow-[0_0_12px_#f59e0b]" />

                    <motion.div
                      animate={{ y: [0, 220, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b]"
                    />
                  </div>
                </div>
              )}

              {/* INACTIVE CAMERA STATE */}
              {!isScanning && activeTab === 'camera' && (
                <div className="text-center space-y-4 max-w-sm px-3 z-10 py-4">
                  <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                      isSessionConfigured
                        ? 'bg-gradient-to-br from-[#0f4c9c] to-[#1e3a8a] text-white border-2 border-amber-400/40'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {isSessionConfigured ? <QrCode className="w-8 h-8 text-amber-300" /> : <Lock className="w-7 h-7 text-slate-400" />}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {isSessionConfigured
                        ? `${getGradeTitle(gradeFilter)} ${isAm ? 'ለመቃኘት ዝግጁ ነው' : 'Ready to Scan'}`
                        : isAm ? 'እባክዎ መጀመሪያ ክፍል ይምረጡ' : 'Select Class & Shift to Enable'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isSessionConfigured
                        ? isAm
                          ? 'የተማሪውን QR ኮድ ወደ ካሜራው በማቅረብ ወዲያውኑ መገኘትን ይመዝግቡ።'
                          : 'Present student QR badge to camera for instant check-in.'
                        : isAm
                        ? 'ሌሎች ክፍሎች በስህተት እንዳይመዘገቡ መጀመሪያ ከላይ ክፍል ይምረጡ።'
                        : 'Select a specific class above to protect other classes.'}
                    </p>
                  </div>

                  {cameraError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-left">
                      ⚠️ {cameraError}
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    disabled={!isSessionConfigured}
                    onClick={() => startCamera()}
                    className={`w-full py-3.5 rounded-xl font-black text-xs sm:text-sm gap-2 transition-all ${
                      isSessionConfigured
                        ? 'bg-[#0f4c9c] hover:bg-[#0d3f82] text-white shadow-md shadow-blue-900/20 cursor-pointer'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isSessionConfigured ? (
                      <>
                        <Play className="w-4 h-4 fill-current text-amber-300" />
                        <span>{isAm ? `ለ${getGradeTitle(gradeFilter)} ካሜራ ክፈት` : `Start Camera (${getGradeTitle(gradeFilter)})`}</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>{isAm ? '🔒 ክፍል ይምረጡና ካሜራ ይክፈቱ' : '🔒 Select Class to Start Camera'}</span>
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Upload Image Tab */}
              {activeTab === 'file' && (
                <div className="text-center space-y-4 max-w-sm px-3 z-10 py-6">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {isAm ? 'የQR ኮድ ምስል ይጫኑ' : 'Upload QR Image'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isAm ? 'የተማሪውን QR ስክሪንሾት ወይም ፎቶ ይምረጡ' : 'Select screenshot or photo of student QR'}
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={!isSessionConfigured}
                    className="hidden"
                    id="qr-file-upload-input"
                  />

                  <label
                    htmlFor={isSessionConfigured ? 'qr-file-upload-input' : undefined}
                    className={`inline-flex w-full items-center justify-center gap-2 px-5 py-3 rounded-xl font-black text-xs transition-all ${
                      isSessionConfigured
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer shadow-md shadow-amber-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isSessionConfigured ? (isAm ? 'ምስል ምረጥ' : 'Choose Image') : isAm ? '🔒 መጀመሪያ ክፍል ይምረጡ' : '🔒 Select Class First'}</span>
                  </label>
                </div>
              )}
            </div>

            {/* Bottom active bar */}
            {isScanning && activeTab === 'camera' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold truncate">
                  🎯 {getGradeTitle(gradeFilter)} ({studentTypeFilter === 'distance' ? (isAm ? 'ርቀት' : 'Dist') : shiftFilter === 'night' ? (isAm ? 'ማታ' : 'Night') : isAm ? 'ቀን' : 'Day'})
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={stopCamera}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1 rounded-lg text-xs cursor-pointer py-1.5"
                >
                  <Square className="w-3 h-3 fill-current" />
                  <span>{isAm ? 'አቁም' : 'Stop'}</span>
                </Button>
              </div>
            )}
          </div>

          {/* Manual Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder={
                isAm
                  ? `${getGradeTitle(gradeFilter) || 'የተማሪ'} ስም፣ ስልክ ወይም መለያ ቁጥር ይፈልጉ...`
                  : `Search ${getGradeTitle(gradeFilter) || 'student'} name, phone or ID...`
              }
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full pl-9 pr-9 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#0f4c9c]"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Dropdown */}
            <AnimatePresence>
              {searchOpen && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
                >
                  {searchResults.map((s) => (
                    <div
                      key={s._id}
                      className="p-2.5 hover:bg-blue-50/70 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between text-xs"
                      onMouseDown={() => handleManualMark(s)}
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {[s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ')}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {s.studentId ? `ID: ${s.studentId}` : s.phone} • {getGradeTitle(s.grade)}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-[#0f4c9c] text-white text-[10px] font-bold">
                        {isAm ? 'መዝግብ' : 'Check in'}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column (5 cols): Live Stats & Scanned Results */}
        <div className="lg:col-span-5 space-y-3">
          {/* Latest Scanned Student Feedback Card */}
          {lastScannedStudent ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={lastScannedStudent.id + lastScannedStudent.timestamp}
              className={`p-4 rounded-2xl border shadow-sm ${
                lastScannedStudent.isMismatch
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                  : lastScannedStudent.alreadyRecorded
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                  : lastScannedStudent.status === 'Late'
                  ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg text-white ${
                      lastScannedStudent.isMismatch
                        ? 'bg-rose-500'
                        : lastScannedStudent.alreadyRecorded
                        ? 'bg-amber-500'
                        : lastScannedStudent.status === 'Late'
                        ? 'bg-orange-500'
                        : 'bg-emerald-500'
                    }`}
                  >
                    {lastScannedStudent.isMismatch ? '⚠️' : lastScannedStudent.alreadyRecorded ? 'ℹ️' : lastScannedStudent.status === 'Late' ? '🕒' : '✅'}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                      {lastScannedStudent.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      {getGradeTitle(lastScannedStudent.grade)} • {lastScannedStudent.studentType === 'distance' ? (isAm ? 'ርቀት' : 'Dist') : lastScannedStudent.shift === 'night' ? (isAm ? 'ማታ' : 'Night') : isAm ? 'ቀን' : 'Day'}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={lastScannedStudent.isMismatch ? 'danger' : lastScannedStudent.alreadyRecorded ? 'gold' : lastScannedStudent.status === 'Late' ? 'neutral' : 'approved'}
                  size="sm"
                  className="font-bold shrink-0"
                >
                  {lastScannedStudent.isMismatch
                    ? isAm ? 'አልተመደበም' : 'Mismatch'
                    : lastScannedStudent.alreadyRecorded
                    ? isAm ? 'ቀደም ሲል' : 'Already In'
                    : lastScannedStudent.status === 'Late'
                    ? isAm ? 'አርፍዷል' : 'Late'
                    : isAm ? 'ተገኝቷል' : 'Present'}
                </Badge>
              </div>

              <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-[11px] font-medium text-slate-600 dark:text-slate-300">
                <span>{lastScannedStudent.message}</span>
                <span className="font-mono text-slate-400">{lastScannedStudent.timestamp}</span>
              </div>
            </motion.div>
          ) : (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1 shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-500 mx-auto opacity-70" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAm ? 'ምንም ስካን ገና አልተካሄደም' : 'No Scans in Current Session'}
              </h4>
              <p className="text-[10px] text-slate-400">
                {gradeFilter
                  ? `${getGradeTitle(gradeFilter)} ${isAm ? 'ተማሪዎች ስካን ሲያደርጉ እዚህ ይታያሉ።' : 'scans will appear here.'}`
                  : isAm ? 'ክፍል መርጠው ካሜራውን ሲያስጀምሩ እዚህ ይመዘገባሉ።' : 'Select class and start camera to begin.'}
              </p>
            </div>
          )}

          {/* 3 Stats Tiles */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{presentCount}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">{isAm ? 'ተገኝቷል' : 'Present'}</p>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
              <p className="text-lg font-black text-amber-600 dark:text-amber-400">{lateCount}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">{isAm ? 'አርፍዷል' : 'Late'}</p>
            </div>
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
              <p className="text-lg font-black text-[#0f4c9c] dark:text-blue-400">{recentScans.length}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">{isAm ? 'አጠቃላይ' : 'Total'}</p>
            </div>
          </div>

          {/* Clean Finalize Button */}
          <button
            type="button"
            onClick={() => {
              if (!isSessionConfigured) {
                toast.error(isAm ? 'እባክዎ መጀመሪያ ክፍል ይምረጡ!' : 'Please select class first!');
                return;
              }
              setShowFinalizeModal(true);
            }}
            disabled={!isSessionConfigured}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 ${
              isSessionConfigured
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer active:scale-98'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>
              {isSessionConfigured
                ? isAm
                  ? `⚡ የ${getGradeTitle(gradeFilter)} ክፍለ-ጊዜ አጠናቅቅ (ያልተገኙትን "አልተገኘም" አድርግ)`
                  : `⚡ Finalize ${getGradeTitle(gradeFilter)} (Mark Unscanned Absent)`
                : isAm ? 'ክፍለ-ጊዜ አጠናቅቅ (መጀመሪያ ክፍል ይምረጡ)' : 'Finalize Session (Select Class First)'}
            </span>
          </button>

          {/* Rolling Feed */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0f4c9c] dark:text-amber-400" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {isAm ? 'የቅርብ ጊዜ ምዝገባዎች' : 'Recent Check-ins'}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                {recentScans.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleExportCSV}
                      title={isAm ? 'በCSV አውርድ' : 'Export CSV'}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowClearConfirmModal(true)}
                      title={isAm ? 'ዝርዝሩን አጽዳ' : 'Clear List'}
                      className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </>
                )}
                <Badge variant="neutral" size="sm">{recentScans.length}</Badge>
              </div>
            </div>

            {recentScans.length === 0 ? (
              <div className="py-6 text-center text-[11px] text-slate-400 italic">
                {isAm ? 'ተማሪዎች ስካን ሲያደርጉ እዚህ ይመዘገባሉ።' : 'Scanned students will be listed here.'}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentScans.map((scan, idx) => (
                  <div key={idx} className="pt-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          scan.alreadyRecorded ? 'bg-amber-400' : scan.status === 'Late' ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span className="font-bold text-slate-900 dark:text-white truncate text-[11px]">{scan.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">{scan.timestamp}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          scan.alreadyRecorded
                            ? 'bg-amber-50 text-amber-700'
                            : scan.status === 'Late'
                            ? 'bg-orange-50 text-orange-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {scan.alreadyRecorded ? (isAm ? 'ቀደም ሲል' : 'In') : scan.status === 'Late' ? (isAm ? 'አርፍዷል' : 'Late') : isAm ? 'ተገኝቷል' : 'Present'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🌟 CUSTOM MODAL 1: Safe Finalize Session Confirmation (NO ALERT!) */}
      <AnimatePresence>
        {showFinalizeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 fill-current" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAm
                    ? `የ${getGradeTitle(gradeFilter)} ክፍለ-ጊዜ ማጠናቀቂያ`
                    : `Finalize Attendance for ${getGradeTitle(gradeFilter)}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {isAm
                    ? 'በዚህ ክፍል ውስጥ ስካን ያላደረጉ ተማሪዎች ብቻ "አልተገኘም" (Absent) ተደርገው ይመዘገባሉ።'
                    : 'Only students in this class who have not scanned will be marked as Absent.'}
                </p>
              </div>

              {/* Exact Target Breakdown */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 text-xs space-y-1 text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAm ? 'የታለመው ክፍል፦' : 'Target Class:'}</span>
                  <span className="font-bold text-[#0f4c9c] dark:text-amber-400">{getGradeTitle(gradeFilter)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">{isAm ? 'የምዝገባ ዘርፍ፦' : 'Track:'}</span>
                  <span className="font-bold">{studentTypeFilter === 'distance' ? (isAm ? 'የርቀት' : 'Distance') : isAm ? 'መደበኛ' : 'Regular'}</span>
                </div>
                {studentTypeFilter === 'regular' && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isAm ? 'የመማሪያ ፈረቃ፦' : 'Shift:'}</span>
                    <span className="font-bold">{shiftFilter === 'night' ? (isAm ? 'የማታ ፈረቃ' : 'Night Shift') : isAm ? 'የቀን ፈረቃ' : 'Day Shift'}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400">{isAm ? 'እስካሁን የተመዘገቡ፦' : 'Already Checked In:'}</span>
                  <span className="font-bold text-emerald-600">{recentScans.length} {isAm ? 'ተማሪዎች' : 'students'}</span>
                </div>
              </div>

              {/* Safety Guarantee */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>{isAm ? 'የደህንነት ጥበቃ፦' : 'Safety Guarantee:'}</strong>{' '}
                  {isAm
                    ? `ይህ እርምጃ ${getGradeTitle(gradeFilter)}ን ብቻ ይመለከታል። ዛሬ ትምህርት የሌላቸው ሌሎች ክፍሎች አይነኩም።`
                    : `This action strictly applies to ${getGradeTitle(gradeFilter)}. Other classes will not be affected.`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFinalizeModal(false)}
                  disabled={isFinalizing}
                  className="rounded-xl text-xs font-bold py-2.5"
                >
                  {isAm ? 'ተመለስ' : 'Cancel'}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleExecuteFinalizeSession}
                  disabled={isFinalizing}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs py-2.5 shadow-md shadow-amber-500/20"
                >
                  {isFinalizing ? (isAm ? 'በማጠናቀቅ ላይ...' : 'Finalizing...') : isAm ? `አዎ ለ${getGradeTitle(gradeFilter)} መዝግብ` : `Confirm for ${getGradeTitle(gradeFilter)}`}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌟 CUSTOM MODAL 2: Clear Session List Confirmation (NO ALERT!) */}
      <AnimatePresence>
        {showClearConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {isAm ? 'የዚህን ክፍለ-ጊዜ ዝርዝር ማጽዳት ይፈልጋሉ?' : 'Clear Session List?'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isAm
                    ? 'ይህ እርምጃ በስክሪኑ ላይ የሚታየውን ዝርዝር ብቻ ያጸዳል።'
                    : 'This only clears the on-screen list. Saved records are kept.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirmModal(false)}
                  className="rounded-xl text-xs font-bold py-2.5"
                >
                  {isAm ? 'ተመለስ' : 'Cancel'}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setRecentScans([]);
                    setLastScannedStudent(null);
                    setShowClearConfirmModal(false);
                    toast.info(isAm ? 'የክፍለ-ጊዜው ዝርዝር ጸድቷል' : 'Session list cleared');
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs py-2.5 shadow-md"
                >
                  {isAm ? 'አዎ አጽዳ' : 'Clear'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRScanner;