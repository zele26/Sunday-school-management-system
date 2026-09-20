// src/features/student/StudentProfileModule.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  CreditCard,
  Hash,
  Clock,
  ShieldCheck,
  BookOpen,
  CalendarCheck,
  RefreshCw,
  Sparkles,
  Send,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  KeyRound,
} from 'lucide-react';
import { apiFetch, API_BASE_URL } from '../../api/apiClient';
import useAuthStore from '../../store/authStore';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { useLanguage } from '../../hooks/useLanguage';
import { FadeIn } from '../../components/motion';
import { Card, Badge, Button } from '../../components/ui';
import { getEducationLevelLabel, getProfessionLabel, getRelationshipLabel, formatGradeAmharic } from '../../constants/registrationOptions';

const StudentProfile = () => {
  const { t, isAmharic } = useLanguage();
  const authUser = useAuthStore((state) => state.user);

  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [botStatus, setBotStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAllStudentData = async () => {
    setLoading(true);
    setError('');

    try {
      // Ensure we have a fresh token before calling the profile endpoint
      let token = useAuthStore.getState().accessToken;
      if (!token) {
        const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          useAuthStore.getState().login(refreshData.accessToken, refreshData.user);
          token = refreshData.accessToken;
        }
      }

      const [profRes, attRes, crsRes, botRes] = await Promise.allSettled([
        apiFetch('/api/student/profile'),
        apiFetch('/api/student/my-attendance'),
        apiFetch('/api/student/my-courses'),
        apiFetch('/api/telegram/status'),
      ]);

      // 1. Profile response
      if (profRes.status === 'fulfilled' && profRes.value.ok) {
        const data = await profRes.value.json();
        setProfile(data.student || data);
      } else if (profRes.status === 'fulfilled' && !profRes.value.ok) {
        const errData = await profRes.value.json().catch(() => ({}));
        throw new Error(errData.message || (isAmharic ? 'የተማሪ መረጃ መጫን አልተቻለም' : 'Failed to load student profile'));
      } else if (profRes.status === 'rejected') {
        throw new Error(profRes.reason?.message || (isAmharic ? 'የአገልጋይ ግንኙነት ችግር' : 'Network connection error'));
      }

      // 2. Attendance response
      if (attRes.status === 'fulfilled' && attRes.value.ok) {
        const attData = await attRes.value.json();
        if (Array.isArray(attData)) setAttendance(attData);
      }

      // 3. Courses response
      if (crsRes.status === 'fulfilled' && crsRes.value.ok) {
        const crsData = await crsRes.value.json();
        if (Array.isArray(crsData)) setCourses(crsData);
      }

      // 4. Telegram Bot Info
      if (botRes.status === 'fulfilled' && botRes.value.ok) {
        const bData = await botRes.value.json().catch(() => ({}));
        setBotStatus(bData);
      }
    } catch (err) {
      console.error('Student profile load error:', err);
      setError(err.message || (isAmharic ? 'መረጃውን መጫን አልተቻለም' : 'Failed to load student profile'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllStudentData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-sans">
        <div className="text-center text-slate-600 dark:text-slate-300">
          <div className="w-9 h-9 border-3 border-[#1657b8] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold">
            {isAmharic ? 'የተማሪ መረጃ በመጫን ላይ ነው...' : 'Loading student profile...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-sans p-4">
        <div className="p-8 text-center text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-rose-100 dark:border-rose-900/40 max-w-md w-full space-y-4">
          <p className="font-bold text-base">⚠️ {error}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={loadAllStudentData} className="gap-2">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'እንደገና ሞክር' : 'Try Again'}</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                useAuthStore.getState().logout();
                window.location.href = '/login';
              }}
            >
              {isAmharic ? 'ወደ መግቢያ ገጽ' : 'Login Page'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center font-sans">
        <p className="text-slate-500">{isAmharic ? 'ምንም መረጃ አልተገኘም።' : 'No profile data found.'}</p>
      </div>
    );
  }

  const fullName = [profile.firstName, profile.middleName, profile.lastName]
    .filter(Boolean)
    .join(' ')
    .trim() || authUser?.fullName || (isAmharic ? 'ተማሪ' : 'Student');

  const emergencyName = [
    profile.emergencyFirstName || profile.parentName || '',
    profile.emergencyMiddleName || '',
    profile.emergencyLastName || '',
  ].filter(Boolean).join(' ').trim();

  const emergencyPhone = profile.emergencyPhone || profile.parentPhone || profile.contactPhone || '';
  const emergencyEmail = profile.emergencyEmail || profile.parentEmail || profile.contactEmail || '';
  const studentType = profile.studentType || 'regular';
  const rawGrade = profile.grade || profile.batch || authUser?.grade || '-';
  const gradeDisplay = rawGrade !== '-' ? (isAmharic ? formatGradeAmharic(rawGrade) : rawGrade) : '-';
  const batchDisplay = profile.batch || '-';
  const studentIdDisplay = profile.studentId || authUser?.studentId || profile.registrationNumber || '-';
  const registrationNumber = profile.registrationNumber || '-';

  return (
    <div className="min-h-screen py-4 sm:py-6 px-3 sm:px-6 lg:px-8 font-sans max-w-5xl mx-auto space-y-6">
      {/* 🌟 1. IDENTITY HEADER CARD */}
      <FadeIn direction="down" duration={0.3}>
        <Card variant="default" padding="none" className="overflow-hidden border border-blue-900/40 shadow-xl rounded-3xl">
          <div className="bg-gradient-to-r from-[#0f2e5c] via-[#16488e] to-[#0d2852] p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/4 -bottom-10 w-44 h-44 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {profile.photoUrl ? (
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-300 shadow-xl shrink-0">
                    <img
                      src={profile.photoUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 border-2 border-white/20 backdrop-blur-xs flex items-center justify-center text-3xl font-black text-amber-300 shadow-xl shrink-0">
                    {fullName.charAt(0)}
                  </div>
                )}

                <div className="space-y-1.5">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">{fullName}</h2>
                  {profile.christianName && (
                    <p className="text-sm font-semibold text-amber-300 flex items-center gap-1">
                      <span>✝️ {isAmharic ? 'የክርስትና ስም፦' : 'Baptismal Name:'}</span>
                      <span className="font-bold text-white">{profile.christianName}</span>
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        studentType === 'distance'
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-emerald-400 text-emerald-950'
                      }`}
                    >
                      {studentType === 'distance'
                        ? (isAmharic ? '🌐 የርቀት ተማሪ' : '🌐 Distance Track')
                        : (isAmharic ? '🏛️ መደበኛ ተማሪ' : '🏛️ Regular Track')}
                    </span>

                    {/* Grade Badge */}
                    <span className="px-3 py-1 rounded-full bg-blue-500/40 border border-blue-400/40 text-xs font-bold text-white backdrop-blur-xs flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isAmharic ? `ክፍል፦ ${gradeDisplay}` : `Class: ${gradeDisplay}`}</span>
                    </span>

                    {/* Batch if Distance */}
                    {studentType === 'distance' && batchDisplay !== '-' && (
                      <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold text-white backdrop-blur-xs">
                        {isAmharic ? `ዙር፦ ${batchDisplay}` : `Batch: ${batchDisplay}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Student ID Highlight Box */}
              <div className="text-left sm:text-right bg-white/10 p-3.5 sm:p-4 rounded-2xl border border-white/20 backdrop-blur-xs shadow-inner shrink-0 self-stretch sm:self-auto">
                <p className="text-[11px] text-blue-200 uppercase tracking-wider font-bold">
                  {isAmharic ? 'የተማሪ መለያ ቁጥር' : 'Student ID'}
                </p>
                <p className="text-xl sm:text-2xl font-mono font-black text-amber-300 mt-0.5 tracking-wider">
                  {studentIdDisplay}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Summary Grid */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-slate-900">
            {/* QR Code Identification */}
            <div className="flex flex-col items-center justify-center bg-blue-50/60 dark:bg-slate-800/50 rounded-2xl p-5 border border-blue-100 dark:border-slate-800">
              <div className="bg-white p-3 rounded-2xl shadow-md border border-blue-100 dark:border-slate-700">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify-certificate?id=${encodeURIComponent(profile.studentId || profile.registrationNumber || profile._id || 'STUDENT')}`}
                  size={150}
                  level="M"
                />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-3 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isAmharic ? 'የተረጋገጠ ዲጂታል QR ባጅ' : 'Verified Digital QR Badge'}</span>
              </p>
            </div>

            {/* Quick Details Table */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'የተማሪ መለያ' : 'Student ID'}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{studentIdDisplay}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'ክፍል / ደረጃ' : 'Class / Grade'}
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{gradeDisplay}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'የማመልከቻ ቁጥር' : 'Application No'}
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{registrationNumber}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'ጾታ' : 'Gender'}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile.gender === 'Male' || profile.gender === 'male'
                    ? (isAmharic ? 'ወንድ' : 'Male')
                    : profile.gender === 'Female' || profile.gender === 'female'
                    ? (isAmharic ? 'ሴት' : 'Female')
                    : profile.gender || '-'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'የትውልድ ቀን' : 'Date of Birth'}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatEthiopianDate(profile.dob)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'አድራሻ' : 'Address'}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {profile.address || profile.subcity || '-'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* 👤 2. PERSONAL INFORMATION */}
      <FadeIn delay={0.1}>
        <Card variant="default" padding="lg">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-[#1657b8] dark:text-blue-400 flex items-center justify-center font-bold">
              👤
            </span>
            <span>{isAmharic ? 'የግል መረጃ' : 'Personal Information'}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'ስም' : 'First Name'}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.firstName || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'የአባት ስም' : 'Middle Name'}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.middleName || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'የአያት ስም' : 'Last Name'}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.lastName || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'የክርስትና ስም' : 'Baptismal Name'}
              </span>
              <span className="font-bold text-[var(--brand-primary)] dark:text-blue-400">{profile.christianName || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'ዕድሜ' : 'Age'}
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{profile.age || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'የትምህርት ደረጃ' : 'Education Level'}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {getEducationLevelLabel(profile.educationLevel, isAmharic) || profile.educationLevel || '-'}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'የሥራ ዘርፍ / ሙያ' : 'Profession / Field'}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {getProfessionLabel(profile.profession, isAmharic) || profile.profession || '-'}
              </span>
            </div>
            {studentType === 'regular' && (
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  {isAmharic ? 'የመማሪያ ፈረቃ' : 'Shift'}
                </span>
                <span className="font-bold text-[#1657b8] dark:text-amber-400">
                  {profile.shift === 'night'
                    ? (isAmharic ? 'የማታ (Night)' : 'Night')
                    : (isAmharic ? 'የቀን / ቅዳሜና እሁድ' : 'Weekend / Day')}
                </span>
              </div>
            )}
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'ስልክ ቁጥር' : 'Phone'}
              </span>
              <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                {profile.studentPhone || profile.contactPhone || profile.phone || authUser?.phone || '-'}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'ኢሜይል' : 'Email'}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {profile.userId?.email || profile.email || authUser?.email || '-'}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'ክፍለ ከተማ' : 'Subcity'}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.subcity || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'ወረዳ' : 'Woreda'}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.woreda || '-'}</span>
            </div>
            <div>
              <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                {isAmharic ? 'ቀበሌ / የቤት ቁጥር' : 'Kebele / House No'}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{profile.kebele || '-'}</span>
            </div>
            {profile.teacher && (
              <div className="sm:col-span-2">
                <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  {isAmharic ? 'ኃላፊ መምህር' : 'Assigned Teacher'}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {profile.teacher?.fullName || profile.teacher?.email || '-'}
                </span>
              </div>
            )}
          </div>
        </Card>
      </FadeIn>

      {/* ✝️ 3. CONFESSION FATHER */}
      <FadeIn delay={0.12}>
        <Card variant="default" padding="lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                ✝️
              </span>
              <span>{isAmharic ? 'የንስሐ አባት መረጃ' : 'Confession Father Information'}</span>
            </h3>
            <Badge variant={profile.hasConfessionFather ? 'approved' : 'rejected'} size="sm">
              {profile.hasConfessionFather
                ? (isAmharic ? '✅ አላቸው' : 'Has Father')
                : (isAmharic ? '❌ የላቸውም' : 'None')}
            </Badge>
          </div>

          {profile.hasConfessionFather ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-blue-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-blue-100 dark:border-slate-800">
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  {isAmharic ? 'የንስሐ አባት ስም' : 'Father’s Name'}
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-base">
                  {profile.confessionFatherName || '-'}
                </span>
              </div>
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  {isAmharic ? 'የንስሐ አባት ስልክ' : 'Father’s Phone'}
                </span>
                <span className="font-bold font-mono text-slate-900 dark:text-white text-base">
                  {profile.confessionFatherPhone || '-'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <span className="text-base">ℹ️</span>
              <p className="leading-relaxed">
                {isAmharic
                  ? 'የንስሐ አባት እስካሁን አልያዙም። የንስሐ አባት እንዲይዙ ሰንበት ትምህርት ቤቱ አስፈላጊውን መንፈሳዊ ድጋፍና መመሪያ ይሰጥዎታል።'
                  : 'You have not registered a confession father yet. The Sunday school provides spiritual guidance to assist you.'}
              </p>
            </div>
          )}
        </Card>
      </FadeIn>

      {/* 📞 4. EMERGENCY CONTACT */}
      <FadeIn delay={0.15}>
        <Card variant="default" padding="lg">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              📞
            </span>
            <span>{isAmharic ? 'የአስቸኳይ ጊዜ ተጠሪ መረጃ' : 'Emergency Contact'}</span>
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            {profile.emergencyContactPhoto && (
              <div className="shrink-0 flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  {isAmharic ? 'የተጠሪ ፎቶ' : 'Contact Photo'}
                </span>
                <img
                  src={profile.emergencyContactPhoto}
                  alt={emergencyName || 'Emergency Contact'}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 shadow-sm"
                />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm flex-1">
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  {isAmharic ? 'ሙሉ ስም' : 'Full Name'}
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{emergencyName || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  {isAmharic ? 'ዝምድና' : 'Relationship'}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{getRelationshipLabel(profile.relationship, isAmharic) || profile.relationship || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  {isAmharic ? 'ስልክ ቁጥር' : 'Phone'}
                </span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200">{emergencyPhone || '-'}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500 dark:text-slate-400 block mb-0.5">
                  {isAmharic ? 'ኢሜይል' : 'Email'}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{emergencyEmail || '-'}</span>
              </div>
            </div>
          </div>
        </Card>
      </FadeIn>

      {/* 📚 4. ENROLLED COURSES */}
      <FadeIn delay={0.2}>
        <Card variant="default" padding="lg">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              📚
            </span>
            <span>{isAmharic ? 'የተመዘገቡባቸው ትምህርቶች' : 'Enrolled Courses'}</span>
          </h3>
          {courses.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
              {isAmharic ? 'እስካሁን የተመዘገቡበት ትምህርት የለም።' : 'No courses currently enrolled.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{course.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {course.grade && <span>{isAmharic ? formatGradeAmharic(course.grade) : course.grade}</span>}
                      {course.schedule && <span> • {course.schedule}</span>}
                      {course.teacher?.fullName && <span> • መምህር፦ {course.teacher.fullName}</span>}
                    </p>
                  </div>
                  <Badge variant="active" size="sm">
                    {isAmharic ? 'ንቁ' : 'Active'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </FadeIn>

      {/* 📅 5. ATTENDANCE LOGS */}
      <FadeIn delay={0.25}>
        <Card variant="default" padding="lg">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              📅
            </span>
            <span>{isAmharic ? 'የዕለታዊ ክትትል ታሪክ' : 'Attendance History'}</span>
          </h3>
          {attendance.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl">
              {isAmharic ? 'ምንም የዕለታዊ ክትትል መረጃ አልተገኘም።' : 'No attendance logs recorded yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-xs uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                    <th className="py-2.5 px-3 font-bold">{isAmharic ? 'ቀን' : 'Date'}</th>
                    <th className="py-2.5 px-3 font-bold">{isAmharic ? 'ትምህርት' : 'Course'}</th>
                    <th className="py-2.5 px-3 font-bold">{isAmharic ? 'ሁኔታ' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendance.slice(0, 10).map((record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                    >
                      <td className="py-2.5 px-3 font-medium">{formatEthiopianDate(record.date)}</td>
                      <td className="py-2.5 px-3">{record.courseName || record.course?.name || (isAmharic ? 'አጠቃላይ' : 'General')}</td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant={
                            record.status === 'Present' || record.status === 'present'
                              ? 'success'
                              : record.status === 'Late' || record.status === 'late'
                              ? 'warning'
                              : 'destructive'
                          }
                          size="sm"
                        >
                          {record.status === 'Present' || record.status === 'present'
                            ? (isAmharic ? 'ተገኝቷል' : 'Present')
                            : record.status === 'Late' || record.status === 'late'
                            ? (isAmharic ? 'አርፍዷል' : 'Late')
                            : (isAmharic ? 'አልተገኘም' : 'Absent')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </FadeIn>

      {/* ✈️ 6. TELEGRAM PRIVATE ACCOUNT INTEGRATION */}
      <FadeIn delay={0.3}>
        <Card variant="default" padding="lg" className="border border-sky-500/20 dark:border-sky-500/30 overflow-hidden relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                <Send className="w-5 h-5 transform -rotate-12 translate-x-0.5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{isAmharic ? 'የቴሌግራም አካውንት ግንኙነት' : 'Telegram Account Integration'}</span>
                  {profile.telegramChatId || authUser?.telegramChatId ? (
                    <Badge variant="success" size="sm" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isAmharic ? 'ተገናኝቷል' : 'Connected'}</span>
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      {isAmharic ? 'አልተገናኘም' : 'Not Linked'}
                    </Badge>
                  )}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isAmharic
                    ? 'የግል የፈተና ውጤቶች፣ የዕለታዊ ክትትል፣ የምረቃ ሰርተፊኬትና ማስታወቂያዎች በግል የቴሌግራም ቦት'
                    : 'Personal exam grades, attendance logs, graduation certificate & announcements via private bot'}
                </p>
              </div>
            </div>

            {/* Quick Status Pill */}
            {botStatus?.botUsername && (
              <span className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800/60 flex items-center gap-1.5">
                <span>@{botStatus.botUsername}</span>
              </span>
            )}
          </div>

          <div className="pt-4">
            {profile.telegramChatId || authUser?.telegramChatId ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>{isAmharic ? 'የቴሌግራም አካውንትዎ በተሳካ ሁኔታ ተገናኝቷል' : 'Your Telegram Account is Active & Verified'}</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      {isAmharic
                        ? 'የእርስዎን መረጃዎች በቴሌግራም ቦት በግል (Direct Message) በማንኛውም ሰዓት መመልከት ይችላሉ።'
                        : 'You can securely access your student records in private DM at any time.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href={botStatus?.botUsername ? `https://t.me/${botStatus.botUsername}?start=profile` : 'https://t.me'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isAmharic ? 'ቦቱን በግል ክፈት' : 'Open in Telegram'}</span>
                      <ExternalLink className="w-3 h-3 opacity-75" />
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{isAmharic ? 'ቴሌግራምን እንዴት ማገናኘት ይቻላል?' : 'How to Link Your Telegram:'}</span>
                  </div>
                  <ol className="space-y-1.5 text-slate-700 dark:text-slate-300 list-decimal list-inside">
                    <li>{isAmharic ? 'ከታች ያለውን "በቴሌግራም ቦት ያገናኙ" አዝራር ይጫኑ።' : 'Tap the "Connect via Telegram Bot" button below.'}</li>
                    <li>{isAmharic ? 'በቦቱ ውይይት ውስጥ "📱 ስልክ ቁጥር ያገናኙ" የሚለውን በመጫን ስልክዎን ያጋሩ።' : 'Inside the bot chat, tap the "📱 Link Phone" button.'}</li>
                  </ol>
                </div>

                <div className="flex justify-end pt-1">
                  <a
                    href={botStatus?.botUsername ? `https://t.me/${botStatus.botUsername}?start=link` : 'https://t.me'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isAmharic ? 'በቴሌግራም ቦት ያገናኙ (Connect to Bot)' : 'Connect via Telegram Bot'}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </Card>
      </FadeIn>

      {/* 🔐 7. ACCOUNT SECURITY */}
      <FadeIn delay={0.35}>
        <Card variant="default" padding="lg" className="border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/40">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isAmharic ? 'የመለያ ደህንነትና የይለፍ ቃል' : 'Account Security & Password'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'የመግቢያ የይለፍ ቃልዎን በማንኛውም ጊዜ ማደስና መቀየር ይችላሉ' : 'You can update and change your login password at any time'}
                </p>
              </div>
            </div>
            <a
              href="/change-password"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-amber-400 dark:hover:bg-amber-300 text-white dark:text-slate-950 font-bold text-xs transition-all shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isAmharic ? 'የይለፍ ቃል ቀይር (Change Password)' : 'Change Password'}</span>
            </a>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
};

export default StudentProfile;