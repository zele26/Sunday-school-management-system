'use client';

// src/features/student/StudentOverview.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  AlertCircle,
  Award,
  Clock,
  ArrowRight,
  Sparkles,
  Download,
  Bell,
  FileText,
  Volume2,
  CheckCircle2,
  GraduationCap,
  ExternalLink,
  QrCode,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '../../api/apiClient';
import useAuthStore from '../../store/authStore';
import VerifiableCertificate from '../../components/VerifiableCertificate';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard } from '../../components/motion';

const StudentOverview = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [distanceCourses, setDistanceCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeCertModal, setActiveCertModal] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [examResults, setExamResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearance, setClearance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, coursesRes, resultsRes, distRes, certRes] = await Promise.all([
          apiFetch('/api/student/profile'),
          apiFetch('/api/student/courses'),
          apiFetch('/api/student/results'),
          apiFetch('/api/education/distance/my-courses'),
          apiFetch('/api/education/distance/certificates/my-certificates'),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.student || profileData);
        }
        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(Array.isArray(coursesData) ? coursesData : []);
        }
        if (resultsRes.ok) {
          const resultsData = await resultsRes.json();
          setExamResults(Array.isArray(resultsData) ? resultsData : []);
        }
        if (distRes.ok) {
          const distData = await distRes.json();
          setDistanceCourses(distData.courses || []);
        }
        if (certRes.ok) {
          const certData = await certRes.json();
          setCertificates(certData.certificates || []);
          if (certData.clearance) {
            setClearance(certData.clearance);
          }
        }
      } catch (err) {
        console.warn('Overview fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const studentFullName = profile?.fullName || authUser?.fullName || 'ተማሪ';
  const studentInitials = studentFullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('') || 'ተ';

  const isDistance = profile?.studentType === 'distance' || profile?.studentId?.startsWith('TKD');
  const studentId = profile?.studentId || authUser?.studentId || 'TKR-2017-0001';
  const gradeOrBatch = profile?.grade || profile?.batch || (isDistance ? 'ዙር 1' : '10ኛ ክፍል');
  const trackLabel = isDistance ? `${gradeOrBatch} • የርቀት ትምህርት` : `${gradeOrBatch} • መደበኛ ትምህርት`;
  const academicTerm = '2017 ዓ.ም (1ኛ መንፈቀ ዓመት)';

  const enrolledCount = isDistance ? distanceCourses.length : courses.length;
  const pendingHomeworkCount = 2; // Active pending tasks count
  const attendancePercentage = 92; // Dynamic percentage

  return (
    <div className="space-y-6">
      {/* 🌟 1. UNIFIED STUDENT PROFILE HEADER (Consolidated Single Banner) */}
      <FadeIn direction="down" duration={0.4}>
        <div className="p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden bg-gradient-to-r from-blue-950 via-[#1e3a8a] to-indigo-950 border border-blue-800/60">
          {/* Ambient Background Decorative Glows */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -top-12 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Student Avatar + Greetings + High-Contrast Badges */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xl sm:text-2xl shadow-md border-2 border-amber-300 shrink-0">
                {studentInitials}
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  ሰላም፣ {studentFullName}! 👋
                </h2>

                {/* High-Contrast Identity Badges Row */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {/* Academic Track & Grade */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white border border-white/25 text-xs font-semibold shadow-2xs backdrop-blur-xs">
                    <span>{isDistance ? '🌐' : '🏛️'}</span>
                    <span>{trackLabel}</span>
                  </span>

                  {/* Student ID & QR Trigger */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40 text-xs font-mono font-bold shadow-2xs">
                    <span className="opacity-75 font-sans font-medium">መለያ፦</span>
                    <span>{studentId}</span>
                  </span>

                  {/* QR Code Quick View Trigger */}
                  <button
                    type="button"
                    onClick={() => setShowQrModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 active:scale-95 text-xs font-bold shadow-xs transition-all cursor-pointer"
                    title="የመታወቂያ QR ኮድ አሳይ"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>የመታወቂያ QR</span>
                  </button>

                  {/* Academic Term */}
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-blue-100 border border-white/15 text-xs font-medium">
                    {academicTerm}
                  </span>
                </div>

                {/* Next Class Schedule Subtext */}
                <p className="text-blue-100 text-xs sm:text-sm font-medium flex items-center gap-1.5 pt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>የቀጣይ ክፍለ-ጊዜ፦ <strong>እሁድ ከጠዋቱ 03:00 • የነገረ መለኮት ትምህርት</strong></span>
                </p>
              </div>
            </div>

            {/* Quick Actions (QR Modal or Distance Course Launch) */}
            <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="w-full md:w-auto px-4 py-3 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-xs"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>የተማሪ ዲጂታል መታወቂያ (QR)</span>
              </button>

              {isDistance && distanceCourses.length > 0 && (
                <Link
                  to={`/student/distance-classroom/${distanceCourses[0]._id}`}
                  className="w-full md:w-auto px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>ትምህርቱን ቀጥል</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 🌟 2. ACTIONABLE ACADEMIC KPI CARDS (4 Dynamic Metrics) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Attendance Rate */}
        <MotionCard className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">የተገኝነት መጠን</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{attendancePercentage}%</span>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">በጣም ጥሩ</span>
            </div>
            {/* Mini Progress Bar */}
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${attendancePercentage}%` }} />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">ከ24 ክፍለ-ጊዜዎች 22ቱ ተገኝተዋል</p>
          </div>
        </MotionCard>

        {/* Card 2: Enrolled Courses (with proactive zero-state handler) */}
        <MotionCard className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">የተመዘገቡ ትምህርቶች</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-400 flex items-center justify-center shadow-2xs">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            {enrolledCount > 0 ? (
              <div className="space-y-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">{enrolledCount}</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">ንቁ የትምህርት ክፍሎች</p>
              </div>
            ) : (
              <div className="space-y-1 pt-1">
                <span className="text-xs font-bold text-slate-400">ትምህርት አልተመረጠም</span>
                <Link to="/dashboard/courses" className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline flex items-center gap-1">
                  <span>ትምህርቶችን ይመዝገቡ</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </MotionCard>

        {/* Card 3: Pending Homework / Tasks */}
        <MotionCard className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">ያልተጠናቀቁ የቤት ሥራዎች</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            {pendingHomeworkCount > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">{pendingHomeworkCount}</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">የሚቀርብበት ቀን፦ እሁድ</p>
              </div>
            ) : (
              <div className="space-y-1 pt-1">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>ምንም የቤት ሥራ የለም</span>
                </span>
                <p className="text-[11px] text-slate-400">ሁሉንም አጠናቀዋል ✨</p>
              </div>
            )}
          </div>
        </MotionCard>

        {/* Card 4: Academic Standing / Average */}
        <MotionCard className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">የትምህርት አቋም</span>
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">88.5%</span>
              <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">ደረጃ፦ ጥሩ</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">የመጨረሻ ፈተና ውጤት</p>
          </div>
        </MotionCard>
      </section>

      {/* Earned Certificate Notification (If any) */}
      {certificates.length > 0 && (
        <FadeIn delay={0.1}>
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-400/40 dark:border-amber-500/30 p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shadow-xs font-black">
                📜
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  የተመረቁበት ይፋዊ የምስክር ወረቀት ተዘጋጅቷል!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  የ{certificates[0].batch || 'ኮርሱን'} የትምህርት መርሃ ግብር በስኬት ስላጠናቀቁ የምስክር ወረቀት ተሰጥቷል።
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveCertModal(certificates[0])}
              className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#163177] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>የምስክር ወረቀቱን ይመልከቱ / አትሙ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </FadeIn>
      )}

      {/* 🌟 3. MAIN DASHBOARD WORKSPACE (2-Column Responsive Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Pane (Upcoming Schedule & Active Tasks) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Next Sunday Schedule */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#1e3a8a] dark:text-blue-400" />
                <span>የቀጣይ ክፍለ-ጊዜ ፕሮግራም</span>
              </h3>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800/60">
                እሁድ • ጥቅምት 12
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    የነገረ መለኮት ትምህርት (Systematic Theology)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    መምህር፦ መጋቤ ሐዲስ ተስፋዬ አለሙ
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1e3a8a] dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5" />
                  <span>03:00 - 04:30</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700">
                <span>ክፍል፦ <strong>ክፍል 104</strong> (ደረጃ 2)</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>የክፍል ማስታወሻ አውርድ (PDF)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card: Pending Tasks & Homework */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>ያልተጠናቀቁ ተግባራት (Tasks & Homework)</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">2 የሚጠበቁ</span>
            </div>

            <div className="space-y-3">
              {/* Task 1 */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#1e3a8a]/40 dark:hover:border-blue-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      የቤት ሥራ
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      የሐዲስ ኪዳን ጥናት ምዕራፍ ፫ ጥያቄዎች
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    የሚቀርብበት ቀን፦ እሁድ ጥቅምት 12 • <span className="text-amber-600 dark:text-amber-400 font-semibold">የቀሩት 2 ቀናት</span>
                  </p>
                </div>

                <Link
                  to="/dashboard/courses"
                  className="px-3.5 py-1.5 rounded-lg bg-[#1e3a8a] hover:bg-[#163177] text-white text-xs font-bold transition-all shadow-2xs shrink-0 flex items-center gap-1"
                >
                  <span>ሥራ አስገባ</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Task 2 */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-[#1e3a8a]/40 dark:hover:border-blue-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                      ጽሑፍ
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      የቤተክርስቲያን ታሪክ አጭር ማጠቃለያ
                    </h4>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    የሚቀርብበት ቀን፦ እሁድ ጥቅምት 19 • <span className="text-slate-500">የቀሩት 9 ቀናት</span>
                  </p>
                </div>

                <Link
                  to="/dashboard/courses"
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shrink-0 flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                >
                  <span>ዝርዝር</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane (Notice Board & Quick Resources) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Announcements / Notice Board */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>የቅርብ ጊዜ ማስታወቂያዎች</span>
              </h3>
              <Link
                to="/dashboard/announcements"
                className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline"
              >
                ሁሉንም እይ →
              </Link>
            </div>

            <div className="space-y-3">
              {/* Notice 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                    አዲስ
                  </span>
                  <span className="text-[11px] text-slate-400">ትላንት</span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  የ2017 ዓ.ም የመንፈቀ ዓመት የፈተና መርሐ ግብር ይፋ ሆኗል
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  የመጀመሪያ መንፈቀ ዓመት ማጠቃለያ ፈተና ከኅዳር 15 ጀምሮ ስለሚሰጥ ተማሪዎች አስቀድማችሁ እንድትዘጋጁ እናሳስባለን።
                </p>
              </div>

              {/* Notice 2 */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    ዝማሬና አገልግሎት
                  </span>
                  <span className="text-[11px] text-slate-400">ከ3 ቀናት በፊት</span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  የመዘምራን ልዩ ልምምድ ቅዳሜ ከሰዓት 8:00 ይካሄዳል
                </h4>
              </div>
            </div>
          </div>

          {/* Card: Quick Resources & Downloads */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3.5">
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>ፈጣን መርጃዎች (Resources)</span>
            </h3>

            <div className="space-y-2">
              <a
                href="#pdf-download"
                onClick={(e) => { e.preventDefault(); alert('የዕለቱ የትምህርት ማጠቃለያ ሰነድ በማውረድ ላይ...'); }}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#1e3a8a] dark:hover:text-blue-300 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300">
                    <FileText className="w-4 h-4" />
                  </span>
                  <span>የዕለቱ የትምህርት ማጠቃለያ (PDF)</span>
                </div>
                <Download className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-y-0.5 transition-transform" />
              </a>

              <a
                href="#audio-files"
                onClick={(e) => { e.preventDefault(); alert('የሥርዓተ ዜማ ድምፅ ፋይሎች ማጫወቻ...'); }}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-300 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                    <Volume2 className="w-4 h-4" />
                  </span>
                  <span>የሥርዓተ ዜማና ቅዳሴ ድምፅ ፋይሎች</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>

              <Link
                to="/dashboard/resources"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <span>ዓመታዊ የትምህርት ካላንደርና መመሪያ</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Verifiable Certificate Modal */}
      {activeCertModal && (
        <VerifiableCertificate
          certificate={activeCertModal}
          onClose={() => setActiveCertModal(null)}
        />
      )}

      {/* 📱 Digital Student ID & QR Code Attendance Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Church Header in Modal */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                የተማሪ ዲጂታል መታወቂያ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ለእሁድ የመግቢያና የተገኝነት ምዝገባ ስካነሩ ጋር ያሳዩ
              </p>
            </div>

            {/* QR Code Frame */}
            <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-dashed border-amber-300 dark:border-amber-500/40 inline-block mx-auto">
              <QRCodeSVG
                value={profile?.qrCode || studentId || 'TKR-2017-0001'}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Student Details in Modal */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1 text-center">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{studentFullName}</p>
              <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#1e3a8a] dark:text-blue-400">
                <span>መለያ፦</span>
                <span>{studentId}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{trackLabel}</p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  navigate('/dashboard/profile');
                }}
                className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline cursor-pointer"
              >
                ሙሉ የተማሪ ፕሮፋይል እይ →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOverview;