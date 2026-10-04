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
  UserCheck,
  UserX,
  XCircle,
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
  const langCtx = useLanguage();
  const [lang, setLang] = useState(langCtx?.isAmharic === false ? 'en' : 'am');
  const isAm = lang === 'am';

  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'file'
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'

  // =========================================================================
  // 🌟 SESSION-FIRST ARCHITECTURE: TODAY'S AUTHORIZED SESSIONS
  // =========================================================================
  const [todaySessions, setTodaySessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [sessionRoster, setSessionRoster] = useState([]);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [manualMode, setManualMode] = useState(false);

  // Manual session configuration (Fallback mode)
  const [studentTypeFilter, setStudentTypeFilter] = useState('regular');
  const [gradeFilter, setGradeFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('weekend');
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Manual student search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Live session scanned list & stats
  const [recentScans, setRecentScans] = useState([]);
  const [lastScannedStudent, setLastScannedStudent] = useState(null);

  // Cooldown refs
  const html5QrCodeRef = useRef(null);
  const lastScannedRef = useRef('');
  const lastScanTimeRef = useRef(0);
  const fileInputRef = useRef(null);
  const selectedSessionRef = useRef(selectedSession);
  const manualModeRef = useRef(manualMode);
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  useEffect(() => {
    manualModeRef.current = manualMode;
  }, [manualMode]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Load Today's Authorized Sessions
  const fetchTodaySessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await apiFetch('/api/education/attendance/sessions/today');
      if (res.ok) {
        const data = await res.json();
        const list = data.sessions || [];
        setTodaySessions(list);

        // Auto-select open session or first scheduled session
        if (list.length > 0) {
          const openSess = list.find((s) => s.status === 'open');
          const scheduledSess = list.find((s) => s.status === 'scheduled');
          const target = openSess || scheduledSess || list[0];
          setSelectedSessionId(target._id);
          setSelectedSession(target);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch today sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodaySessions();
  }, [fetchTodaySessions]);

  // Update selected session object when ID changes
  useEffect(() => {
    if (selectedSessionId && todaySessions.length > 0) {
      const found = todaySessions.find((s) => s._id === selectedSessionId);
      if (found) setSelectedSession(found);
    }
  }, [selectedSessionId, todaySessions]);

  // Load courses for fallback mode
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/api/education/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : data.courses || []);
        }
      } catch (err) {}
    };
    fetchCourses();
  }, []);

  // Format Ethiopian / English Grade title
  const getGradeTitle = (gradeVal) => {
    if (!gradeVal) return '';
    return formatGradeAmharic(gradeVal);
  };

  // Start Attendance Session
  const handleStartSession = async () => {
    if (!selectedSession) return;
    setIsStartingSession(true);
    try {
      const res = await apiFetch(`/api/education/attendance/sessions/${selectedSession._id}/start`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          isAm
            ? `የ${formatGradeAmharic(selectedSession.grade)} ተገኝነት ክፍለ-ጊዜ ተጀምሯል!`
            : `Attendance session for ${selectedSession.grade} is now OPEN!`
        );
        playFeedback('success', soundEnabled);
        await fetchTodaySessions();
        startCamera();
      } else {
        toast.error(data.message || (isAm ? 'ክፍለ-ጊዜውን መክፈት አልተቻለም' : 'Could not start session'));
        playFeedback('error', soundEnabled);
      }
    } catch (err) {
      toast.error(isAm ? 'የኔትወርክ ስህተት ተፈጥሯል' : 'Network error');
    } finally {
      setIsStartingSession(false);
    }
  };

  // Close Attendance Session (Auto-Marks Absent for remaining)
  const handleCloseSession = async () => {
    if (!selectedSession) return;
    setIsClosingSession(true);
    try {
      const res = await apiFetch(`/api/education/attendance/sessions/${selectedSession._id}/close`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowCloseModal(false);
        stopCamera();
        toast.success(
          data.message ||
            (isAm
              ? `ክፍለ-ጊዜው ተዘግቷል! ${data.summary?.markedAbsent || 0} ያልተገኙ ተማሪዎች 'አልተገኘም' ተብለዋል።`
              : `Session closed! ${data.summary?.markedAbsent || 0} unscanned students marked Absent.`)
        );
        playFeedback('success', soundEnabled);
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        await fetchTodaySessions();
      } else {
        toast.error(data.message || (isAm ? 'ክፍለ-ጊዜውን መዝጋት አልተቻለም' : 'Could not close session'));
        playFeedback('error', soundEnabled);
      }
    } catch (err) {
      toast.error(isAm ? 'የኔትወርክ ስህተት ተፈጥሯል' : 'Network error');
    } finally {
      setIsClosingSession(false);
    }
  };

  // Fetch Live Session Roster
  const handleOpenRoster = async () => {
    if (!selectedSession) return;
    setShowRosterModal(true);
    setRosterLoading(true);
    try {
      const res = await apiFetch(`/api/education/attendance/sessions/${selectedSession._id}/live-roster`);
      if (res.ok) {
        const data = await res.json();
        setSessionRoster(data.roster || []);
      }
    } catch (err) {
      toast.error(isAm ? 'ሮስተር መጫን አልተቻለም' : 'Could not load roster');
    } finally {
      setRosterLoading(false);
    }
  };

  // Process Attendance Record (Session Mode or Fallback)
  const processAttendanceRecord = async (payload, isManual = false) => {
    const currentSession = selectedSessionRef.current || selectedSession;
    const isManualMode = manualModeRef.current ?? manualMode;
    const isSound = soundEnabledRef.current ?? soundEnabled;

    // 1. Session-Driven Attendance (Primary)
    if (!isManualMode && currentSession) {
      if (currentSession.status === 'closed') {
        toast.error(
          isAm
            ? 'ይህ ክፍለ-ጊዜ ተዘግቷል። ተጨማሪ ተገኝነት መመዝገብ አይቻልም።'
            : 'This session is closed. No further attendance can be scanned.'
        );
        playFeedback('warning', isSound);
        return;
      }

      try {
        const res = await apiFetch(`/api/education/attendance/sessions/${currentSession._id}/scan`, {
          method: 'POST',
          body: JSON.stringify({
            qrCode: payload.qrCode || payload.studentId || payload._id,
          }),
        });

        const data = await res.json();

        if (data.success) {
          const studentInfo = {
            id: data.student?.id || data.student?._id || 'ID',
            name: data.student?.name || (isAm ? 'ተማሪ' : 'Student'),
            grade: data.student?.grade || data.student?.enrolledGrade || currentSession.grade,
            studentId: data.student?.studentId || '',
            photoUrl: data.student?.photoUrl || '',
            phone: data.student?.phone || '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: data.attendanceStatus || 'Present',
            alreadyRecorded: !!data.alreadyMarked,
            message: data.message,
            isMismatch: false,
          };

          setLastScannedStudent(studentInfo);

          if (data.alreadyMarked) {
            playFeedback('warning', isSound);
            toast.info(data.message || `${studentInfo.name} — ${isAm ? 'ቀደም ሲል ተመዝግቧል' : 'Already marked'}`);
          } else {
            playFeedback('success', isSound);
            try {
              confetti({
                particleCount: 40,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#0f4c9c', '#f59e0b', '#10b981', '#ffcc00'],
              });
            } catch (e) {}

            toast.success(
              `${studentInfo.name} — ${
                data.attendanceStatus === 'Late'
                  ? isAm ? '🕒 አርፍዶ ተመዝግቧል' : '🕒 Marked Late'
                  : isAm ? '✅ ተገኝቷል' : '✅ Marked Present'
              }`
            );

            // Update live stats locally and ensure status is open
            if (currentSession.stats) {
              const updatedStats = { ...currentSession.stats };
              if (data.attendanceStatus === 'Late') {
                updatedStats.lateCount = (updatedStats.lateCount || 0) + 1;
              } else {
                updatedStats.presentCount = (updatedStats.presentCount || 0) + 1;
              }
              const updatedSession = { ...currentSession, status: 'open', stats: updatedStats };
              setSelectedSession(updatedSession);
              selectedSessionRef.current = updatedSession;
            }
          }

          setRecentScans((prev) => {
            const exists = prev.some(
              (s) => (s.studentId && s.studentId === studentInfo.studentId) || (s.id && s.id === studentInfo.id)
            );
            if (exists) return prev;
            return [studentInfo, ...prev.slice(0, 49)];
          });
        } else {
          // Rejection / Class Mismatch / Not Found
          playFeedback('error', isSound);
          toast.error(data.message || (isAm ? 'ተገኝነት ውድቅ ተደርጓል' : 'Attendance rejected'));

          setLastScannedStudent({
            id: data.student?.id || 'ID',
            name: data.student?.name || (isAm ? 'ያልታወቀ ተማሪ' : 'Unmatched Student'),
            grade: data.student?.enrolledGrade || (isAm ? 'ሌላ ክፍል' : 'Other Grade'),
            sessionGrade: data.student?.sessionGrade || currentSession.grade,
            studentId: data.student?.studentId || '',
            photoUrl: data.student?.photoUrl || '',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            status: data.status === 'class_mismatch' ? 'Class Mismatch' : 'Rejected',
            isMismatch: true,
            message: data.message || (isAm ? 'ይህ ተማሪ ለዚህ ክፍል አልተመደበም' : 'Class enrollment mismatch'),
          });
        }
      } catch (err) {
        playFeedback('error', isSound);
        toast.error(isAm ? 'የሰርቨር ግንኙነት ችግር አጋጥሟል' : 'Server error');
      }
      return;
    }

    // 2. Legacy / Manual Fallback Scan
    const endpoint = isManual ? '/api/admin/attendance/manual' : '/api/admin/attendance/scan';
    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          courseId: selectedCourseId || undefined,
          studentType: studentTypeFilter,
          shift: studentTypeFilter === 'regular' ? shiftFilter : undefined,
          grade: gradeFilter,
          status: 'Present',
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
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: data.alreadyRecorded ? 'Already Checked' : 'Present',
          alreadyRecorded: !!data.alreadyRecorded,
          message: data.message,
          isMismatch: false,
        };

        setLastScannedStudent(studentInfo);
        playFeedback(data.alreadyRecorded ? 'warning' : 'success', soundEnabled);
        toast.success(`${studentFullName} — ${isAm ? 'ተገኝቷል' : 'Marked Present'}`);

        setRecentScans((prev) => [studentInfo, ...prev.slice(0, 49)]);
      } else {
        playFeedback('error', soundEnabled);
        toast.error(data.message || (isAm ? 'የክፍል አለመዛመድ' : 'Class mismatch'));
      }
    } catch (err) {
      playFeedback('error', soundEnabled);
      toast.error(isAm ? 'የሰርቨር ግንኙነት ችግር' : 'Server error');
    }
  };

  // QR Scan Callback with 3-second debouncing
  const handleScan = useCallback(
    async (decodedText) => {
      const now = Date.now();
      if (decodedText === lastScannedRef.current && now - lastScanTimeRef.current < 3000) {
        return;
      }
      lastScannedRef.current = decodedText;
      lastScanTimeRef.current = now;

      await processAttendanceRecord({ qrCode: decodedText }, false);
    },
    [selectedSession, manualMode, soundEnabled, studentTypeFilter, gradeFilter, shiftFilter, selectedCourseId]
  );

  const handleScanRef = useRef(handleScan);
  useEffect(() => {
    handleScanRef.current = handleScan;
  }, [handleScan]);

  // Start Camera Scanner with multi-tier device fallback
  const startCamera = async (overrideFacing) => {
    setCameraError('');
    setIsScanning(true);
    const useFacing = overrideFacing || facingMode;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-viewport');
      } else if (html5QrCodeRef.current.isScanning) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {}
      }

      // 1. Enumerate available camera devices
      let cameras = [];
      try {
        cameras = await Html5Qrcode.getCameras();
      } catch (camErr) {
        console.warn('Could not enumerate camera devices:', camErr);
      }

      let cameraConfig = { facingMode: useFacing };

      if (cameras && cameras.length > 0) {
        if (useFacing === 'environment') {
          // Look for back / environment camera if multiple exist
          const backCam = cameras.find((c) =>
            c.label?.toLowerCase().includes('back') ||
            c.label?.toLowerCase().includes('rear') ||
            c.label?.toLowerCase().includes('environment')
          );
          cameraConfig = backCam ? backCam.id : cameras[cameras.length - 1].id;
        } else {
          cameraConfig = cameras[0].id;
        }
      }

      // 2. Try starting camera with preferred configuration
      try {
        await html5QrCodeRef.current.start(
          cameraConfig,
          {
            fps: 20,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (handleScanRef.current) {
              handleScanRef.current(decodedText);
            }
          },
          () => {}
        );
      } catch (firstErr) {
        console.warn('First camera start attempt failed, attempting fallback:', firstErr);

        // Tier 2 Fallback: If specific ID or environment mode failed, try default camera
        if (cameras && cameras.length > 0 && cameraConfig !== cameras[0].id) {
          await html5QrCodeRef.current.start(
            cameras[0].id,
            {
              fps: 20,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              if (handleScanRef.current) {
                handleScanRef.current(decodedText);
              }
            },
            () => {}
          );
        } else {
          // Tier 3 Fallback: Try generic user facing mode
          await html5QrCodeRef.current.start(
            { facingMode: 'user' },
            {
              fps: 20,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
            },
            (decodedText) => {
              if (handleScanRef.current) {
                handleScanRef.current(decodedText);
              }
            },
            () => {}
          );
        }
      }
    } catch (err) {
      console.error('Camera start error:', err);
      setIsScanning(false);
      const isNotFound =
        err?.name === 'NotFoundError' ||
        err?.message?.includes('NotFoundError') ||
        err?.message?.includes('Requested device not found') ||
        err?.message?.includes('devices not found');
      const isDenied =
        err?.message?.includes('Permission') ||
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError';

      if (isNotFound) {
        setCameraError(
          isAm
            ? 'በዚህ መሳሪያ ላይ ካሜራ አልተገኘም። እባክዎ ዌብካም የተገጠመለት መሳሪያ ይጠቀሙ ወይም የQR ምስል ጫን (Upload) የሚለውን ይጠቀሙ።'
            : 'No camera device found on this system. Please connect a webcam or use the "Upload QR Image" option.'
        );
      } else if (isDenied) {
        setCameraError(
          isAm
            ? 'የካሜራ ፈቃድ አልተሰጠም። እባክዎ በብሮውዘርዎ ውስጥ ካሜራ እንዲሰራ ፈቃድ ይስጡ።'
            : 'Camera permission was denied. Please allow camera access in your browser settings.'
        );
      } else {
        setCameraError(
          isAm
            ? 'ካሜራውን መክፈት አልተቻለም። ሌላ መተግበሪያ እየተጠቀመው አለመሆኑን ያረጋግጡ።'
            : 'Could not access camera. Please make sure no other app is using it.'
        );
      }
    }
  };

  // Toggle Camera Facing
  const toggleCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isScanning) {
      await startCamera(nextFacing);
    }
  };

  // Stop Camera
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

  // Upload QR Image
  const handleFileUpload = async (e) => {
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
      isAm ? 'ሰዓት' : 'Time',
      isAm ? 'ሁኔታ' : 'Status',
    ];
    const rows = recentScans.map((s) => [
      s.name,
      s.studentId || '-',
      formatGradeAmharic(s.grade),
      s.timestamp,
      s.status,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${selectedSession?.grade || 'Session'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presentCount = recentScans.filter((s) => s.status === 'Present').length;
  const lateCount = recentScans.filter((s) => s.status === 'Late').length;

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12 font-sans">
      {/* Custom Styles for Html5Qrcode Viewport */}
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

      {/* 🌟 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#0f4c9c] text-white flex items-center justify-center shadow-md shadow-blue-900/20 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isAm ? 'የቀጥታ QR የመገኘት መመዝገቢያ' : 'Live QR Attendance Scanner'}
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {isAm ? 'ብልህ ሲስተም' : 'Smart Auto-Class'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAm
                ? 'የተክለ ሳዊሮስ ሰንበት ትምህርት ቤት • ሲስተሙ የተማሪውን ክፍል በራሱ ያረጋግጣል'
                : 'Tekle Sawiros Sunday School • System automatically validates student class'}
            </p>
          </div>
        </div>

        {/* Top Controls: Language Switcher & Sound Toggle */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setManualMode(!manualMode)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              manualMode
                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{manualMode ? (isAm ? 'ወደ ዛሬ ክፍለ-ጊዜ ተመለስ' : 'Back to Sessions') : (isAm ? 'ብጁ ምርጫ' : 'Custom Select')}</span>
          </button>

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

      {/* 🌟 2. HERO SESSION SELECTOR (The core workflow for Attendance Takers) */}
      {!manualMode ? (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0f4c9c] dark:text-amber-400" />
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                {isAm ? 'የዛሬ የተፈቀዱ ክፍለ-ጊዜዎች' : "Today's Authorized Sessions"}
              </h2>
              <span className="text-xs text-slate-400">
                ({new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })})
              </span>
            </div>
            <button
              type="button"
              onClick={fetchTodaySessions}
              disabled={sessionsLoading}
              className="text-xs text-[#0f4c9c] dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${sessionsLoading ? 'animate-spin' : ''}`} />
              <span>{isAm ? 'አድስ' : 'Refresh'}</span>
            </button>
          </div>

          {sessionsLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0f4c9c]" />
              <span>{isAm ? 'የዛሬ ክፍለ-ጊዜዎች እየተጫኑ ነው...' : 'Loading today sessions...'}</span>
            </div>
          ) : todaySessions.length === 0 ? (
            <div className="py-6 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center space-y-2">
              <Clock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAm ? 'ለዛሬ የተመደበ ክፍለ-ጊዜ የለም።' : 'No scheduled sessions found for today.'}
              </p>
              <p className="text-[11px] text-slate-500">
                {isAm
                  ? 'አስተዳዳሪዎች በ"Attendance Management > Recurring Timetables" ውስጥ ሳምንታዊ ፕሮግራም መመደብ ይችላሉ።'
                  : 'Administrators can define recurring class schedules in Attendance Management.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {todaySessions.map((sess) => {
                const isSelected = selectedSessionId === sess._id;
                const isOpen = sess.status === 'open';
                const isClosed = sess.status === 'closed';
                const isScheduled = sess.status === 'scheduled';
                const isComb = sess.isCombinedSession || sess.sessionType === 'assembly' || sess.sessionType === 'holiday' || sess.sessionType === 'combined';

                return (
                  <div
                    key={sess._id}
                    onClick={() => {
                      setSelectedSessionId(sess._id);
                      setSelectedSession(sess);
                    }}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-[#0f4c9c] bg-blue-50/40 dark:bg-blue-950/20 shadow-md ring-2 ring-[#0f4c9c]/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            {sess.sessionType === 'assembly' ? (
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800">
                                🎯 {isAm ? 'ጠቅላላ ጉባኤ' : 'Assembly'}
                              </span>
                            ) : sess.sessionType === 'holiday' ? (
                              <span className="text-xs font-black text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800">
                                ✨ {isAm ? 'የበዓል መርሃ-ግብር' : 'Spiritual Feast'}
                              </span>
                            ) : isComb ? (
                              <span className="text-xs font-black text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800">
                                👥 {isAm ? 'ጥምር ክፍሎች' : 'Combined'}
                              </span>
                            ) : (
                              <span className="text-xs font-black text-[#0f4c9c] dark:text-blue-400">
                                {formatGradeAmharic(sess.grade)}
                              </span>
                            )}

                            {sess.studentType === 'distance' ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300">
                                {isAm ? '🌐 የርቀት' : '🌐 Distance'}
                              </span>
                            ) : sess.shift === 'night' ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300">
                                {isAm ? '🌙 የማታ ፈረቃ' : '🌙 Night Shift'}
                              </span>
                            ) : sess.shift === 'all' ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-300">
                                {isAm ? '🔄 ሁሉም ፈረቃዎች' : '🔄 All Shifts'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300">
                                {isAm ? '☀️ የቀን ፈረቃ' : '☀️ Day Shift'}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            {sess.title || `${sess.grade} Session`}
                          </h3>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isOpen
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 animate-pulse'
                              : isClosed
                              ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300'
                          }`}
                        >
                          {isOpen
                            ? isAm ? '🟢 ክፍት' : '🟢 Open'
                            : isClosed
                            ? isAm ? '🔒 ተዘግቷል' : '🔒 Closed'
                            : isAm ? '⏳ ተይዟል' : '⏳ Scheduled'}
                        </span>
                      </div>

                      {/* Multi-grade target chips if combined */}
                      {isComb && sess.targetGrades && sess.targetGrades.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {sess.targetGrades.map((g) => (
                            <span
                              key={g}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              {formatGradeAmharic(g)}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {sess.startTime} – {sess.endTime}
                        </span>
                        {sess.location && (
                          <>
                            <span>•</span>
                            <span>{sess.location}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats Tally */}
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">
                        {isAm ? 'የሚጠበቁ፦' : 'Expected:'} <strong className="text-slate-800 dark:text-white">{sess.stats?.expectedCount || 0}</strong>
                      </span>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ✓ {sess.stats?.presentCount || 0}
                        </span>
                        {sess.stats?.lateCount > 0 && (
                          <span className="text-amber-600 dark:text-amber-400">
                            🕒 {sess.stats.lateCount}
                          </span>
                        )}
                        {isClosed && (
                          <span className="text-rose-600 dark:text-rose-400">
                            ✗ {sess.stats?.absentCount || 0}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Toolbar for Selected Session */}
          {selectedSession && (
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{isAm ? 'ንቁ ክፍለ-ጊዜ፦' : 'Active Session:'}</span>
                <span className="text-xs font-black text-slate-900 dark:text-white px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 flex-wrap">
                  <span>
                    {selectedSession.sessionType === 'assembly'
                      ? '🎯 ' + (isAm ? 'ጠቅላላ ጉባኤ' : 'All-School Assembly')
                      : selectedSession.sessionType === 'holiday'
                      ? '✨ ' + (selectedSession.title || (isAm ? 'የበዓል መርሃ-ግብር' : 'Holiday Session'))
                      : selectedSession.isCombinedSession || selectedSession.sessionType === 'combined'
                      ? '👥 ' + (selectedSession.title || (isAm ? 'ጥምር ክፍለ-ጊዜ' : 'Combined Session'))
                      : '🎯 ' + formatGradeAmharic(selectedSession.grade)}
                  </span>
                  {selectedSession.studentType === 'distance' ? (
                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">({isAm ? 'የርቀት' : 'Distance'})</span>
                  ) : selectedSession.shift === 'night' ? (
                    <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">({isAm ? 'የማታ ፈረቃ' : 'Night Shift'})</span>
                  ) : selectedSession.shift === 'all' ? (
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">({isAm ? 'ሁሉም ፈረቃዎች' : 'All Shifts'})</span>
                  ) : (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">({isAm ? 'የቀን ፈረቃ' : 'Day Shift'})</span>
                  )}
                  <span className="text-slate-400">•</span>
                  <span>{selectedSession.startTime} - {selectedSession.endTime}</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleOpenRoster}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isAm ? 'የክፍሉን ተማሪዎች ዝርዝር እይ' : 'View Class Roster'}</span>
                </button>

                {selectedSession.status === 'scheduled' && (
                  <button
                    type="button"
                    onClick={handleStartSession}
                    disabled={isStartingSession}
                    className="px-4 py-2 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isStartingSession ? (isAm ? 'እየተከፈተ ነው...' : 'Starting...') : (isAm ? 'ተገኝነት ጀምር' : 'Start Attendance')}</span>
                  </button>
                )}

                {selectedSession.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => setShowCloseModal(true)}
                    className="px-4 py-2 text-xs font-black rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-700/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>{isAm ? 'ተገኝነት ዝጋ (ቀሪዎችን አልተገኘም አድርግ)' : 'Close Attendance'}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Fallback Manual Session Configuration */
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{isAm ? 'የምዝገባ ዘርፍ' : 'Track'}</label>
              <select
                value={studentTypeFilter}
                onChange={(e) => setStudentTypeFilter(e.target.value)}
                className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="regular">{isAm ? '🏛️ መደበኛ' : 'Regular'}</option>
                <option value="distance">{isAm ? '🌐 የርቀት' : 'Distance'}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{isAm ? 'ክፍል' : 'Class'}</label>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="">{isAm ? '-- ክፍል ይምረጡ --' : '-- Select Class --'}</option>
                <option value="Grade 7">7ኛ ክፍል (Grade 7)</option>
                <option value="Grade 8">8ኛ ክፍል (Grade 8)</option>
                <option value="Grade 9">9ኛ ክፍል (Grade 9)</option>
                <option value="Grade 10">10ኛ ክፍል (Grade 10)</option>
                <option value="Grade 11">11ኛ ክፍል (Grade 11)</option>
                <option value="Grade 12">12ኛ ክፍል (Grade 12)</option>
                <option value="Batch 1">ዙር 1 (Batch 1)</option>
                <option value="Batch 2">ዙር 2 (Batch 2)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">{isAm ? 'ፈረቃ' : 'Shift'}</label>
              <select
                value={shiftFilter}
                onChange={(e) => setShiftFilter(e.target.value)}
                className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="weekend">{isAm ? '☀️ የቀን ፈረቃ' : 'Day'}</option>
                <option value="night">{isAm ? '🌙 የማታ ፈረቃ' : 'Night'}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 3. SCANNER MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Live Camera & Scanner Viewport */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            {/* Viewport Box */}
            <div className="relative flex flex-col items-center justify-center p-3 bg-slate-950 rounded-2xl overflow-hidden min-h-[300px] border border-slate-800">
              <div id="qr-reader-viewport" />

              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 backdrop-blur-xs z-10 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shadow-lg">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {isAm ? 'ካሜራው አልበራም' : 'Camera is inactive'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      {isAm
                        ? 'የተማሪዎችን QR ኮድ ለመቃኘት ካሜራውን ያብሩ።'
                        : 'Turn on camera to begin scanning student QR badges.'}
                    </p>
                  </div>
                  <Button
                    onClick={() => startCamera()}
                    className="bg-[#0f4c9c] hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    {isAm ? 'ካሜራ አብራ' : 'Start Camera'}
                  </Button>
                </div>
              )}

              {cameraError && (
                <div className="absolute inset-x-3 bottom-3 p-3 rounded-xl bg-rose-950/90 border border-rose-800 text-rose-200 text-xs font-bold z-20 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>

            {/* Camera Controls */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                {isScanning ? (
                  <Button
                    variant="outline"
                    onClick={stopCamera}
                    className="border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 mr-1.5" />
                    {isAm ? 'ካሜራ አጥፋ' : 'Stop Camera'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => startCamera()}
                    className="bg-[#0f4c9c] hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    {isAm ? 'ካሜራ አብራ' : 'Start Camera'}
                  </Button>
                )}

                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  title={isAm ? 'ካሜራ ቀይር' : 'Switch Camera'}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                >
                  <FlipHorizontal className="w-4 h-4" />
                </button>
              </div>

              {/* Upload QR Image */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>{isAm ? 'ምስል ጫን' : 'Upload'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Scan Feedback & Attendee Stream */}
        <div className="lg:col-span-7 space-y-4">
          {/* Last Scanned Result Banner */}
          <AnimatePresence mode="wait">
            {lastScannedStudent ? (
              <motion.div
                key={lastScannedStudent.id + lastScannedStudent.timestamp}
                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-4 sm:p-5 rounded-3xl border-2 shadow-md transition-all ${
                  lastScannedStudent.isMismatch
                    ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800'
                    : lastScannedStudent.alreadyRecorded
                    ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-800'
                    : 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {lastScannedStudent.photoUrl ? (
                      <img
                        src={lastScannedStudent.photoUrl}
                        alt="Student"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                          lastScannedStudent.isMismatch
                            ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200'
                            : lastScannedStudent.alreadyRecorded
                            ? 'bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                            : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                        }`}
                      >
                        {lastScannedStudent.isMismatch ? <XCircle className="w-8 h-8" /> : <UserCheck className="w-8 h-8" />}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {lastScannedStudent.name}
                        </h3>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            lastScannedStudent.isMismatch
                              ? 'bg-rose-600 text-white'
                              : lastScannedStudent.status === 'Late'
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {lastScannedStudent.status}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                        {lastScannedStudent.studentId && <span>ID: {lastScannedStudent.studentId} • </span>}
                        <span>{formatGradeAmharic(lastScannedStudent.grade)}</span>
                      </p>

                      <p
                        className={`text-xs font-semibold mt-1 ${
                          lastScannedStudent.isMismatch
                            ? 'text-rose-700 dark:text-rose-300'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {lastScannedStudent.message}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    {lastScannedStudent.timestamp}
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                <ShieldCheck className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                <span>{isAm ? 'ተማሪዎች ሲቃኙ ዝርዝራቸው እዚህ በቀጥታ ይታያል' : 'Scanned students will appear here in real time'}</span>
              </div>
            )}
          </AnimatePresence>

          {/* Scanned Attendees Table & Export Toolbar */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0f4c9c]" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {isAm ? 'የተመዘገቡ ተማሪዎች ዝርዝር' : 'Attended Students Stream'}
                </h3>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {recentScans.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={recentScans.length === 0}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1 disabled:opacity-40"
                >
                  <Download className="w-3 h-3" />
                  <span>CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRecentScans([])}
                  disabled={recentScans.length === 0}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
                  title={isAm ? 'አጽዳ' : 'Clear'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
              {recentScans.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  {isAm ? 'በዚህ ክፍለ-ጊዜ የተመዘገበ ተማሪ የለም' : 'No attendance recorded yet in this stream'}
                </div>
              ) : (
                recentScans.map((s, idx) => (
                  <div
                    key={s.id + idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 text-center font-mono text-[10px] text-slate-400 font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {s.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {formatGradeAmharic(s.grade)} {s.studentId ? `• ${s.studentId}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          s.status === 'Late'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {s.status === 'Late' ? (isAm ? '🕒 አርፍዷል' : 'Late') : (isAm ? '✓ ተገኝቷል' : 'Present')}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{s.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 MODAL 1: CLOSE SESSION CONFIRMATION */}
      <AnimatePresence>
        {showCloseModal && selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 flex items-center justify-center">
                  <Square className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isAm ? 'ተገኝነት መዝጊያ ማረጋገጫ' : 'Confirm Close Attendance'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {formatGradeAmharic(selectedSession.grade)} ({selectedSession.startTime} - {selectedSession.endTime})
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {isAm
                    ? '⚠️ ይህን ክፍለ-ጊዜ ሲዘጉ፦'
                    : '⚠️ When you close this session:'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                  <li>
                    {isAm
                      ? 'እስካሁን ያልተቃኙ ሁሉም ተማሪዎች በራስ-ሰር "አልተገኘም (Absent)" ተብለው ይመዘገባሉ።'
                      : 'All unscanned enrolled students will be automatically marked Absent.'}
                  </li>
                  <li>
                    {isAm
                      ? 'የክፍለ-ጊዜው የመጨረሻ ስታቲስቲክስ ይሰላል።'
                      : 'Final session stats will be calculated.'}
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCloseModal(false)}
                  className="rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isAm ? 'ተመለስ' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleCloseSession}
                  disabled={isClosingSession}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
                >
                  {isClosingSession
                    ? isAm ? 'እየተዘጋ ነው...' : 'Closing...'
                    : isAm ? 'ክፍለ-ጊዜውን ዝጋ' : 'Close Session'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🌟 MODAL 2: LIVE CLASS ROSTER DRAWER */}
      <AnimatePresence>
        {showRosterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0f4c9c]" />
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {isAm ? 'የክፍሉ ተማሪዎች የቀጥታ ሮስተር' : 'Live Class Roster & Status'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatGradeAmharic(selectedSession?.grade)} • {sessionRoster.length} {isAm ? 'ተማሪዎች' : 'students'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRosterModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Table / List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {rosterLoading ? (
                  <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0f4c9c]" />
                    <span>{isAm ? 'ሮስተር እየተጫነ ነው...' : 'Loading roster...'}</span>
                  </div>
                ) : sessionRoster.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    {isAm ? 'በዚህ ክፍል የተመዘገበ ተማሪ አልተገኘም' : 'No students found in this class'}
                  </div>
                ) : (
                  sessionRoster.map((s, idx) => (
                    <div
                      key={s.studentId}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center font-mono text-slate-400 font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {s.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {s.code ? `ID: ${s.code}` : ''} {s.phone ? `• ${s.phone}` : ''}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
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
                          ? isAm ? '✓ ተገኝቷል' : 'Present'
                          : s.status === 'Late'
                          ? isAm ? '🕒 አርፍዷል' : 'Late'
                          : s.status === 'Absent'
                          ? isAm ? '✗ አልተገኘም' : 'Absent'
                          : isAm ? '⏳ ገና አልተቃኘም' : 'Not Scanned Yet'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button
                  onClick={() => setShowRosterModal(false)}
                  className="bg-[#0f4c9c] text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  {isAm ? 'ዝጋ' : 'Close'}
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