// src/features/student/DistanceClassroom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../../api/apiClient';
import useLanguage from '../../hooks/useLanguage';
import ChurchLogo from '../../assets/ChurchLogo.png';

const DistanceClassroom = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { lang, toggleLang, t, isAmharic } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'reading' | 'audio' | 'quiz' | 'assignment'

  // Progress Tracking States
  const [videoProgress, setVideoProgress] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isLessonCompleted, setIsLessonCompleted] = useState(false);

  // Quiz States
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Assignment States
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [assignmentContent, setAssignmentContent] = useState('');
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [assignmentMsg, setAssignmentMsg] = useState('');

  const readingContainerRef = useRef(null);

  useEffect(() => {
    fetchClassroom();
  }, [courseId]);

  const fetchClassroom = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/education/distance/courses/${courseId}/learn`);
      if (!res.ok) throw new Error('Failed to load classroom');
      const data = await res.json();
      setCourseData(data);

      // Set default active module and lesson
      if (data.modules && data.modules.length > 0) {
        // Find first in_progress or unlocked module
        const initialModIdx = data.modules.findIndex(m => m.status === 'in_progress') >= 0
          ? data.modules.findIndex(m => m.status === 'in_progress')
          : 0;

        setActiveModuleIndex(initialModIdx);
        const initialModule = data.modules[initialModIdx];
        if (initialModule.lessons && initialModule.lessons.length > 0) {
          const lesson = initialModule.lessons[0];
          selectLesson(lesson);
        } else if (initialModule.quizzes && initialModule.quizzes.length > 0) {
          selectQuiz(initialModule.quizzes[0]);
        }
      }
    } catch (err) {
      console.error('Classroom loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectLesson = (lesson) => {
    setActiveLesson(lesson);
    setActiveQuiz(null);
    setActiveAssignment(null);
    setVideoProgress(lesson.videoWatchedPct || 0);
    setReadingProgress(lesson.readingScrollPct || 0);
    setIsLessonCompleted(lesson.isFullyCompleted || false);

    // Pick active tab
    if (lesson.videoUrl) {
      setActiveTab('video');
    } else if (lesson.readingContent || lesson.readingContentAmharic) {
      setActiveTab('reading');
    } else if (lesson.audioUrl) {
      setActiveTab('audio');
    } else {
      setActiveTab('reading');
    }
  };

  const selectQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setActiveLesson(null);
    setActiveAssignment(null);
    setActiveTab('quiz');
    setQuizAnswers({});
    setQuizResult(null);
  };

  const selectAssignment = (assignment) => {
    setActiveAssignment(assignment);
    setActiveLesson(null);
    setActiveQuiz(null);
    setActiveTab('assignment');
    setAssignmentContent('');
    setAssignmentMsg('');
  };

  // Heartbeat to update video or reading progress
  const sendProgressHeartbeat = async (updates) => {
    if (!activeLesson) return;
    try {
      const res = await apiFetch(`/api/education/distance/lessons/${activeLesson._id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          ...updates,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lessonProgress?.isFullyCompleted) {
          setIsLessonCompleted(true);
        }
      }
    } catch (err) {
      console.warn('Heartbeat notice:', err.message);
    }
  };

  // Reading Scroll Tracker
  const handleReadingScroll = () => {
    if (!readingContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = readingContainerRef.current;
    if (scrollHeight <= clientHeight) {
      setReadingProgress(100);
      sendProgressHeartbeat({ readingScrollPct: 100, readingCompleted: true });
      return;
    }
    const pct = Math.min(100, Math.round((scrollTop / (scrollHeight - clientHeight)) * 100));
    setReadingProgress(pct);
    if (pct >= 90) {
      sendProgressHeartbeat({ readingScrollPct: pct, readingCompleted: true });
    }
  };

  // Video Complete Manual / Simulation Trigger
  const handleVideoCompleted = () => {
    setVideoProgress(100);
    sendProgressHeartbeat({ videoWatchedPct: 100, videoWatchedSeconds: 600 });
  };

  // Submit Quiz
  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!activeQuiz) return;
    setQuizSubmitting(true);
    try {
      const res = await apiFetch(`/api/education/distance/quizzes/${activeQuiz._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          answers: quizAnswers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuizResult(data);
        if (data.passed) {
          // Refresh classroom to update module unlocks!
          fetchClassroom();
        }
      } else {
        alert(data.message || 'Quiz submission failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuizSubmitting(false);
    }
  };

  // Submit Assignment
  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!activeAssignment || !assignmentContent.trim()) return;
    setAssignmentSubmitting(true);
    setAssignmentMsg('');
    try {
      const res = await apiFetch(`/api/education/distance/assignments/${activeAssignment._id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          content: assignmentContent.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssignmentMsg('✅ ' + data.message);
        fetchClassroom();
      } else {
        setAssignmentMsg('⚠️ ' + (data.message || 'Submission error'));
      }
    } catch (err) {
      setAssignmentMsg('⚠️ Submission failed');
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-amber-300 font-bold text-lg">የትምህርት ክፍሉን በመክፈት ላይ... (Loading Classroom)</p>
        </div>
      </div>
    );
  }

  if (!courseData || !courseData.course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-6">
        <div className="bg-slate-800 p-8 rounded-3xl text-center max-w-md border border-slate-700">
          <h2 className="text-xl font-bold text-rose-400 mb-2">ትምህርቱ አልተገኘም (Course Not Found)</h2>
          <p className="text-sm text-slate-300 mb-6">የተጠየቀው የርቀት ትምህርት ኮርስ አልተገኘም ወይም አልተፈቀደልዎትም።</p>
          <Link to="/student" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold text-white transition-all">
            ወደ ዋና ገጽ ተመለስ (Back to Dashboard)
          </Link>
        </div>
      </div>
    );
  }

  const { course, modules = [], overallProgressPct = 0 } = courseData;
  const currentModule = modules[activeModuleIndex] || modules[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Top Classroom Bar */}
      <header className="h-16 bg-[#051533] border-b border-amber-500/30 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 shadow-xl">
        <div className="flex items-center gap-3">
          <Link to="/student" className="flex items-center gap-2 group">
            <img src={ChurchLogo} alt="Logo" className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(255,204,0,0.5)] group-hover:scale-105 transition-transform" />
            <div className="hidden sm:block">
              <h1 className="text-xs font-black text-amber-400 tracking-wide">ተክለ ሳዊሮስ ሰንበት ት/ቤት</h1>
              <p className="text-[10px] text-slate-300 font-medium">የርቀት ትምህርት ማዕከል (Distance LMS)</p>
            </div>
          </Link>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <div className="truncate max-w-[200px] md:max-w-md">
            <h2 className="text-xs md:text-sm font-extrabold text-white truncate">
              {isAmharic ? course.nameAmharic || course.name : course.name}
            </h2>
            <p className="text-[10px] text-amber-300/80 font-mono truncate">{course.code} • {course.grade || 'Batch 1'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] font-bold text-slate-300">{t('overallProgress')}:</span>
            <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-white/10">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                style={{ width: `${overallProgressPct}%` }}
              />
            </div>
            <span className="text-xs font-black text-amber-400 font-mono">{overallProgressPct}%</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLang}
            className="px-3 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold transition-colors"
          >
            {t('switchLanguage')}
          </button>

          <Link
            to="/student"
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
          >
            <span>←</span>
            <span className="hidden sm:inline">ይውጡ (Exit)</span>
          </Link>
        </div>
      </header>

      {/* Classroom Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Side: Interactive Classroom Content Player (8 cols) */}
        <main className="lg:col-span-8 p-4 md:p-6 overflow-y-auto flex flex-col space-y-6">
          {/* Active Title Banner */}
          <div className="bg-gradient-to-r from-[#08214d] via-[#051533] to-[#08214d] p-5 rounded-3xl border border-amber-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                {isAmharic ? currentModule?.titleAmharic || currentModule?.title : currentModule?.title}
              </span>
              {isLessonCompleted && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40 flex items-center gap-1">
                  <span>✓</span> {t('completed')}
                </span>
              )}
            </div>

            <h3 className="text-lg md:text-xl font-extrabold text-white">
              {activeLesson ? (isAmharic ? activeLesson.titleAmharic || activeLesson.title : activeLesson.title) : (activeQuiz ? activeQuiz.title : activeAssignment?.title)}
            </h3>

            {course.mainBibleVerse && (
              <p className="text-xs text-amber-200/90 italic font-serif bg-black/20 p-2 rounded-xl border-l-2 border-amber-400">
                ✝️ "{course.mainBibleVerse}"
              </p>
            )}
          </div>

          {/* Activity Tabs */}
          {activeLesson && (
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
              {activeLesson.videoUrl && (
                <button
                  onClick={() => setActiveTab('video')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'video'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>🎥</span>
                  <span>{t('videoLecture')}</span>
                  {activeLesson.videoCompleted && <span className="text-[10px] text-emerald-700">✓</span>}
                </button>
              )}

              {(activeLesson.readingContent || activeLesson.readingContentAmharic) && (
                <button
                  onClick={() => setActiveTab('reading')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'reading'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>📖</span>
                  <span>{t('readingMaterial')}</span>
                  {activeLesson.readingCompleted && <span className="text-[10px] text-emerald-700">✓</span>}
                </button>
              )}

              {activeLesson.audioUrl && (
                <button
                  onClick={() => setActiveTab('audio')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === 'audio'
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>🎧</span>
                  <span>{t('audioChant')}</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 1: Video Lesson Player */}
          {activeTab === 'video' && activeLesson?.videoUrl && (
            <div className="space-y-4">
              <div className="relative aspect-video rounded-3xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
                {activeLesson.videoUrl.includes('youtube.com') || activeLesson.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={
                      activeLesson.videoUrl.includes('embed')
                        ? activeLesson.videoUrl
                        : activeLesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
                    }
                    title={activeLesson.videoTitle || activeLesson.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeLesson.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                    onEnded={handleVideoCompleted}
                  />
                )}
              </div>

              {/* Video Watch Tracker */}
              <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <span>{t('videoProgress')}:</span>
                    <span className="text-amber-400 font-mono font-bold">{videoProgress}%</span>
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t('watchUntilEnd')}</p>
                </div>

                <button
                  onClick={handleVideoCompleted}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-xl text-xs font-extrabold hover:brightness-110 transition-all shadow-md"
                >
                  {videoProgress >= 90 ? '✅ ቪዲዮው ተጠናቋል (Completed)' : 'ቪዲዮውን እንዳጠናቀቁ ይመዝግቡ (Mark Watched)'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Spiritual Reading Mode */}
          {activeTab === 'reading' && activeLesson && (
            <div className="space-y-4">
              {/* Reading Tracker Bar */}
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {t('readingProgress')}: <span className="text-amber-400 font-mono">{readingProgress}%</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  {readingProgress >= 90 ? '✅ ንባቡ ተጠናቋል' : t('scrollToEnd')}
                </span>
              </div>

              {/* Reading Text Container */}
              <div
                ref={readingContainerRef}
                onScroll={handleReadingScroll}
                className="max-h-[550px] overflow-y-auto bg-slate-900/90 p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 text-slate-200 leading-relaxed text-sm md:text-base font-normal shadow-inner"
              >
                <div className="prose prose-invert max-w-none space-y-4">
                  <div className="p-4 bg-amber-400/10 border-l-4 border-amber-400 rounded-r-2xl">
                    <h4 className="text-amber-300 font-bold text-sm">የዕለቱ የመጽሐፍ ቅዱስ ንባብና ማጠቃለያ</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      ይህን መንፈሳዊ ትምህርት በጸሎትና በትኩረት ያንብቡ። እስከ መጨረሻው ሲያነቡ ትምህርቱ በራስ-ሰር እንደተጠናቀቀ ይመዘገባል።
                    </p>
                  </div>

                  <div className="whitespace-pre-line text-slate-100 font-serif leading-8">
                    {isAmharic
                      ? activeLesson.readingContentAmharic || activeLesson.readingContent || 'የንባብ ጽሑፍ በቅርቡ ይጫናል።'
                      : activeLesson.readingContent || activeLesson.readingContentAmharic || 'Reading text will be available shortly.'}
                  </div>
                </div>

                <div className="p-4 bg-slate-800/80 rounded-2xl text-center border border-dashed border-slate-700">
                  <p className="text-xs text-amber-300 font-bold">✨ የትምህርቱ ማጠቃለያ ክፍል ደርሰዋል (End of Reading)</p>
                  <button
                    onClick={() => {
                      setReadingProgress(100);
                      sendProgressHeartbeat({ readingScrollPct: 100, readingCompleted: true });
                    }}
                    className="mt-2 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors shadow-md"
                  >
                    ንባቡን አጠናቅቄያለሁ (Confirm Reading Finished)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Audio Sermon / Chant */}
          {activeTab === 'audio' && activeLesson?.audioUrl && (
            <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 space-y-6 text-center shadow-2xl">
              <div className="w-20 h-20 bg-amber-400/20 text-amber-400 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner border border-amber-400/40">
                🎧
              </div>
              <div>
                <h4 className="font-extrabold text-lg text-white">{activeLesson.audioTitle || 'የድምፅ ስብከትና መዝሙር'}</h4>
                <p className="text-xs text-slate-400 mt-1">መንፈሳዊ የቃል ትምህርትና የመዝሙር ጥናት</p>
              </div>

              <audio src={activeLesson.audioUrl} controls className="w-full max-w-md mx-auto" />
            </div>
          )}

          {/* TAB 4: Assessment & Quiz */}
          {activeTab === 'quiz' && activeQuiz && (
            <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 flex-wrap gap-2">
                <div>
                  <h4 className="font-black text-lg text-amber-400">{activeQuiz.title}</h4>
                  <p className="text-xs text-slate-400">
                    {t('passingScoreRequired')}: <span className="font-bold text-amber-300">{activeQuiz.passingMark || 70}%</span>
                  </p>
                </div>

                <div className="bg-white/10 px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-amber-300">
                  ⏱️ {activeQuiz.duration || 20} ደቂቃ
                </div>
              </div>

              {quizResult ? (
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-center">
                  <div className={`text-4xl ${quizResult.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {quizResult.passed ? '🎉' : '⚠️'}
                  </div>
                  <h5 className="font-extrabold text-xl text-white">
                    {quizResult.passed ? t('congratulationsPassed') : t('retakeNeeded')}
                  </h5>
                  <p className="text-sm font-bold text-slate-300">
                    ውጤትዎ: <span className="font-mono text-amber-400 text-lg">{quizResult.score}%</span> (ያስፈለገው: {quizResult.passingMark}%)
                  </p>
                  {quizResult.unlockedNextModule && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-bold">
                      🔓 ቀጣዩ ሞጁል በተሳካ ሁኔታ ተከፍቷል! (Next Module Unlocked!)
                    </div>
                  )}

                  <button
                    onClick={() => setQuizResult(null)}
                    className="px-6 py-2.5 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-300 transition-colors"
                  >
                    እንደገና ተፈተን (Retake Quiz)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuizSubmit} className="space-y-6">
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 space-y-2">
                    <p className="font-bold text-amber-300">የፈተና መመሪያዎች (Instructions):</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-400">
                      <li>ሁሉንም ጥያቄዎች በትክክል ይመልሱ።</li>
                      <li>የሚያሳልፈው ውጤት {activeQuiz.passingMark || 70}% ነው።</li>
                      <li>ፈተናውን ሲያልፉ ቀጣዩ ሞጁል በራስ-ሰር ይከፈታል።</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm font-bold text-white">1. በዚህ ትምህርት ውስጥ የተማርነውን ዋና መንፈሳዊ ጭብጥ ይምረጡ፡</p>
                    <div className="space-y-2">
                      {['ሀ. የቅድስት ቤተክርስቲያን ነገረ መለኮትና የሃይማኖት ምስጢራት', 'ለ. የታሪክና የዘመን አቆጣጠር ጥናት', 'ሐ. የሥርዓተ አምልኮ ሥነ-ሥርዓት'].map((opt, idx) => (
                        <label key={idx} className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 hover:border-amber-400/50 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="sampleQ"
                            value={idx}
                            onChange={() => setQuizAnswers({ ...quizAnswers, 'q1': idx })}
                            className="text-amber-400 focus:ring-amber-400"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={quizSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold rounded-2xl text-xs hover:brightness-110 transition-all shadow-xl disabled:opacity-50"
                  >
                    {quizSubmitting ? 'ውጤትዎን በማስላት ላይ...' : t('submitAnswers')}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 5: Assignment Submission */}
          {activeTab === 'assignment' && activeAssignment && (
            <div className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl">
              <div className="border-b border-slate-800 pb-4">
                <h4 className="font-black text-lg text-amber-400">{activeAssignment.title}</h4>
                <p className="text-xs text-slate-300 mt-1">{activeAssignment.description || 'የጥናት ማጠቃለያዎን ወይም የቤት ሥራዎን ጽፈው ያስረክቡ።'}</p>
              </div>

              {assignmentMsg && (
                <div className="p-3 bg-slate-950 border border-amber-400/30 rounded-xl text-xs text-amber-300 font-bold">
                  {assignmentMsg}
                </div>
              )}

              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    የመልስዎ ማጠቃለያ ጽሑፍ (Essay / Solution Text):
                  </label>
                  <textarea
                    rows={6}
                    value={assignmentContent}
                    onChange={(e) => setAssignmentContent(e.target.value)}
                    placeholder="የጥናት ጽሑፍዎን ወይም መልስዎን እዚህ ይጻፉ..."
                    className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white outline-none focus:border-amber-400 font-sans"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={assignmentSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {assignmentSubmitting ? 'በማስረከብ ላይ...' : t('submitAssignment')}
                </button>
              </form>
            </div>
          )}
        </main>

        {/* Right Side: Sequential Curriculum Hierarchy & Module Locks (4 cols) */}
        <aside className="lg:col-span-4 bg-[#051533] border-t lg:border-t-0 lg:border-l border-slate-800/80 p-4 md:p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>📚</span> {t('learningPath')}
            </h4>
            <span className="text-[11px] font-bold text-slate-400 font-mono">{modules.length} {t('module')}s</span>
          </div>

          {/* Modules Accordion List */}
          <div className="space-y-3">
            {modules.map((mod, mIdx) => {
              const isCurrent = mIdx === activeModuleIndex;
              const isLocked = !mod.isUnlocked;

              return (
                <div
                  key={mod._id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isLocked
                      ? 'bg-slate-950/60 border-slate-800/60 opacity-70'
                      : isCurrent
                      ? 'bg-slate-900 border-amber-400/50 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Module Header */}
                  <button
                    type="button"
                    onClick={() => !isLocked && setActiveModuleIndex(mIdx)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`w-6 h-6 rounded-lg text-[10px] font-black flex items-center justify-center font-mono ${
                        mod.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isLocked
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-amber-400/20 text-amber-400 border border-amber-400/40'
                      }`}>
                        {mod.status === 'completed' ? '✓' : mIdx + 1}
                      </span>
                      <span className="text-xs font-bold text-white truncate">
                        {isAmharic ? mod.titleAmharic || mod.title : mod.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isLocked ? (
                        <span className="text-xs text-rose-400 font-bold" title={mod.lockReasonAmharic || mod.lockReason}>
                          🔒
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-amber-400">
                          {mod.progressPct}%
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Lock Explanation Alert */}
                  {isLocked && (
                    <div className="px-3.5 pb-3 text-[11px] text-rose-300/90 font-medium bg-rose-950/20 border-t border-rose-900/30 pt-2 flex items-start gap-1.5">
                      <span>⚠️</span>
                      <span>{isAmharic ? mod.lockReasonAmharic || mod.lockReason : mod.lockReason}</span>
                    </div>
                  )}

                  {/* Module Contents (When Unlocked & Active) */}
                  {!isLocked && isCurrent && (
                    <div className="px-3 pb-3 space-y-1.5 border-t border-slate-800/80 pt-2">
                      {/* Lessons */}
                      {mod.lessons?.map((les, lIdx) => {
                        const isLesActive = activeLesson?._id === les._id;
                        return (
                          <button
                            key={les._id}
                            type="button"
                            onClick={() => selectLesson(les)}
                            className={`w-full p-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between gap-2 transition-all ${
                              isLesActive
                                ? 'bg-amber-400/15 text-amber-300 border border-amber-400/30'
                                : 'bg-slate-950/60 text-slate-300 hover:bg-slate-800 border border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-slate-500 text-[10px]">{lIdx + 1}.</span>
                              <span className="truncate">{isAmharic ? les.titleAmharic || les.title : les.title}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {les.isFullyCompleted ? (
                                <span className="text-[10px] text-emerald-400 font-bold">✓</span>
                              ) : (
                                <span className="text-[9px] text-slate-500 font-mono">{les.durationMinutes}m</span>
                              )}
                            </div>
                          </button>
                        );
                      })}

                      {/* Quizzes */}
                      {mod.quizzes?.map((quiz) => (
                        <button
                          key={quiz._id}
                          type="button"
                          onClick={() => selectQuiz(quiz)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between gap-2 transition-all ${
                            activeQuiz?._id === quiz._id
                              ? 'bg-amber-400 text-slate-950 shadow-md'
                              : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-500/20'
                          }`}
                        >
                          <span className="truncate">📝 {quiz.title}</span>
                          <span className="text-[10px] font-mono">{quiz.passed ? '✅ Passed' : `${quiz.passingMark}%`}</span>
                        </button>
                      ))}

                      {/* Assignments */}
                      {mod.assignments?.map((assign) => (
                        <button
                          key={assign._id}
                          type="button"
                          onClick={() => selectAssignment(assign)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between gap-2 transition-all ${
                            activeAssignment?._id === assign._id
                              ? 'bg-blue-600 text-white shadow-md'
                              : 'bg-blue-950/40 text-blue-300 hover:bg-blue-900/60 border border-blue-500/20'
                          }`}
                        >
                          <span className="truncate">📎 {assign.title}</span>
                          <span className="text-[10px] font-mono">{assign.status}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default DistanceClassroom;
