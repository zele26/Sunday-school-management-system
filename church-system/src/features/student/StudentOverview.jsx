'use client';

// src/features/student/StudentOverview.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarCheck,
  Award,
  ArrowRight,
  Sparkles,
  Bell,
  CheckCircle2,
  GraduationCap,
  QrCode,
  X,
  FileCheck,
  User,
  Clock,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiFetch } from '../../api/apiClient';
import useAuthStore from '../../store/authStore';
import VerifiableCertificate from '../../components/VerifiableCertificate';
import { FadeIn, MotionCard } from '../../components/motion';
import { useLanguage } from '../../hooks/useLanguage';
import { formatEthiopianDate } from '../../utils/ethiopianDate';
import { formatGradeAmharic } from '../../constants/registrationOptions';

const StudentOverview = () => {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const { t, isAmharic } = useLanguage();

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeCertModal, setActiveCertModal] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        const [
          profileRes,
          coursesRes,
          distCoursesRes,
          attRes,
          resultsRes,
          certRes,
          annRes,
        ] = await Promise.allSettled([
          apiFetch('/api/student/profile'),
          apiFetch('/api/student/courses'),
          apiFetch('/api/education/distance/my-courses'),
          apiFetch('/api/student/my-attendance'),
          apiFetch('/api/student/exam-results'),
          apiFetch('/api/education/distance/certificates/my-certificates'),
          apiFetch('/api/announcements?limit=4'),
        ]);

        if (!isMounted) return;

        // 1. Profile
        if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          const profileData = await profileRes.value.json();
          setProfile(profileData.student || profileData);
        }

        // 2. Courses (Combine regular & distance if available)
        let loadedCourses = [];
        if (coursesRes.status === 'fulfilled' && coursesRes.value.ok) {
          const cData = await coursesRes.value.json();
          if (Array.isArray(cData)) loadedCourses = cData;
        }
        if (distCoursesRes.status === 'fulfilled' && distCoursesRes.value.ok) {
          const dData = await distCoursesRes.value.json();
          const dCourses = dData.courses || (Array.isArray(dData) ? dData : []);
          if (dCourses.length > 0 && loadedCourses.length === 0) {
            loadedCourses = dCourses;
          }
        }
        setCourses(loadedCourses);

        // 3. Attendance Logs
        if (attRes.status === 'fulfilled' && attRes.value.ok) {
          const attData = await attRes.value.json();
          if (Array.isArray(attData)) setAttendanceRecords(attData);
        }

        // 4. Exam Results
        if (resultsRes.status === 'fulfilled' && resultsRes.value.ok) {
          const resData = await resultsRes.value.json();
          if (Array.isArray(resData)) setExamResults(resData);
        }

        // 5. Certificates
        if (certRes.status === 'fulfilled' && certRes.value.ok) {
          const certData = await certRes.value.json();
          if (certData?.certificates && Array.isArray(certData.certificates)) {
            setCertificates(certData.certificates);
          }
        }

        // 6. Announcements
        if (annRes.status === 'fulfilled' && annRes.value.ok) {
          const annData = await annRes.value.json();
          if (Array.isArray(annData)) setAnnouncements(annData);
        }
      } catch (err) {
        console.warn('Student Overview data loading error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Identity extraction
  const studentFullName = profile?.fullName || authUser?.fullName || (isAmharic ? 'ተማሪ' : 'Student');
  const studentInitials = studentFullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('') || 'ተ';

  const isDistance = profile?.studentType === 'distance' || profile?.studentId?.startsWith('TKD');
  const studentId = profile?.studentId || authUser?.studentId || '';
  const rawGradeOrBatch = profile?.grade || profile?.batch || '';
  const gradeOrBatch = rawGradeOrBatch ? (isAmharic ? formatGradeAmharic(rawGradeOrBatch) : rawGradeOrBatch) : '';

  // Real Metrics Calculations
  const enrolledCount = courses.length;

  const totalSessions = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) =>
    ['Present', 'present', 'Late', 'late'].includes(a.status)
  ).length;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : null;

  const totalExams = examResults.length;
  const avgExamScore =
    totalExams > 0
      ? Math.round(
          examResults.reduce(
            (acc, curr) => acc + (curr.score || curr.percentage || curr.totalScore || 0),
            0
          ) / totalExams
        )
      : null;

  const certCount = certificates.length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 🌟 1. STUDENT IDENTITY BANNER */}
      <FadeIn direction="down" duration={0.3}>
        <div className="p-5 sm:p-7 rounded-3xl text-white shadow-xl relative overflow-hidden bg-gradient-to-r from-[#0f2e5c] via-[#16488e] to-[#0d2852] border border-blue-800/50">
          {/* Subtle Accent Glows */}
          <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -top-10 w-44 h-44 bg-blue-400/15 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            {/* Student Info */}
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-lg sm:text-xl shadow-md border-2 border-amber-300 shrink-0">
                {studentInitials}
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  {isAmharic ? `ሰላም፣ ${studentFullName}! 👋` : `Welcome, ${studentFullName}! 👋`}
                </h2>

                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  {/* Track / Mode */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/15 text-white border border-white/20 text-xs font-semibold backdrop-blur-xs">
                    <span>{isDistance ? '🌐' : '🏛️'}</span>
                    <span>{isDistance ? (isAmharic ? 'የርቀት ትምህርት' : 'Distance Track') : (isAmharic ? 'መደበኛ ትምህርት' : 'Regular Track')}</span>
                  </span>

                  {/* Grade / Class if available */}
                  {gradeOrBatch && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-300/30 text-xs font-bold">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-300" />
                      <span>{isAmharic ? `ክፍል፦ ${gradeOrBatch}` : `Class: ${gradeOrBatch}`}</span>
                    </span>
                  )}

                  {/* Student ID */}
                  {studentId && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-300/40 text-xs font-mono font-bold">
                      <span className="opacity-75 font-sans font-normal">{isAmharic ? 'መለያ፦' : 'ID:'}</span>
                      <span>{studentId}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Digital ID and Telegram Bot Buttons */}
            <div className="shrink-0 w-full md:w-auto flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <QrCode className="w-4 h-4" />
                <span>{isAmharic ? 'የተማሪ ዲጂታል መታወቂያ' : 'Digital ID Pass'}</span>
              </button>

              <a
                href="https://t.me/TekleSawirosSundaySchoolBot"
                target="_blank"
                rel="noreferrer"
                className="flex-1 md:flex-initial px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 backdrop-blur-xs"
              >
                <span className="text-blue-300">✈️</span>
                <span>{isAmharic ? 'የቴሌግራም ቦት' : 'Telegram Bot'}</span>
              </a>
            </div>
          </div>
        </div>
      </FadeIn>

      {/* 🌟 2. CONCISE METRICS OVERVIEW (100% REAL DATA) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Enrolled Courses */}
        <MotionCard className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAmharic ? 'የተመዘገቡ ትምህርቶች' : 'Enrolled Courses'}
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-400 flex items-center justify-center shadow-2xs">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {enrolledCount}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {enrolledCount > 0
                ? (isAmharic ? 'ንቁ ኮርሶች' : 'Active courses')
                : (isAmharic ? 'ትምህርት አልተመዘገበም' : 'No active courses')}
            </p>
          </div>
        </MotionCard>

        {/* Metric 2: Real Attendance Rate */}
        <MotionCard className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAmharic ? 'የተገኝነት ምጣኔ' : 'Attendance Rate'}
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-2xs">
              <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {attendanceRate !== null ? (
              <>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {attendanceRate}%
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    {attendanceRate >= 80 ? (isAmharic ? 'በጣም ጥሩ' : 'Good') : (isAmharic ? 'መካከለኛ' : 'Fair')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isAmharic
                    ? `ከ${totalSessions} ክፍለ-ጊዜዎች ${presentCount}ቱ ተገኝተዋል`
                    : `${presentCount} of ${totalSessions} sessions attended`}
                </p>
              </>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black text-slate-400">—</span>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isAmharic ? 'የመገኘት መዝገብ የለም' : 'No records yet'}
                </p>
              </>
            )}
          </div>
        </MotionCard>

        {/* Metric 3: Real Exam Results */}
        <MotionCard className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAmharic ? 'የፈተና ውጤት' : 'Exam Assessment'}
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            {avgExamScore !== null ? (
              <>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  {avgExamScore}%
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  {isAmharic ? `የ${totalExams} ፈተናዎች አማካይ` : `Avg of ${totalExams} exams`}
                </p>
              </>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl font-black text-slate-400">—</span>
                <p className="text-[11px] text-slate-400 font-medium">
                  {isAmharic ? 'የፈተና መዝገብ የለም' : 'No exam records yet'}
                </p>
              </>
            )}
          </div>
        </MotionCard>

        {/* Metric 4: Issued Certificates */}
        <MotionCard className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAmharic ? 'ምስክር ወረቀት' : 'Certificates'}
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
              <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {certCount}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {certCount > 0
                ? (isAmharic ? 'የተሰጡ ምስክር ወረቀቶች' : 'Issued certificates')
                : (isAmharic ? 'እስካሁን አልተሰጠም' : 'None issued yet')}
            </p>
          </div>
        </MotionCard>
      </section>

      {/* 🌟 3. EARNED CERTIFICATE BANNER (Rendered Only When Certificate Exists) */}
      {certificates.length > 0 && (
        <FadeIn delay={0.1}>
          <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-400/50 dark:border-amber-500/30 p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl shadow-xs font-black shrink-0">
                📜
              </span>
              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {isAmharic ? 'ይፋዊ የምስክር ወረቀት ተዘጋጅቷል!' : 'Official Certificate Issued!'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {certificates[0]?.title || (isAmharic ? 'የትምህርት መርሃ ግብሩን በስኬት ስላጠናቀቁ የምስክር ወረቀት ተሰጥቷል።' : 'You have earned an official completion certificate.')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveCertModal(certificates[0])}
              className="px-4 py-2 bg-[#1e3a8a] hover:bg-[#163177] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isAmharic ? 'የምስክር ወረቀቱን ይመልከቱ / አትሙ' : 'View & Print Certificate'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </FadeIn>
      )}

      {/* 🌟 4. MAIN WORKSPACE (2-COLUMN CONCISE LAYOUT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Enrolled Courses */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#1e3a8a] dark:text-blue-400" />
                <span>{isAmharic ? 'የትምህርቶች ዝርዝር' : 'My Courses'}</span>
              </h3>
              <Link
                to="/dashboard/courses"
                className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{isAmharic ? 'ሁሉንም እይ' : 'View All'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.slice(0, 4).map((course, idx) => (
                  <div
                    key={course._id || course.id || idx}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-blue-400/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {course.code && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-[#1e3a8a] dark:text-blue-300 font-mono text-[11px] font-bold">
                            {course.code}
                          </span>
                        )}
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {course.name || course.title || (isAmharic ? 'ኮርስ' : 'Course')}
                        </h4>
                      </div>
                      {course.teacher?.fullName && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isAmharic ? 'መምህር፦' : 'Teacher:'} {course.teacher.fullName}
                        </p>
                      )}
                    </div>

                    <Link
                      to="/dashboard/courses"
                      className="px-3.5 py-1.5 rounded-lg bg-[#1e3a8a] hover:bg-[#163177] text-white text-xs font-bold transition-all shadow-2xs self-start sm:self-auto shrink-0 flex items-center gap-1"
                    >
                      <span>{isAmharic ? 'ክፈት' : 'Open'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {isAmharic ? 'እስካሁን የተመዘገቡባቸው ኮርሶች የሉም' : 'No courses enrolled yet'}
                </p>
                <Link
                  to="/dashboard/courses"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline"
                >
                  <span>{isAmharic ? 'ኮርሶችን ይመልከቱ' : 'Explore Courses'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Real Announcements */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{isAmharic ? 'የቅርብ ጊዜ ማስታወቂያዎች' : 'Recent Announcements'}</span>
              </h3>
              <Link
                to="/dashboard/announcements"
                className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>{isAmharic ? 'ሁሉንም እይ' : 'All'}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.slice(0, 3).map((notice, idx) => (
                  <div
                    key={notice._id || idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-800 dark:text-amber-300">
                        {notice.targetType === 'all' ? (isAmharic ? 'አጠቃላይ' : 'General') : (isAmharic ? 'ማስታወቂያ' : 'Notice')}
                      </span>
                      {notice.createdAt && (
                        <span className="text-[11px] text-slate-400">
                          {formatEthiopianDate(notice.createdAt, 'short')}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                      {notice.title}
                    </h4>
                    {notice.message && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {notice.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAmharic ? 'ምንም አዲስ ማስታወቂያ የለም' : 'No active announcements'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🌟 5. VERIFIABLE CERTIFICATE MODAL */}
      {activeCertModal && (
        <VerifiableCertificate
          certificate={activeCertModal}
          onClose={() => setActiveCertModal(null)}
        />
      )}

      {/* 🌟 6. DIGITAL STUDENT ID & QR CODE MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center relative space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Church Header in Modal */}
            <div className="space-y-1">
              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">
                {t('sundaySchoolShortTitle', 'ተክለ ሳዊሮስ')} {t('sundaySchoolLabel', 'ሰንበት ት/ቤት')}
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {isAmharic ? 'የተማሪ ዲጂታል መታወቂያ' : 'Student Digital ID'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAmharic ? 'ለመገኘትና ለመግቢያ መቃኛ ይህን መታወቂያ ያሳዩ' : 'Present this QR for attendance verification'}
              </p>
            </div>

            {/* QR Code Frame */}
            <div className="bg-white p-4 rounded-2xl shadow-inner border-2 border-dashed border-amber-300 dark:border-amber-500/40 inline-block mx-auto">
              <QRCodeSVG
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify-certificate?id=${encodeURIComponent(studentId || profile?.studentId || profile?.registrationNumber || profile?._id || authUser?.id || 'STUDENT')}`}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>

            {/* Student Details in Modal */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1 text-center">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{studentFullName}</p>
              {studentId && (
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-[#1e3a8a] dark:text-blue-400">
                  <span>{isAmharic ? 'መለያ፦' : 'ID:'}</span>
                  <span>{studentId}</span>
                </div>
              )}
              {gradeOrBatch && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{gradeOrBatch}</p>
              )}
            </div>

            <div className="flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowQrModal(false);
                  navigate('/dashboard/profile');
                }}
                className="text-xs font-bold text-[#1e3a8a] dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>{isAmharic ? 'ሙሉ የግል ማህደር እይ' : 'View Full Profile'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentOverview;