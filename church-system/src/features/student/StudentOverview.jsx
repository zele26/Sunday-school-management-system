'use client';

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Award, User, CheckCircle2, ArrowRight } from 'lucide-react';
import { apiFetch } from '../../api/apiClient';
import VerifiableCertificate from '../../components/VerifiableCertificate';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard } from '../../components/motion';
import { Card, CourseCard, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import StatCard from '../../components/shared/StatCard';
import { Badge } from '../../components/ui/Badge';

const StudentOverview = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [distanceCourses, setDistanceCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [activeCertModal, setActiveCertModal] = useState(null);
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

  const isDistance = profile?.studentType === 'distance' || profile?.studentId?.startsWith('TKD');
  const batchOrGrade = profile?.batch || profile?.grade || 'ዙር 1';

  const metricsCards = [
    {
      label: 'የተመዘገቡ ትምህርቶች',
      value: distanceCourses.length || courses.length,
      icon: BookOpen,
      variant: 'default',
      badge: 'የዚህ መንፈቅ',
    },
    {
      label: 'የተወሰዱ ፈተናዎች',
      value: examResults.length,
      icon: GraduationCap,
      variant: 'default',
      badge: 'የተጠናቀቁ',
    },
    {
      label: 'የትምህርት ደረጃ',
      value: batchOrGrade,
      icon: Award,
      variant: 'gold',
      badge: 'ወቅታዊ ደረጃ',
    },
    {
      label: 'የተማሪ መለያ',
      value: profile?.studentId || 'TKD-STU',
      icon: User,
      variant: 'default',
      badge: 'ተረጋግጧል',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Profile & Batch Header Card */}
      <FadeIn direction="down" duration={0.4}>
        <div className="p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden bg-gradient-to-r from-[#1657b8] via-[#124796] to-[#0d3269]">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isDistance
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  {isDistance ? '🌐 የርቀት ትምህርት' : '🏛️ መደበኛ ትምህርት'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">
                  {batchOrGrade}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                እንኳን ደህና መጡ፣ {profile?.firstName || 'ተማሪ'}!
              </h2>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                በራስዎ ምቹ ሰዓት የነገረ መለኮት፣ የብሉይና የሐዲስ ኪዳን ጥናቶችን፣ የቪዲዮ ትምህርቶችንና ፈተናዎችን በቅደም ተከተል ይከታተሉ።
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
              {distanceCourses.length > 0 && (
                <Link
                  to={`/student/distance-classroom/${distanceCourses[0]._id}`}
                  className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-center text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>🚀</span>
                  <span>ትምህርቱን ቀጥል</span>
                </Link>
              )}
            </div>
          </div>

          <div className="absolute right-0 top-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </FadeIn>

      {/* Earned Certificates Banner (If any) */}
      {certificates.length > 0 ? (
        <FadeIn delay={0.1}>
          <Card variant="gold" padding="md" className="flex items-center justify-between gap-4 flex-wrap shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-xs font-black">
                📜
              </span>
              <div>
                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                  የተመረቁበት ይፋዊ የምስክር ወረቀት
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  የ{certificates[0].batch} የትምህርት መርሃ ግብርን በስኬት ስላጠናቀቁ የምስክር ወረቀት ተሰጥቷል።
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveCertModal(certificates[0])}
              className="px-5 py-2.5 bg-[#1657b8] hover:bg-[#124796] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>👁️</span>
              <span>የምስክር ወረቀቱን ይመልከቱ / አትሙ</span>
            </button>
          </Card>
        </FadeIn>
      ) : isDistance && clearance ? (
        <FadeIn delay={0.1}>
          <Card variant="default" padding="md" className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xl">
                  🔒
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                    የምስክር ወረቀት ማጠናቀቂያ ሂደት
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ይፋዊ የሰንበት ት/ቤት ዲፕሎማ የሚሰጠው ሁሉንም {clearance.totalRequired} ኮርሶች 100% ሲያጠናቅቁ ነው።
                  </p>
                </div>
              </div>

              <Badge variant="gold" size="sm">
                {clearance.completedCount} / {clearance.totalRequired} ኮርሶች ተጠናቀዋል ({clearance.overallBatchProgressPct}%)
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(clearance.overallBatchProgressPct, 3)}%` }}
              ></div>
            </div>

            {clearance.incompleteCourses?.length > 0 && (
              <p className="text-[11px] text-slate-400 font-medium">
                ⏳ የቀሩዎት ቀጣይ ኮርሶች፡ {clearance.incompleteCourses.slice(0, 3).map(c => c.nameAmharic || c.name).join('፣ ')}
                {clearance.incompleteCourses.length > 3 ? ` እና ሌሎች ${clearance.incompleteCourses.length - 3} ኮርሶች...` : ''}
              </p>
            )}
          </Card>
        </FadeIn>
      ) : null}

      {/* Distance Courses LMS Grid with Reusable CourseCard */}
      {distanceCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <span>🎓 ወቅታዊ የርቀት ትምህርቶች</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">{distanceCourses.length} ኮርሶች</span>
          </div>

          <StaggerContainer staggerChildren={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {distanceCourses.map((c) => (
              <StaggerItem key={c._id}>
                <CourseCard
                  code={c.code}
                  title={c.nameAmharic || c.name}
                  theme={c.bibleTheme}
                  modulesCount={c.totalModules}
                  progressPct={c.progressPct || 0}
                  actionLabel="ወደ ትምህርት ክፍሉ ግባ ➔"
                  onAction={() => navigate(`/student/distance-classroom/${c._id}`)}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      )}

      {/* Regular Enrolled Courses Grid with Reusable CourseCard */}
      {courses.length > 0 && distanceCourses.length === 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <span>📖 የተመዘገቡባቸው ትምህርቶች</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">{courses.length} ኮርሶች</span>
          </div>

          <StaggerContainer staggerChildren={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <StaggerItem key={c._id || c.id}>
                <CourseCard
                  code={c.code || 'COURSE'}
                  title={c.name || c.title}
                  theme={c.bibleTheme || c.description}
                  badge={c.grade || batchOrGrade}
                  progressPct={c.progressPct || 0}
                  actionLabel="ዝርዝር መረጃ ይመልከቱ ➔"
                  onAction={() => navigate('/dashboard/courses')}
                >
                  <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-400">መምህር: </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {c.teacher?.fullName || c.teacherName || 'ሊቀ ማእምራን'}
                    </span>
                  </div>
                </CourseCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      )}

      {/* Metrics Row using Reusable StatCard */}
      <StatCard
        statCards={metricsCards}
        gridClassName="grid grid-cols-2 sm:grid-cols-4 gap-4"
      />

      {/* Certificate Modal */}
      {activeCertModal && (
        <VerifiableCertificate
          certificate={activeCertModal}
          onClose={() => setActiveCertModal(null)}
        />
      )}
    </div>
  );
};

export default StudentOverview;