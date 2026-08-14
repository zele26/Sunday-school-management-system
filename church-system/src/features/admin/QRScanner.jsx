// src/features/admin/QRScanner.jsx
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { apiFetch, API_BASE_URL } from '../../api/apiClient';
import useAuthStore from '../../store/authStore';

// Simple beep / buzz using AudioContext
const playBeep = (type = 'success') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === 'success') {
      osc.frequency.value = 880;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.frequency.value = 220;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) { /* ignore */ }
};

// ------------------------------------------------------------------
// Stable scanner child – mounts once, never re-renders
// It calls onScan repeatedly without stopping.
// ------------------------------------------------------------------
const ScannerView = memo(({ onScan, onError }) => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    scannerRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Do NOT stop – we want continuous scanning
        onScan(decodedText);
      },
      (err) => {
        // ignore non‑fatal scan errors
      }
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center p-4 bg-slate-900/5 rounded-2xl border-2 border-dashed border-slate-300">
      <div id="reader" className="w-full max-w-[400px] overflow-hidden rounded-xl shadow-inner bg-white" />
    </div>
  );
});

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------
const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [toasts, setToasts] = useState([]);   // array of { text, type }

  // Course selection
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Late detection
  const [useLateDetection, setUseLateDetection] = useState(false);
  const [classStartTime, setClassStartTime] = useState('');
  const [graceMinutes, setGraceMinutes] = useState(10);

  // Manual search
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const toastId = useRef(0);

  // Cooldown refs to prevent duplicate scans of the same QR code within 3 seconds
  const lastScannedRef = useRef('');
  const lastScanTimeRef = useRef(0);

  const addToast = (text, type = 'info') => {
    const id = ++toastId.current;
    setToasts(prev => [...prev, { id, text, type }]);
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Fetch courses for dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiFetch('/api/admin/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data);
        }
      } catch (err) {}
    };
    fetchCourses();
  }, []);

  // Manual search
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch(`/api/admin/students?search=${searchTerm}&limit=10`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.students || []);
        }
      } catch (err) {}
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Determine status based on late detection
  const determineStatus = () => {
    if (!useLateDetection || !classStartTime) return 'Present';
    const now = new Date();
    const [h, m] = classStartTime.split(':').map(Number);
    const start = new Date();
    start.setHours(h, m, 0, 0);
    const graceEnd = new Date(start.getTime() + (graceMinutes * 60000));
    return now > graceEnd ? 'Late' : 'Present';
  };

  // Core scan handler
  const handleScan = useCallback(
    async (decodedText) => {
      // Cooldown: ignore the same QR code if scanned within 3 seconds
      const now = Date.now();
      if (decodedText === lastScannedRef.current && now - lastScanTimeRef.current < 3000) {
        return;
      }
      lastScannedRef.current = decodedText;
      lastScanTimeRef.current = now;

      try {
        const status = determineStatus();
        const res = await apiFetch('/api/admin/attendance/scan', {
          method: 'POST',
          body: JSON.stringify({
            qrCode: decodedText,
            courseId: selectedCourseId || undefined,
            status,
          }),
        });
        const data = await res.json();
        if (data.success) {
          playBeep('success');
          addToast(`✅ ${data.student.name} – ${data.message}`, 'success');
        } else {
          playBeep('error');
          addToast(`❌ ${data.message}`, 'error');
        }
      } catch (err) {
        playBeep('error');
        addToast('Network error', 'error');
      }
    },
    [selectedCourseId, useLateDetection, classStartTime, graceMinutes]
  );

  // Manual mark attendance
  const handleManualMark = async (student) => {
    try {
      const status = determineStatus();
      const res = await apiFetch('/api/admin/attendance/manual', {
        method: 'POST',
        body: JSON.stringify({
          studentId: student._id,
          courseId: selectedCourseId || undefined,
          status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        playBeep('success');
        addToast(`✅ ${data.student.name} – ${data.message}`, 'success');
      } else {
        playBeep('error');
        addToast(`❌ ${data.message}`, 'error');
      }
      setSearchTerm('');
      setSearchOpen(false);
    } catch (err) {
      playBeep('error');
      addToast('Network error', 'error');
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8 max-w-4xl mx-auto font-sans">
      {/* Header Section */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Attendance Scanner</h2>
          <p className="text-xs text-slate-500 mt-1">Scan student ID cards or search manually to log attendance</p>
        </div>
        <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-lg shadow-sm">
          📷
        </div>
      </div>

      {/* Course Selection & Late Detection Panel */}
      <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/60 space-y-4">
        <div className="flex flex-wrap gap-5 items-end justify-between">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
              Select Course
            </label>
            <select
              value={selectedCourseId}
              onChange={e => setSelectedCourseId(e.target.value)}
              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="">General (no course)</option>
              {courses.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center pb-1">
            <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer select-none bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={useLateDetection}
                onChange={e => setUseLateDetection(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Enable Late Detection</span>
            </label>
          </div>
        </div>

        {/* Conditional Late Detection Settings */}
        {useLateDetection && (
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-200/60 animate-fade-in">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Class Start Time</label>
              <input
                type="time"
                value={classStartTime}
                onChange={e => setClassStartTime(e.target.value)}
                className="p-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Grace Period (min)</label>
              <input
                type="number"
                min="0"
                value={graceMinutes}
                onChange={e => setGraceMinutes(e.target.value)}
                className="p-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium w-24 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none shadow-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Manual Search Bar */}
      <div className="space-y-1.5 relative">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
          Manual Check-In
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search student by name for manual check‑in..."
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

        {searchOpen && searchResults.length > 0 && (
          <div className="absolute z-20 left-0 right-0 bg-white border border-slate-200 rounded-2xl shadow-xl mt-1 max-h-52 overflow-auto divide-y divide-slate-100">
            {searchResults.map(s => (
              <div
                key={s._id}
                className="px-4 py-3 hover:bg-indigo-50/60 cursor-pointer text-sm flex items-center justify-between transition-colors"
                onMouseDown={() => handleManualMark(s)}
              >
                <span className="font-semibold text-slate-700">{s.firstName} {s.lastName}</span>
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">Grade: {s.grade}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scan Controls */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={() => setScanning(true)}
          disabled={scanning}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span>▶</span>
          <span>{scanning ? 'Scanner Active…' : 'Start Scanner'}</span>
        </button>
        {scanning && (
          <button
            onClick={() => setScanning(false)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          >
            <span>⏹</span>
            <span>Stop Scanner</span>
          </button>
        )}
      </div>

      {/* Scanner view */}
      {scanning && (
        <div className="pt-2 animate-fade-in">
          <ScannerView onScan={handleScan} onError={() => {}} />
        </div>
      )}

      {/* Toast messages - Styled as stacked pill notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`text-sm p-4 rounded-2xl shadow-lg border pointer-events-auto flex items-center gap-3 transition-all transform animate-bounce-short ${
                t.type === 'success' 
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/20' 
                  : t.type === 'error' 
                  ? 'bg-rose-600 border-rose-500 text-white shadow-rose-500/20' 
                  : 'bg-slate-800 border-slate-700 text-white shadow-slate-900/20'
              }`}
            >
              <span className="font-medium leading-snug">{t.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QRScanner;