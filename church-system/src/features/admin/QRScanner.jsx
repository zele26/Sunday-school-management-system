'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  QrCode, 
  Play, 
  Square, 
  Clock, 
  Search, 
  UserCheck, 
  BookOpen, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { toast } from '../../utils/toast';

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
// ------------------------------------------------------------------
const ScannerView = memo(({ onScan }) => {
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
        onScan(decodedText);
      },
      () => {}
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [onScan]);

  return (
    <Card className="w-full flex flex-col items-center justify-center p-4 bg-surface-page border-2 border-dashed border-subtle">
      <div id="reader" className="w-full max-w-[400px] overflow-hidden rounded-2xl shadow-inner bg-surface-card" />
    </Card>
  );
});

ScannerView.displayName = 'ScannerView';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);

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

  // Cooldown refs to prevent duplicate scans of the same QR code within 3 seconds
  const lastScannedRef = useRef('');
  const lastScanTimeRef = useRef(0);

  // Fetch courses for dropdown
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
          toast.success(`${data.student?.name || 'ተማሪ'} — ${data.message}`);
        } else {
          playBeep('error');
          toast.error(data.message || 'ስህተት አጋጥሟል');
        }
      } catch (err) {
        playBeep('error');
        toast.error('የኔትወርክ ችግር አጋጥሟል');
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
        toast.success(`${data.student?.name || student.firstName} — ${data.message}`);
      } else {
        playBeep('error');
        toast.error(data.message || 'ምዝገባው አልተሳካም');
      }
      setSearchTerm('');
      setSearchOpen(false);
    } catch (err) {
      playBeep('error');
      toast.error('የኔትወርክ ችግር አጋጥሟል');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Live QR Attendance Scanner (የቀጥታ የመገኘት መመዝገቢያ)"
        subtitle="Continuous high-speed QR code scanning for Sunday School classes and services."
        icon={QrCode}
      />

      {/* Course Selection & Late Detection Panel */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap gap-4 items-end justify-between">
          <div className="flex-1 min-w-[240px]">
            <Select
              label="Select Course (ኮርስ ይምረጡ)"
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              <option value="">General Attendance / All Courses (አጠቃላይ)</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center pb-1">
            <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-main cursor-pointer select-none bg-surface-page px-4 py-2.5 rounded-xl border border-subtle shadow-xs hover:bg-surface-page/80 transition-colors">
              <input
                type="checkbox"
                checked={useLateDetection}
                onChange={(e) => setUseLateDetection(e.target.checked)}
                className="w-4 h-4 text-brand-primary rounded border-subtle focus:ring-brand-primary cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" /> Enable Late Detection (ማርፈጃ)
              </span>
            </label>
          </div>
        </div>

        {/* Conditional Late Detection Settings */}
        {useLateDetection && (
          <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-subtle animate-in fade-in">
            <div className="w-44">
              <Input
                label="Class Start Time"
                type="time"
                value={classStartTime}
                onChange={(e) => setClassStartTime(e.target.value)}
              />
            </div>
            <div className="w-36">
              <Input
                label="Grace Period (min)"
                type="number"
                min="0"
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Manual Search Bar */}
      <div className="space-y-1.5 relative">
        <label className="text-xs font-bold text-muted uppercase tracking-wider block">
          Manual Check-In (በስም ፈልጎ መመዝገብ)
        </label>
        <div className="relative">
          <Input
            placeholder="Search student by name for manual check‑in..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            icon={Search}
          />
        </div>

        {searchOpen && searchResults.length > 0 && (
          <Card className="absolute z-20 left-0 right-0 p-0 shadow-xl mt-1 max-h-52 overflow-auto divide-y divide-subtle">
            {searchResults.map((s) => (
              <div
                key={s._id}
                className="px-4 py-3 hover:bg-brand-primary/10 cursor-pointer text-sm flex items-center justify-between transition-colors"
                onMouseDown={() => handleManualMark(s)}
              >
                <span className="font-semibold text-main">
                  {s.firstName} {s.lastName}
                </span>
                <Badge variant="primary">Grade: {s.grade}</Badge>
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Scan Controls */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant={scanning ? 'secondary' : 'primary'}
          onClick={() => setScanning(true)}
          disabled={scanning}
        >
          <Play className="w-4 h-4 mr-1.5 fill-current" />
          {scanning ? 'ካሜራው በርቷል (Scanner Active…)' : 'ካሜራ ጀምር (Start Scanner)'}
        </Button>
        {scanning && (
          <Button
            variant="danger"
            onClick={() => setScanning(false)}
          >
            <Square className="w-4 h-4 mr-1.5 fill-current" /> ካሜራ አቁም (Stop Scanner)
          </Button>
        )}
      </div>

      {/* Scanner view */}
      {scanning && (
        <div className="pt-2 animate-in fade-in">
          <ScannerView onScan={handleScan} />
        </div>
      )}
    </div>
  );
};

export default QRScanner;