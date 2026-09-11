'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Play,
  Square,
  Clock,
  Search,
  UserCheck,
  BookOpen,
  CheckCircle2,
  AlertCircle,
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
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from '../../utils/toast';

// ------------------------------------------------------------------
// Audio feedback generator using Web Audio API
// ------------------------------------------------------------------
const playBeep = (type = 'success', soundEnabled = true) => {
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
      // Pleasant high double-beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'warning') {
      // Gentle chord for already scanned
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.25);
    } else {
      // Error low buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    // AudioContext blocked by browser policy until gesture
  }
};

const QRScanner = () => {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'file'
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Mode & Shift selection (Regular vs Distance, Night vs Weekend)
  const [studentTypeFilter, setStudentTypeFilter] = useState(''); // '' | 'regular' | 'distance'
  const [shiftFilter, setShiftFilter] = useState(''); // '' | 'weekend' | 'night'

  // Course selection
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Late detection
  const [useLateDetection, setUseLateDetection] = useState(false);
  const [classStartTime, setClassStartTime] = useState('08:30');
  const [graceMinutes, setGraceMinutes] = useState(15);

  // Manual search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Live session scanned list & stats
  const [recentScans, setRecentScans] = useState([]);
  const [lastScannedStudent, setLastScannedStudent] = useState(null);

  // Cooldown refs to prevent duplicate rapid scans (within 3 seconds)
  const html5QrCodeRef = useRef(null);
  const lastScannedRef = useRef('');
  const lastScanTimeRef = useRef(0);
  const fileInputRef = useRef(null);

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/api/admin/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : data.courses || []);
        }
      } catch (err) {}
    };
    fetchCourses();
  }, []);

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

        const res = await apiFetch(`/api/admin/students?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.students || []);
        }
      } catch (err) {
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, studentTypeFilter, shiftFilter]);

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
    const endpoint = isManual ? '/api/admin/attendance/manual' : '/api/admin/attendance/scan';
    const status = determineStatus();

    try {
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          courseId: selectedCourseId || undefined,
          studentType: studentTypeFilter || undefined,
          shift: studentTypeFilter === 'regular' ? shiftFilter || undefined : undefined,
          status,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const studentInfo = {
          id: data.student?.id || data.student?._id || payload.studentId || 'ID',
          name: data.student?.name || (payload.firstName ? `${payload.firstName} ${payload.lastName}` : 'ተማሪ'),
          grade: data.student?.grade || payload.grade || '',
          studentType: data.student?.studentType || payload.studentType || 'regular',
          shift: data.student?.shift || payload.shift || '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          status: data.alreadyRecorded ? 'Already Checked' : status,
          alreadyRecorded: !!data.alreadyRecorded,
          message: data.message || 'መገኘት ተመዝግቧል',
        };

        setLastScannedStudent(studentInfo);

        if (data.alreadyRecorded) {
          playBeep('warning', soundEnabled);
          toast.info(`${studentInfo.name} — ቀደም ሲል ተመዝግቧል (Already Checked-in)`);
        } else {
          playBeep('success', soundEnabled);
          try {
            confetti({
              particleCount: 35,
              spread: 60,
              origin: { y: 0.75 },
              colors: ['#d97706', '#1657b8', '#10b981', '#fbbf24'],
            });
          } catch (e) {}

          toast.success(`${studentInfo.name} — ${status === 'Late' ? '🕒 አርፍዶ ተመዝግቧል (Late)' : '✅ ተገኝቷል (Present)'}`);
        }

        // Add to recent feed
        setRecentScans((prev) => [studentInfo, ...prev.slice(0, 19)]);
      } else {
        playBeep('error', soundEnabled);
        toast.error(data.message || 'የመገኘት ምዝገባ አልተሳካም');
      }
    } catch (err) {
      playBeep('error', soundEnabled);
      toast.error('የሰርቨር ግንኙነት ችግር አጋጥሟል');
    }
  };

  // QR Scan Callback
  const handleScan = useCallback(
    async (decodedText) => {
      const now = Date.now();
      if (decodedText === lastScannedRef.current && now - lastScanTimeRef.current < 3000) {
        return; // debounce same QR code
      }
      lastScannedRef.current = decodedText;
      lastScanTimeRef.current = now;

      await processAttendanceRecord({ qrCode: decodedText }, false);
    },
    [selectedCourseId, studentTypeFilter, shiftFilter, useLateDetection, classStartTime, graceMinutes, soundEnabled]
  );

  // Start Camera Scanner
  const startCamera = async () => {
    setCameraError('');
    setIsScanning(true);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode('qr-reader-viewport');
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 15,
          qrbox: { width: 260, height: 260 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {
          // Frame read errors are normal when scanning empty space
        }
      );
    } catch (err) {
      console.error('Camera start error:', err);
      setIsScanning(false);
      setCameraError(
        err?.message?.includes('Permission') || err?.name === 'NotAllowedError'
          ? 'የካሜራ ፈቃድ አልተሰጠም (Camera permission was denied). እባክዎ በBrowserዎ Settings ውስጥ የካሜራ ፈቃድ ይፍቀዱ።'
          : 'ካሜራውን መክፈት አልተቻለም። እባክዎ ካሜራው በሌላ መተግበሪያ አለመያዙን ያረጋግጡ።'
      );
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
      console.warn('Error stopping scanner:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        if (html5QrCodeRef.current.isScanning) {
          html5QrCodeRef.current.stop().catch(() => {}).then(() => {
            html5QrCodeRef.current?.clear().catch(() => {});
          });
        }
      }
    };
  }, []);

  // Scan from Uploaded File
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
      playBeep('error', soundEnabled);
      toast.error('በዚህ ምስል ላይ ትክክለኛ የQR ኮድ አልተገኘም (No QR code detected in image)');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Manual Check-in selection
  const handleManualMark = async (student) => {
    await processAttendanceRecord(
      {
        studentId: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        studentType: student.studentType,
        shift: student.shift,
      },
      true
    );
    setSearchTerm('');
    setSearchOpen(false);
  };

  const presentCount = recentScans.filter((s) => s.status === 'Present').length;
  const lateCount = recentScans.filter((s) => s.status === 'Late').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 font-sans">
      {/* 🌟 1. Header Banner */}
      <PageHeader
        title="የቀጥታ QR የመገኘት መመዝገቢያ (Live QR Attendance)"
        subtitle="የማህደረ ስብሐት ቅድስት ልደታ ለማርያም ደብረ መድኃኒት መድኃኒዓለም ቤተክርስቲያን • ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት"
        icon={QrCode}
        badge={
          <div className="flex items-center gap-2">
            <Badge variant={isScanning ? 'approved' : 'neutral'} size="sm" className="gap-1.5 font-bold">
              <span className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span>{isScanning ? '🔴 ካሜራው ንቁ ነው (Scanning)' : 'ካሜራ ዝግጁ ነው'}</span>
            </Badge>
          </div>
        }
      />

      {/* 🌟 2. Top Controls & Mode / Shift Settings Bar */}
      <Card variant="default" padding="md" className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* 1. Study Mode Selector (Regular vs Distance) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#1657b8] dark:text-amber-400" />
              <span>የምዝገባ ዓይነት (Mode)</span>
            </label>
            <select
              value={studentTypeFilter}
              onChange={(e) => {
                setStudentTypeFilter(e.target.value);
                if (e.target.value !== 'regular') setShiftFilter('');
              }}
              className="w-full p-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] transition-all cursor-pointer"
            >
              <option value="">🏛️ ሁሉም ተማሪዎች (All Modes)</option>
              <option value="regular">🏛️ መደበኛ ተማሪዎች (Regular)</option>
              <option value="distance">🌐 የርቀት ተማሪዎች (Distance)</option>
            </select>
          </div>

          {/* 2. Shift Selector (If Regular or All: Weekend vs Night) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              {shiftFilter === 'night' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>የመማሪያ ፈረቃ (Shift)</span>
            </label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              disabled={studentTypeFilter === 'distance'}
              className="w-full p-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">🕒 ሁሉም ፈረቃዎች (All Shifts)</option>
              <option value="weekend">☀️ የቀን / ቅዳሜና እሁድ (Weekend)</option>
              <option value="night">🌙 የማታ ፈረቃ (Night)</option>
            </select>
          </div>

          {/* 3. Course Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#1657b8] dark:text-amber-400" />
              <span>የክፍለ ጊዜ / ኮርስ</span>
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full p-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-[#1657b8] transition-all cursor-pointer"
            >
              <option value="">🏛️ አጠቃላይ መገኘት (General)</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  📖 {c.name} {c.code ? `(${c.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sound & Late Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUseLateDetection(!useLateDetection)}
              className={`flex-1 p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer truncate ${
                useLateDetection
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{useLateDetection ? '🕒 ማርፈጃ ነቅቷል' : '⚪ ማርፈጃ ጠፍቷል'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'ድምፅ አጥፋ' : 'ድምፅ አብራ'}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                soundEnabled
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Expandable Late Settings */}
        {useLateDetection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                የትምህርት መጀመሪያ ሰዓት (Start Time)
              </label>
              <input
                type="time"
                value={classStartTime}
                onChange={(e) => setClassStartTime(e.target.value)}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">
                የማስተናገጃ ደቂቃ (Grace Minutes)
              </label>
              <input
                type="number"
                min="0"
                max="60"
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(Number(e.target.value))}
                className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </motion.div>
        )}
      </Card>

      {/* 🌟 3. Main Scanning Station (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Camera Scanner Station */}
        <div className="lg:col-span-7 space-y-4">
          <Card variant="default" padding="none" className="bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
            {/* Viewport Header Bar */}
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10 relative">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-slate-300 ml-2">High-Speed QR Optical Scanner</span>
              </div>

              {/* Mode Tabs */}
              <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setActiveTab('camera');
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'camera' ? 'bg-[#1657b8] text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5 inline mr-1" />
                  ካሜራ
                </button>
                <button
                  onClick={() => {
                    if (isScanning) stopCamera();
                    setActiveTab('file');
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'file' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  ምስል ጫን
                </button>
              </div>
            </div>

            {/* Camera Viewport Area */}
            <div className="relative min-h-[380px] sm:min-h-[420px] bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden">
              {/* Hidden DOM mount target for html5-qrcode video */}
              <div
                id="qr-reader-viewport"
                className={`w-full max-w-[340px] aspect-square rounded-2xl overflow-hidden ${
                  isScanning && activeTab === 'camera' ? 'block shadow-2xl ring-2 ring-amber-400/40' : 'hidden'
                }`}
              />

              {/* Laser Scanning Reticle Overlay (Active state) */}
              {isScanning && activeTab === 'camera' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-20">
                  <div className="w-[260px] h-[260px] relative border border-white/20 rounded-2xl">
                    {/* Golden Reticle Corner Brackets */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg shadow-[0_0_12px_#f59e0b]" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg shadow-[0_0_12px_#f59e0b]" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg shadow-[0_0_12px_#f59e0b]" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg shadow-[0_0_12px_#f59e0b]" />

                    {/* Animated Laser Scan Beam */}
                    <motion.div
                      animate={{ y: [0, 240, 0] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-full h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b]"
                    />

                    {/* Center crosshair */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 text-xs font-mono">
                      +
                    </div>
                  </div>
                </div>
              )}

              {/* Inactive Camera Prompt */}
              {!isScanning && activeTab === 'camera' && (
                <div className="text-center space-y-4 max-w-sm px-4 z-10 py-10">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-3xl shadow-inner">
                    <QrCode className="w-10 h-10 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">ካሜራውን ለማስጀመር ዝግጁ ነዎት?</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      የተማሪውን የዲጂታል መታወቂያ ወይም የታተመ የQR ኮድ በካሜራው ፊት ለፊት በማቅረብ ወዲያውኑ መገኘትን ይመዝግቡ።
                    </p>
                  </div>

                  {/* Active filter indication badge */}
                  {(studentTypeFilter || shiftFilter) && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-bold text-amber-300">
                      <span>ዒላማ፦</span>
                      <span>{studentTypeFilter === 'distance' ? '🌐 የርቀት' : '🏛️ መደበኛ'}</span>
                      {shiftFilter && <span>({shiftFilter === 'night' ? '🌙 ማታ' : '☀️ ቅዳሜ/እሁድ'})</span>}
                    </div>
                  )}

                  {cameraError && (
                    <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs text-left">
                      ⚠️ {cameraError}
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={startCamera}
                    className="w-full bg-gradient-to-r from-[#1657b8] to-[#0f4699] hover:from-[#124796] hover:to-[#0c377a] text-white font-black text-sm py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 gap-2 border border-blue-400/30"
                  >
                    <Play className="w-4 h-4 fill-current text-amber-300" />
                    <span>ካሜራ ጀምር (Start Camera Scanner)</span>
                  </Button>
                </div>
              )}

              {/* Upload QR Image Tab */}
              {activeTab === 'file' && (
                <div className="text-center space-y-4 max-w-sm px-4 z-10 py-10">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-3xl shadow-inner">
                    <Upload className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">የQR ኮድ ምስል ይጫኑ</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      ከተማሪው ስልክ የተላከ የQR ስክሪንሾት ወይም ፎቶ በመምረጥ በቀጥታ መገኘትን ይመዝግቡ።
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="qr-file-upload-input"
                  />

                  <label
                    htmlFor="qr-file-upload-input"
                    className="inline-flex w-full items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm cursor-pointer shadow-lg shadow-amber-600/25 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>ምስል ምረጥና ስካን አድርግ</span>
                  </label>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            {isScanning && activeTab === 'camera' && (
              <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  የQR ኮዱን ወደ ካሜራው አቅርበው ይያዙ
                </span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={stopCamera}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5 rounded-xl text-xs shadow-md"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>ካሜራ አቁም (Stop)</span>
                </Button>
              </div>
            )}
          </Card>

          {/* 🌟 4. Manual Check-in Search Bar */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-[#1657b8] dark:text-amber-400" />
                <span>በስም ወይም በመታወቂያ ፈልጎ መመዝገብ (Manual Check-In)</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {studentTypeFilter ? (studentTypeFilter === 'distance' ? 'የርቀት ተማሪዎች ብቻ' : 'መደበኛ ተማሪዎች ብቻ') : 'ሁሉም ተማሪዎች'}
              </span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="የተማሪውን ሙሉ ስም፣ ስልክ ወይም የመታወቂያ ቁጥር ያስገቡ..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#1657b8] dark:focus:border-amber-400 shadow-sm transition-all"
              />
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Manual Search Floating Dropdown */}
            <AnimatePresence>
              {searchOpen && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800"
                >
                  {searchResults.map((s) => (
                    <div
                      key={s._id}
                      className="p-3 sm:p-3.5 hover:bg-blue-50/70 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-colors group"
                      onMouseDown={() => handleManualMark(s)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1657b8]/10 text-[#1657b8] dark:text-amber-400 font-black flex items-center justify-center text-xs">
                          {s.firstName?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#1657b8] dark:group-hover:text-amber-400 transition-colors">
                            {s.firstName} {s.lastName}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{s.studentId ? `ID: ${s.studentId}` : s.phone || 'ተማሪ'}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-600 dark:text-slate-300">
                              {s.studentType === 'distance' ? '🌐 የርቀት' : `🏛️ መደበኛ (${s.shift === 'night' ? '🌙 ማታ' : '☀️ ቅዳሜ/እሁድ'})`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-[#1657b8] text-white text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-sm">
                        <span>መዝግብ</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column (5 cols): Live Scan Result Card & Real-time History */}
        <div className="lg:col-span-5 space-y-4">
          {/* Latest Scanned Student Card */}
          {lastScannedStudent ? (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={lastScannedStudent.id + lastScannedStudent.timestamp}
              className={`p-5 rounded-3xl border shadow-lg relative overflow-hidden ${
                lastScannedStudent.alreadyRecorded
                  ? 'bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/40 dark:to-slate-900 border-amber-300 dark:border-amber-700/60'
                  : lastScannedStudent.status === 'Late'
                  ? 'bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/40 dark:to-slate-900 border-orange-300 dark:border-orange-700/60'
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-slate-900 border-emerald-300 dark:border-emerald-700/60'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${
                      lastScannedStudent.alreadyRecorded
                        ? 'bg-amber-500 text-slate-950'
                        : lastScannedStudent.status === 'Late'
                        ? 'bg-orange-500 text-white'
                        : 'bg-emerald-500 text-white'
                    }`}
                  >
                    {lastScannedStudent.alreadyRecorded ? 'ℹ️' : lastScannedStudent.status === 'Late' ? '🕒' : '✅'}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                      {lastScannedStudent.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      <span>{lastScannedStudent.grade ? `${lastScannedStudent.grade}` : 'ተማሪ'}</span>
                      <span>•</span>
                      <span className="text-amber-700 dark:text-amber-400 font-bold">
                        {lastScannedStudent.studentType === 'distance'
                          ? '🌐 የርቀት'
                          : `🏛️ መደበኛ (${lastScannedStudent.shift === 'night' ? '🌙 ማታ' : '☀️ ቅዳሜ/እሁድ'})`}
                      </span>
                    </div>
                  </div>
                </div>

                <Badge
                  variant={lastScannedStudent.alreadyRecorded ? 'gold' : lastScannedStudent.status === 'Late' ? 'neutral' : 'approved'}
                  size="sm"
                  className="font-bold shrink-0"
                >
                  {lastScannedStudent.alreadyRecorded ? 'ቀደም ሲል የተመዘገበ' : lastScannedStudent.status === 'Late' ? 'አርፍዷል' : 'ተገኝቷል'}
                </Badge>
              </div>

              <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>ሁኔታ፦ {lastScannedStudent.message}</span>
                <span className="text-[11px] font-mono opacity-75">{lastScannedStudent.timestamp}</span>
              </div>
            </motion.div>
          ) : (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto opacity-70" />
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">ምንም ስካን ገና አልተካሄደም</h4>
              <p className="text-[11px] text-slate-400">ካሜራውን ሲያስጀምሩ የተመዘገቡ ተማሪዎች ዝርዝር እዚህ በቅጽበት ይታያል።</p>
            </div>
          )}

          {/* Session Statistics Tiles */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
              <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400">{presentCount}</p>
              <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">ተገኝተዋል</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
              <p className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">{lateCount}</p>
              <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">አርፍደዋል</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
              <p className="text-lg sm:text-xl font-black text-slate-700 dark:text-slate-300">{recentScans.length}</p>
              <p className="text-[10px] font-bold text-slate-500 truncate mt-0.5">አጠቃላይ ዛሬ</p>
            </div>
          </div>

          {/* Real-time Rolling Attendance Feed */}
          <Card variant="default" padding="md" className="space-y-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#1657b8] dark:text-amber-400" />
                <span>የቅርብ ጊዜ ምዝገባዎች (Live Feed)</span>
              </h3>
              <Badge variant="neutral" size="sm">{recentScans.length} ተመዝግበዋል</Badge>
            </div>

            {recentScans.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 italic">
                ተማሪዎች ስካን ሲያደርጉ እዚህ በቀጥታ ይመዘገባሉ።
              </div>
            ) : (
              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800/60">
                {recentScans.map((scan, idx) => (
                  <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          scan.alreadyRecorded ? 'bg-amber-400' : scan.status === 'Late' ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}
                      />
                      <span className="font-bold text-slate-900 dark:text-white truncate">{scan.name}</span>
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.2 rounded font-semibold shrink-0">
                        {scan.studentType === 'distance' ? 'ርቀት' : scan.shift === 'night' ? 'ማታ' : 'ቀን'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">{scan.timestamp}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          scan.alreadyRecorded
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300'
                            : scan.status === 'Late'
                            ? 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300'
                            : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                        }`}
                      >
                        {scan.alreadyRecorded ? 'ቀደም ሲል' : scan.status === 'Late' ? 'አርፍዷል' : 'ተገኝቷል'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;