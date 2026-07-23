// src/features/admin/QRScanner.jsx
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { apiFetch } from '../../api/apiClient';
import useAuthStore from '../../store/authStore';

const API_BASE_URL = 'https://church-api-3l2c.onrender.com';

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

  return <div id="reader" style={{ width: '100%', maxWidth: '400px' }} />;
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
    <div className="bg-white p-6 rounded-2xl shadow space-y-6">
      <h2 className="text-xl font-bold">Attendance Scanner</h2>

      {/* Course Selection & Late Detection */}
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="text-xs text-slate-500 block">Select Course</label>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            className="p-2 border rounded-xl text-sm"
          >
            <option value="">General (no course)</option>
            {courses.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useLateDetection}
            onChange={e => setUseLateDetection(e.target.checked)}
          />
          Enable Late Detection
        </label>
        {useLateDetection && (
          <>
            <div>
              <label className="text-xs text-slate-500 block">Class Start</label>
              <input
                type="time"
                value={classStartTime}
                onChange={e => setClassStartTime(e.target.value)}
                className="p-2 border rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 block">Grace (min)</label>
              <input
                type="number"
                min="0"
                value={graceMinutes}
                onChange={e => setGraceMinutes(e.target.value)}
                className="p-2 border rounded-xl text-sm w-20"
              />
            </div>
          </>
        )}
      </div>

      {/* Manual Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search student by name for manual check‑in..."
          value={searchTerm}
          onChange={e => { setSearchTerm(e.target.value); setSearchOpen(true); }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
          className="p-2 border rounded-xl text-sm w-full"
        />
        {searchOpen && searchResults.length > 0 && (
          <div className="absolute z-10 bg-white border rounded-xl shadow-lg mt-1 w-full max-h-40 overflow-auto">
            {searchResults.map(s => (
              <div
                key={s._id}
                className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm"
                onMouseDown={() => handleManualMark(s)}
              >
                {s.firstName} {s.lastName} ({s.grade})
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scan Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setScanning(true)}
          disabled={scanning}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {scanning ? 'Scanning…' : 'Start Scanner'}
        </button>
        {scanning && (
          <button
            onClick={() => setScanning(false)}
            className="bg-rose-600 text-white px-4 py-2 rounded-xl text-sm font-semibold"
          >
            Stop Scanner
          </button>
        )}
      </div>

      {/* Scanner view */}
      {scanning && (
        <ScannerView onScan={handleScan} onError={() => {}} />
      )}

      {/* Toast messages */}
      <div className="space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`text-sm p-2 rounded-xl ${
              t.type === 'success' ? 'bg-emerald-50 text-emerald-700' : t.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QRScanner;