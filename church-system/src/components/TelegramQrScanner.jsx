'use client';

import React, { useState } from 'react';
import { Camera, CheckCircle2, AlertCircle, RefreshCw, UserCheck, Search, ShieldCheck } from 'lucide-react';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import { apiFetch } from '../utils/apiFetch';

export default function TelegramQrScanner({ onScanSuccess, defaultSession = 'Regular' }) {
  const { isTelegram, scanQrCode, triggerHaptic } = useTelegramWebApp();
  const [manualId, setManualId] = useState('');
  const [session, setSession] = useState(defaultSession);
  const [status, setStatus] = useState('Present');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const submitAttendance = async (studentIdentifier) => {
    if (!studentIdentifier || !studentIdentifier.trim()) {
      setErrorMsg('እባክዎ የተማሪውን መለያ ቁጥር ያስገቡ ወይም በካሜራ ይቃኙ');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setLastResult(null);

    try {
      const res = await apiFetch('/api/telegram/attendance/scan-checkin', {
        method: 'POST',
        body: JSON.stringify({
          studentIdentifier: studentIdentifier.trim(),
          session,
          status,
        }),
      });

      if (res && res.success) {
        setLastResult(res);
        triggerHaptic('success');
        setManualId('');
        if (typeof onScanSuccess === 'function') {
          onScanSuccess(res);
        }
      } else {
        setErrorMsg(res?.message || 'የተማሪውን መረጃ ማግኘት አልተቻለም');
        triggerHaptic('error');
      }
    } catch (err) {
      console.error('Scan attendance error:', err);
      setErrorMsg(err.message || 'የክትትል ምዝገባ ላይ ስህተት ተከስቷል');
      triggerHaptic('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraScan = () => {
    setErrorMsg('');
    const initiated = scanQrCode('የተማሪውን የዲጂታል QR ባጅ ያሳዩ (Scan Student Badge)', (scannedText) => {
      if (scannedText) {
        submitAttendance(scannedText);
        return true; // closes popup
      }
      return false;
    });

    if (!initiated) {
      // Fallback if not inside Telegram or API unavailable
      setErrorMsg('የካሜራ ስካነር በቴሌግራም አፕሊኬሽን ውስጥ ብቻ ነው የሚሰራው። እባክዎ ከታች መለያ ቁጥሩን በእጅ ያስገቡ።');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    submitAttendance(manualId);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold">የተማሪዎች ፈጣን ክትትል መመዝገቢያ</h3>
            <p className="text-xs text-slate-400">በQR ባጅ ስካነር ወይም በመለያ ቁጥር</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>መምህራን</span>
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">ሁኔታ (Status)</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="Present">🟢 ተገኝቷል (Present)</option>
            <option value="Late">🟡 አርፍዷል (Late)</option>
            <option value="Excused">🔵 በፈቃድ (Excused)</option>
            <option value="Absent">🔴 አልተገኘም (Absent)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">ክፍለ-ጊዜ (Session)</label>
          <select
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="Regular">መደበኛ ክፍለ-ጊዜ</option>
            <option value="Morning">የማለዳ ፈረቃ</option>
            <option value="Night">የማታ ፈረቃ</option>
            <option value="Special">ልዩ ክንውን</option>
          </select>
        </div>
      </div>

      {/* Main Telegram Camera Trigger Button */}
      {isTelegram && (
        <button
          onClick={handleCameraScan}
          disabled={isLoading}
          className="w-full mb-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <Camera className="w-5 h-5" />
          <span>{isLoading ? 'በማረጋገጥ ላይ...' : '📷 በካሜራ የQR ባጅ ስካን ያድርጉ'}</span>
        </button>
      )}

      {/* Manual Input Fallback */}
      <form onSubmit={handleManualSubmit} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="የተማሪ መለያ ቁጥር (ምሳሌ፦ STU-2026-0042 ወይም ስልክ)"
            className="w-full bg-slate-950/60 border border-white/15 rounded-xl pl-10 pr-24 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <button
            type="submit"
            disabled={isLoading || !manualId.trim()}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all disabled:opacity-40"
          >
            {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'መዝግብ'}
          </button>
        </div>
      </form>

      {/* Success Notification Result */}
      {lastResult && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-bold text-sm text-emerald-200">የተማሪው ክትትል ተመዝግቧል!</span>
          </div>
          {lastResult.student && (
            <div className="text-xs text-slate-200 space-y-1 pt-1 border-t border-emerald-500/20">
              <div className="flex justify-between">
                <span className="text-slate-400">ተማሪ፦</span>
                <span className="font-semibold">{lastResult.student.firstName} {lastResult.student.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">መለያ ቁጥር፦</span>
                <span className="font-mono">{lastResult.student.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">ክፍል፦</span>
                <span>{lastResult.student.grade || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">የተገኝነት ምጣኔ፦</span>
                <span className="font-bold text-amber-300">{lastResult.attendanceRate}%</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
