// src/components/CurriculumLessonStudio.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/apiClient';

const CurriculumLessonStudio = ({ courseId, courseName, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(true);
  const [curriculum, setCurriculum] = useState({ course: null, modules: [] });

  // Modal States
  const [activeModuleForLesson, setActiveModuleForLesson] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);

  const [editingModule, setEditingModule] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);

  // Lesson Form State
  const [lessonForm, setLessonForm] = useState({
    title: '',
    titleAmharic: '',
    order: 1,
    videoUrl: '',
    videoTitle: '',
    videoDurationMinutes: 15,
    isVideoMandatory: true,
    readingContentAmharic: '',
    readingContent: '',
    readingEstimatedMinutes: 10,
    isReadingMandatory: true,
    audioUrl: '',
    audioTitle: '',
  });

  // Module Form State
  const [moduleForm, setModuleForm] = useState({
    title: '',
    titleAmharic: '',
    descriptionAmharic: '',
    estimatedHours: 2,
    order: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (courseId) {
      fetchCurriculum();
    }
  }, [courseId]);

  const fetchCurriculum = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/education/distance/courses/${courseId}/curriculum`);
      if (res.ok) {
        const data = await res.json();
        setCurriculum(data);
      }
    } catch (err) {
      console.error('Failed to load curriculum:', err);
    } finally {
      setLoading(false);
    }
  };

  // ------------------ LESSON ACTIONS ------------------
  const handleOpenAddLesson = (module) => {
    setActiveModuleForLesson(module);
    setEditingLesson(null);
    const nextOrder = (module.lessons?.length || 0) + 1;
    setLessonForm({
      title: '',
      titleAmharic: '',
      order: nextOrder,
      videoUrl: '',
      videoTitle: '',
      videoDurationMinutes: 15,
      isVideoMandatory: true,
      readingContentAmharic: '',
      readingContent: '',
      readingEstimatedMinutes: 10,
      isReadingMandatory: true,
      audioUrl: '',
      audioTitle: '',
    });
    setShowLessonModal(true);
    setStatusMsg({ type: '', text: '' });
  };

  const handleOpenEditLesson = (module, lesson) => {
    setActiveModuleForLesson(module);
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title || '',
      titleAmharic: lesson.titleAmharic || lesson.title || '',
      order: lesson.order || 1,
      videoUrl: lesson.videoUrl || '',
      videoTitle: lesson.videoTitle || '',
      videoDurationMinutes: lesson.videoDurationSeconds ? Math.ceil(lesson.videoDurationSeconds / 60) : 15,
      isVideoMandatory: lesson.isVideoMandatory !== undefined ? lesson.isVideoMandatory : true,
      readingContentAmharic: lesson.readingContentAmharic || lesson.readingContent || '',
      readingContent: lesson.readingContent || '',
      readingEstimatedMinutes: lesson.readingEstimatedMinutes || 10,
      isReadingMandatory: lesson.isReadingMandatory !== undefined ? lesson.isReadingMandatory : true,
      audioUrl: lesson.audioUrl || '',
      audioTitle: lesson.audioTitle || '',
    });
    setShowLessonModal(true);
    setStatusMsg({ type: '', text: '' });
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.titleAmharic.trim() && !lessonForm.title.trim()) {
      setStatusMsg({ type: 'error', text: 'እባክዎ የትምህርቱን ርዕስ ያስገቡ (Lesson title required)' });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    const payload = {
      title: lessonForm.title.trim() || lessonForm.titleAmharic.trim(),
      titleAmharic: lessonForm.titleAmharic.trim() || lessonForm.title.trim(),
      order: parseInt(lessonForm.order, 10) || 1,
      videoUrl: lessonForm.videoUrl.trim(),
      videoTitle: lessonForm.videoTitle.trim(),
      videoDurationSeconds: (parseInt(lessonForm.videoDurationMinutes, 10) || 15) * 60,
      isVideoMandatory: lessonForm.isVideoMandatory,
      readingContentAmharic: lessonForm.readingContentAmharic.trim(),
      readingContent: lessonForm.readingContent.trim() || lessonForm.readingContentAmharic.trim(),
      readingEstimatedMinutes: parseInt(lessonForm.readingEstimatedMinutes, 10) || 10,
      isReadingMandatory: lessonForm.isReadingMandatory,
      audioUrl: lessonForm.audioUrl.trim(),
      audioTitle: lessonForm.audioTitle.trim(),
    };

    try {
      let res;
      if (editingLesson) {
        // Update existing lesson
        res = await apiFetch(`/api/education/distance/lessons/${editingLesson._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new lesson in module
        res = await apiFetch(`/api/education/distance/modules/${activeModuleForLesson._id}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowLessonModal(false);
        fetchCurriculum();
        if (onUpdated) onUpdated();
      } else {
        const errData = await res.json().catch(() => ({}));
        setStatusMsg({ type: 'error', text: errData.message || 'የትምህርት ማስቀመጥ ስህተት አጋጥሟል' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'የኔትወርክ ስህተት' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('ይህን ትምህርት መሰረዝ ይፈልጋሉ? (Delete this lesson?)')) return;
    try {
      const res = await apiFetch(`/api/education/distance/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCurriculum();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      console.error('Delete lesson error:', err);
    }
  };

  // ------------------ MODULE ACTIONS ------------------
  const handleOpenAddModule = () => {
    setEditingModule(null);
    const nextOrder = (curriculum.modules?.length || 0) + 1;
    setModuleForm({
      title: '',
      titleAmharic: '',
      descriptionAmharic: '',
      estimatedHours: 2,
      order: nextOrder,
    });
    setShowModuleModal(true);
    setStatusMsg({ type: '', text: '' });
  };

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod);
    setModuleForm({
      title: mod.title || '',
      titleAmharic: mod.titleAmharic || mod.title || '',
      descriptionAmharic: mod.descriptionAmharic || mod.description || '',
      estimatedHours: mod.estimatedHours || 2,
      order: mod.order || 1,
    });
    setShowModuleModal(true);
    setStatusMsg({ type: '', text: '' });
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleForm.titleAmharic.trim() && !moduleForm.title.trim()) {
      setStatusMsg({ type: 'error', text: 'እባክዎ የሞጁል ርዕስ ያስገቡ' });
      return;
    }

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    const payload = {
      title: moduleForm.title.trim() || moduleForm.titleAmharic.trim(),
      titleAmharic: moduleForm.titleAmharic.trim() || moduleForm.title.trim(),
      descriptionAmharic: moduleForm.descriptionAmharic.trim(),
      description: moduleForm.descriptionAmharic.trim(),
      estimatedHours: parseFloat(moduleForm.estimatedHours) || 2,
      order: parseInt(moduleForm.order, 10) || 1,
    };

    try {
      let res;
      if (editingModule) {
        res = await apiFetch(`/api/education/distance/modules/${editingModule._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch(`/api/education/distance/courses/${courseId}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setShowModuleModal(false);
        fetchCurriculum();
        if (onUpdated) onUpdated();
      } else {
        const errData = await res.json().catch(() => ({}));
        setStatusMsg({ type: 'error', text: errData.message || 'ሞጁል ማስቀመጥ አልተሳካም' });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'የኔትወርክ ስህተት' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('ይህን ሞጁልና በውስጡ ያሉትን ሁሉንም ትምህርቶች መሰረዝ ይፈልጋሉ?')) return;
    try {
      const res = await apiFetch(`/api/education/distance/modules/${moduleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchCurriculum();
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      console.error('Delete module error:', err);
    }
  };

  // Helper to get YouTube Embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    if (url.includes('watch?v=')) return url.replace('watch?v=', 'embed/');
    if (url.includes('youtu.be/')) return url.replace('youtu.be/', 'youtube.com/embed/');
    return url;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl text-white overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Curriculum Studio
              </span>
              <span className="text-xs text-slate-400 font-mono">{curriculum.course?.code || 'LMS'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {curriculum.course?.nameAmharic || courseName || 'የርቀት ኮርስ ማስተካከያ'} — የትምህርትና ሞጁሎች ማዕከል
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              የYouTube ቪዲዮዎችን፣ መንፈሳዊ ንባቦችንና የድምፅ ትምህርቶችን በቀላሉ እዚህ ያክሉና ያስተካክሉ።
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenAddModule}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-xl text-xs font-black hover:brightness-110 shadow-md transition-all flex items-center gap-1.5"
            >
              <span>+</span>
              <span>አዲስ ሞጁል (Add Module)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
              <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-bold text-slate-400">የትምህርት ዝርዝር በመጫን ላይ...</p>
            </div>
          ) : curriculum.modules?.length === 0 ? (
            <div className="text-center py-16 p-8 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-950/40 space-y-4">
              <span className="text-4xl">📚</span>
              <div>
                <h3 className="text-base font-bold text-slate-200">በዚህ ኮርስ ውስጥ እስካሁን ምንም ሞጁል አልተጨመረም</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  ተማሪዎች እንዲማሩበት ቪዲዮዎችንና ንባቦችን የያዘ የመጀመሪያውን ሞጁል ለመፍጠር ከላይ ያለውን <strong>+ አዲስ ሞጁል</strong> ቁልፍ ይጫኑ።
                </p>
              </div>
              <button
                onClick={handleOpenAddModule}
                className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:brightness-110 shadow-md"
              >
                + የመጀመሪያውን ሞጁል ፍጠር (Create 1st Module)
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {curriculum.modules.map((module, mIdx) => (
                <div
                  key={module._id}
                  className="bg-slate-950/70 border border-slate-800/90 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg hover:border-slate-700/80 transition-all"
                >
                  {/* Module Title Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
                        #{module.order || mIdx + 1}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                          <span>{module.titleAmharic || module.title}</span>
                          {module.estimatedHours && (
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                              ⏱️ ~{module.estimatedHours} ሰዓት
                            </span>
                          )}
                        </h3>
                        {module.descriptionAmharic && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{module.descriptionAmharic}</p>
                        )}
                      </div>
                    </div>

                    {/* Module Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenAddLesson(module)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                      >
                        <span>+</span>
                        <span>ትምህርት ጨምር (Add Lesson)</span>
                      </button>
                      <button
                        onClick={() => handleOpenEditModule(module)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all"
                        title="ሞጁል አርም"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteModule(module._id)}
                        className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-semibold transition-all border border-rose-800/40"
                        title="ሞጁል ሰርዝ"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* Lessons List inside this Module */}
                  <div className="space-y-2.5">
                    {module.lessons?.length === 0 ? (
                      <div className="p-4 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center">
                        <p className="text-xs text-slate-400">በዚህ ሞጁል ውስጥ ምንም ትምህርት የለም።</p>
                        <button
                          onClick={() => handleOpenAddLesson(module)}
                          className="mt-2 text-xs text-amber-400 hover:underline font-bold"
                        >
                          + የYouTube ቪዲዮ ወይም ንባብ ትምህርት ያክሉ
                        </button>
                      </div>
                    ) : (
                      module.lessons.map((lesson, lIdx) => (
                        <div
                          key={lesson._id}
                          className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-amber-400/40 transition-all group"
                        >
                          <div className="flex items-start sm:items-center gap-3">
                            <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-lg">
                              {lIdx + 1}
                            </span>
                            <div>
                              <h4 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                                {lesson.titleAmharic || lesson.title}
                              </h4>
                              
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {/* YouTube Video Tag */}
                                {lesson.videoUrl ? (
                                  <a
                                    href={lesson.videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-0.5 bg-red-950/60 text-red-400 border border-red-800/50 rounded-md text-[10px] font-bold flex items-center gap-1 hover:bg-red-900/60"
                                  >
                                    <span>🎥 YouTube</span>
                                    <span>➔</span>
                                  </a>
                                ) : (
                                  <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                                    ቪዲዮ የለም
                                  </span>
                                )}

                                {/* Spiritual Reading Tag */}
                                {(lesson.readingContentAmharic || lesson.readingContent) && (
                                  <span className="px-2 py-0.5 bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 rounded-md text-[10px] font-bold flex items-center gap-1">
                                    <span>📖 መንፈሳዊ ንባብ</span>
                                  </span>
                                )}

                                {/* Audio Chant Tag */}
                                {lesson.audioUrl && (
                                  <span className="px-2 py-0.5 bg-indigo-950/60 text-indigo-400 border border-indigo-800/50 rounded-md text-[10px] font-bold flex items-center gap-1">
                                    <span>🎧 ድምፅ</span>
                                  </span>
                                )}

                                {lesson.videoDurationSeconds > 0 && (
                                  <span className="text-[10px] text-slate-400">
                                    ⏱️ {Math.ceil(lesson.videoDurationSeconds / 60)} ደቂቃ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Lesson Actions */}
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              onClick={() => handleOpenEditLesson(module, lesson)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <span>✏️</span>
                              <span>አስተካክል (Edit)</span>
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(lesson._id)}
                              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-semibold transition-all"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
          >
            ዝጋ (Close Studio)
          </button>
        </div>
      </div>

      {/* ------------------ LESSON CREATE / EDIT MODAL ------------------ */}
      {showLessonModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-60 animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 text-white max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{editingLesson ? '✏️ ትምህርቱን ያሻሽሉ (Edit Lesson)' : '✨ አዲስ ትምህርት ጨምር (Create Lesson)'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ሞጁል፡ <span className="text-amber-300 font-bold">{activeModuleForLesson?.titleAmharic || activeModuleForLesson?.title}</span>
                </p>
              </div>
              <button
                onClick={() => setShowLessonModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl"
              >
                ✕
              </button>
            </div>

            {statusMsg.text && (
              <div className={`p-3.5 rounded-xl text-xs font-bold ${
                statusMsg.type === 'error' ? 'bg-rose-950 text-rose-200 border border-rose-800' : 'bg-emerald-950 text-emerald-200'
              }`}>
                {statusMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
              {/* Titles & Order */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="font-bold text-slate-300">የትምህርቱ ርዕስ በአማርኛ * (Lesson Title in Amharic):</label>
                  <input
                    type="text"
                    value={lessonForm.titleAmharic}
                    onChange={(e) => setLessonForm({ ...lessonForm, titleAmharic: e.target.value, title: e.target.value })}
                    placeholder="ለምሳሌ፡ ትምህርት ፩ - የነገረ መለኮት መግቢያ"
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white outline-none focus:border-amber-400"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">ቅደም ተከተል (Order):</label>
                  <input
                    type="number"
                    min="1"
                    value={lessonForm.order}
                    onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* ------------------ SECTION 1: YOUTUBE VIDEO ------------------ */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-red-400 flex items-center gap-1.5">
                    <span>🎥</span>
                    <span>የYouTube ቪዲዮ ትምህርት (Video Lesson Link)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">YouTube, youtu.be, or Direct URL</span>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">የYouTube ሊንክ ይለጥፉ (Paste YouTube Video URL):</label>
                  <input
                    type="url"
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=XXXXX ወይም https://youtu.be/XXXXX"
                    className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono outline-none focus:border-red-500"
                  />
                </div>

                {/* Real-time YouTube Live Preview Player */}
                {lessonForm.videoUrl && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-slate-400">የቪዲዮ ቅድመ እይታ (Live Preview):</span>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
                      <iframe
                        src={getEmbedUrl(lessonForm.videoUrl)}
                        title="Video Preview"
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-slate-400 mb-1">የቪዲዮው ርዝመት በደቂቃ (Duration in Mins):</label>
                    <input
                      type="number"
                      min="1"
                      value={lessonForm.videoDurationMinutes}
                      onChange={(e) => setLessonForm({ ...lessonForm, videoDurationMinutes: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="videoMandatory"
                      checked={lessonForm.isVideoMandatory}
                      onChange={(e) => setLessonForm({ ...lessonForm, isVideoMandatory: e.target.checked })}
                      className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                    />
                    <label htmlFor="videoMandatory" className="text-slate-300 font-semibold cursor-pointer">
                      ቪዲዮውን ማየት ግዴታ ይሁን (Mandatory Watch)
                    </label>
                  </div>
                </div>
              </div>

              {/* ------------------ SECTION 2: SPIRITUAL READING TEXT ------------------ */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-extrabold text-sm text-emerald-400 flex items-center gap-1.5">
                  <span>📖</span>
                  <span>የዕለቱ መንፈሳዊ ንባብና የትምህርት ጽሑፍ (Spiritual Reading Material)</span>
                </span>

                <div>
                  <label className="block text-slate-400 mb-1">የትምህርቱ ጽሑፍና የመጽሐፍ ቅዱስ ማብራሪያ (Reading Content in Amharic):</label>
                  <textarea
                    rows={5}
                    value={lessonForm.readingContentAmharic}
                    onChange={(e) => setLessonForm({ ...lessonForm, readingContentAmharic: e.target.value })}
                    placeholder="የዕለቱ የመጽሐፍ ቅዱስ ንባብ፣ የነገረ መለኮት ማብራሪያና መንፈሳዊ ትምህርት እዚህ ይጻፉ..."
                    className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-emerald-500 leading-relaxed font-normal"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-slate-400 mb-1">የንባብ ግምት ጊዜ በደቂቃ (Reading Minutes):</label>
                    <input
                      type="number"
                      min="1"
                      value={lessonForm.readingEstimatedMinutes}
                      onChange={(e) => setLessonForm({ ...lessonForm, readingEstimatedMinutes: e.target.value })}
                      className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="readingMandatory"
                      checked={lessonForm.isReadingMandatory}
                      onChange={(e) => setLessonForm({ ...lessonForm, isReadingMandatory: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-500 bg-slate-900 border-slate-700"
                    />
                    <label htmlFor="readingMandatory" className="text-slate-300 font-semibold cursor-pointer">
                      ንባቡን ማጠናቀቅ ግዴታ ይሁን (Mandatory Reading)
                    </label>
                  </div>
                </div>
              </div>

              {/* ------------------ SECTION 3: AUDIO / CHANT ------------------ */}
              <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="font-extrabold text-sm text-indigo-400 flex items-center gap-1.5">
                  <span>🎧</span>
                  <span>የድምፅ ትምህርት ወይም መዝሙር (Audio / Chant URL - Optional)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">የድምፅ ፋይል ሊንክ (Audio MP3 URL):</label>
                    <input
                      type="url"
                      value={lessonForm.audioUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, audioUrl: e.target.value })}
                      placeholder="https://... (mp3 / audio url)"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">የድምፅ ርዕስ (Audio Title):</label>
                    <input
                      type="text"
                      value={lessonForm.audioTitle}
                      onChange={(e) => setLessonForm({ ...lessonForm, audioTitle: e.target.value })}
                      placeholder="ለምሳሌ፡ የቅዱስ ያሬድ ዜማ"
                      className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLessonModal(false)}
                  className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700"
                >
                  ሰርዝ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 rounded-xl font-black hover:brightness-110 shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'በማስቀመጥ ላይ...' : editingLesson ? 'ያዘምኑ (Update Lesson)' : 'ትምህርቱን ፍጠር (Save Lesson)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------ MODULE CREATE / EDIT MODAL ------------------ */}
      {showModuleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-60 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <h3 className="text-lg font-black text-white">
              {editingModule ? '✏️ ሞጁል ያሻሽሉ (Edit Module)' : '✨ አዲስ ሞጁል ፍጠር (Add Module)'}
            </h3>

            <form onSubmit={handleSaveModule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">የሞጁል ርዕስ በአማርኛ * (Module Title in Amharic):</label>
                <input
                  type="text"
                  value={moduleForm.titleAmharic}
                  onChange={(e) => setModuleForm({ ...moduleForm, titleAmharic: e.target.value, title: e.target.value })}
                  placeholder="ለምሳሌ፡ ሞጁል ፩ - ነገረ መለኮትና የሃይማኖት ምስጢራት"
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">መግለጫ (Description in Amharic):</label>
                <textarea
                  rows={3}
                  value={moduleForm.descriptionAmharic}
                  onChange={(e) => setModuleForm({ ...moduleForm, descriptionAmharic: e.target.value })}
                  placeholder="የዚህ ሞጁል ዋና ዓላማና ይዘት..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">የጥናት ሰዓት ግምት (Est. Hours):</label>
                  <input
                    type="number"
                    min="1"
                    value={moduleForm.estimatedHours}
                    onChange={(e) => setModuleForm({ ...moduleForm, estimatedHours: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">ቅደም ተከተል (Order):</label>
                  <input
                    type="number"
                    min="1"
                    value={moduleForm.order}
                    onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  ሰርዝ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl hover:brightness-110"
                >
                  {submitting ? 'በማስቀመጥ ላይ...' : editingModule ? 'ያዘምኑ' : 'ፍጠር (Save Module)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurriculumLessonStudio;
