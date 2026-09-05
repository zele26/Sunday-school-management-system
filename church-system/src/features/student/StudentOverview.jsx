'use client';

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';
import VerifiableCertificate from '../../components/VerifiableCertificate';
import { FadeIn, StaggerContainer, StaggerItem, MotionCard } from '../../components/motion';

const StudentOverview = () => {
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
  const batchOrGrade = profile?.batch || profile?.grade || 'Batch 1';

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
                  {isDistance ? '🌐 የርቀት ትምህርት (Distance LMS)' : '🏛️ መደበኛ ትምህርት'}
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
                  <span>ትምህርቱን ቀጥል (Continue Learning)</span>
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
          <div className="p-5 bg-amber-50/80 border border-amber-300/80 rounded-3xl flex items-center justify-between gap-4 flex-wrap shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl shadow-xs font-black">
                📜
              </span>
              <div>
                <h4 className="font-black text-sm text-slate-900">
                  የተመረቁበት ይፋዊ የምስክር ወረቀት (Official Graduation Certificate)
                </h4>
                <p className="text-xs text-slate-600">
                  የ{certificates[0].batch} የትምህርት መርሃ ግብርን በስኬት ስላጠናቀቁ የምስክር ወረቀት ተሰጥቷል።
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveCertModal(certificates[0])}
              className="px-5 py-2.5 bg-[#1657b8] text-white rounded-xl text-xs font-bold hover:bg-[#124796] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>👁️</span>
              <span>የምስክር ወረቀቱን ይመልከቱ / አትሙ (View & Print)</span>
            </button>
          </div>
        </FadeIn>
      ) : isDistance && clearance ? (
        <FadeIn delay={0.1}>
          <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xl">
                  🔒
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800">
                    የምስክር ወረቀት ማጠናቀቂያ ሂደት (Graduation Clearance Progress)
                  </h4>
                  <p className="text-xs text-slate-500">
                    ይፋዊ የሰንበት ት/ቤት ዲፕሎማ የሚሰጠው ሁሉንም {clearance.totalRequired} ኮርሶች 100% ሲያጠናቅቁ ነው።
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold rounded-full text-xs">
                {clearance.completedCount} / {clearance.totalRequired} ኮርሶች ተጠናቀዋል ({clearance.overallBatchProgressPct}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
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
          </div>
        </FadeIn>
      ) : null}

      {/* Distance Courses LMS Grid */}
      {distanceCourses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <span>🎓 ወቅታዊ የርቀት ትምህርት ኮርሶች (Active Distance Courses)</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">{distanceCourses.length} ኮርሶች</span>
          </div>

          <StaggerContainer staggerChildren={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {distanceCourses.map((c) => (
              <StaggerItem key={c._id}>
                <MotionCard
                  hoverY={-4}
                  className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group h-full"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        {c.code}
                      </span>
                      <span className="text-xs font-bold text-slate-400">{c.totalModules} ሞጁሎች</span>
                    </div>

                    <h4 className="font-extrabold text-base text-slate-900 group-hover:text-blue-700 transition-colors">
                      {c.nameAmharic || c.name}
                    </h4>

                    {c.bibleTheme && (
                      <p className="text-xs text-slate-500 line-clamp-2">
                        ✝️ ጭብጥ: {c.bibleTheme}
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>የትምህርት ሂደት</span>
                      <span className="font-mono text-blue-600">{c.progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${c.progressPct}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to={`/student/distance-classroom/${c._id}`}
                    className="w-full py-2.5 bg-gradient-to-r from-[#0f4c9c] to-[#08214d] text-white text-center font-bold text-xs rounded-xl shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>ወደ ትምህርት ክፍሉ ግባ ➔</span>
                  </Link>
                </MotionCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      )}

      {/* Metrics Row */}
      <StaggerContainer staggerChildren={0.08} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">የተመዘገቡ ኮርሶች</span>
            <p className="text-2xl font-black text-slate-800 mt-1">{distanceCourses.length || courses.length}</p>
            <p className="text-xs text-blue-600 font-semibold mt-1">የዚህ መንፈቅ ኮርሶች</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">የተወሰዱ ፈተናዎች</span>
            <p className="text-2xl font-black text-slate-800 mt-1">{examResults.length}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">የተጠናቀቁ ምዘናዎች</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">የትምህርት ደረጃ</span>
            <p className="text-2xl font-black text-amber-600 mt-1">{batchOrGrade}</p>
            <p className="text-xs text-slate-500 font-semibold mt-1">ወቅታዊ ባች</p>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">የተማሪ መለያ ID</span>
            <p className="text-xl font-mono font-black text-[#1657b8] mt-1 truncate">
              {profile?.studentId || 'TKD-STU'}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">ተረጋግጧል</p>
          </div>
        </StaggerItem>
      </StaggerContainer>

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