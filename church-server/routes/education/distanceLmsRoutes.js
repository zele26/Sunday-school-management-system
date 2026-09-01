// church-server/routes/education/distanceLmsRoutes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const qrcode = require('qrcode');
const { protect, authorize } = require('../../middleware/auth');

const User = require('../../models/User');
const Student = require('../../models/Student');
const Course = require('../../models/education/Course');
const Module = require('../../models/education/Module');
const Lesson = require('../../models/education/Lesson');
const Quiz = require('../../models/education/Quiz');
const Question = require('../../models/education/Question');
const Assignment = require('../../models/education/Assignment');
const Submission = require('../../models/education/Submission');
const Resource = require('../../models/education/Resource');
const StudentLearningProgress = require('../../models/education/StudentLearningProgress');
const Certificate = require('../../models/education/Certificate');

// ============================================================================
// 1. STUDENT LEARNING ENDPOINTS
// ============================================================================

// Helper: Get or create progress record for a student in a course
async function getOrCreateProgress(studentId, userId, courseId) {
  let progress = await StudentLearningProgress.findOne({ studentId, courseId });
  if (!progress) {
    const modules = await Module.find({ courseId, status: 'Published' }).sort({ order: 1 });
    const moduleProgress = modules.map((m, idx) => ({
      moduleId: m._id,
      status: idx === 0 ? 'in_progress' : (m.isLockedByDefault ? 'locked' : (idx === 0 ? 'in_progress' : 'locked')),
      progressPct: 0,
      unlockedAt: idx === 0 ? new Date() : null,
    }));

    progress = await StudentLearningProgress.create({
      studentId,
      userId,
      courseId,
      moduleProgress,
      overallCourseProgressPct: 0,
      isCourseCompleted: false,
    });
  }
  return progress;
}

// GET /api/education/distance/my-courses – Active student distance courses with progress
router.get('/my-courses', protect, async (req, res) => {
  try {
    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }

    const batch = student?.batch || student?.grade || 'Batch 1';
    
    // Find all distance courses matching student batch or general distance courses
    const courses = await Course.find({
      studentType: 'distance',
      status: { $in: ['active', 'Active'] },
      $or: [
        { grade: batch },
        { grade: { $exists: false } },
        { grade: null },
      ]
    })
    .populate('teacher', 'fullName email')
    .populate('instructors', 'fullName email')
    .sort({ order: 1, createdAt: 1 });

    const courseCards = await Promise.all(courses.map(async (course) => {
      let progress = null;
      if (student) {
        progress = await getOrCreateProgress(student._id, req.user._id, course._id);
      }

      const totalModulesCount = await Module.countDocuments({ courseId: course._id, status: 'Published' });
      const completedModulesCount = progress?.moduleProgress?.filter(m => m.status === 'completed').length || 0;

      return {
        _id: course._id,
        name: course.name,
        nameAmharic: course.nameAmharic || course.name,
        code: course.code,
        description: course.description,
        bibleTheme: course.bibleTheme,
        mainBibleVerse: course.mainBibleVerse,
        grade: course.grade,
        teacherName: course.teacher?.fullName || 'ሊቀ ማእምራን (Faculty)',
        instructors: course.instructors,
        totalModules: totalModulesCount,
        completedModules: completedModulesCount,
        progressPct: progress?.overallCourseProgressPct || 0,
        isCompleted: progress?.isCourseCompleted || false,
        lastActivityAt: progress?.lastActivityAt,
      };
    }));

    res.json({
      success: true,
      batch,
      studentId: student?.studentId || 'TKD-STU',
      courses: courseCards,
    });
  } catch (err) {
    console.error('my-courses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/education/distance/courses/:courseId/learn – Full LMS Classroom Structure & Gating
router.get('/courses/:courseId/learn', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId)
      .populate('teacher', 'fullName email')
      .populate('instructors', 'fullName email');

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }

    let progress = null;
    if (student) {
      progress = await getOrCreateProgress(student._id, req.user._id, course._id);
    }

    // Fetch all published modules for this course
    const modules = await Module.find({ courseId, status: 'Published' }).sort({ order: 1 });

    // Process each module with sequential prerequisite gating
    let previousModuleCompleted = true; // Module 1 is always unlocked

    const modulesWithTree = await Promise.all(modules.map(async (mod, idx) => {
      const lessons = await Lesson.find({ moduleId: mod._id, status: 'Published' })
        .populate('attachedResources')
        .sort({ order: 1 });

      const quizzes = await Quiz.find({ course: courseId, published: true });
      const assignments = await Assignment.find({ course: courseId });

      // Find student module progress entry
      const modProg = progress?.moduleProgress?.find(p => p.moduleId.toString() === mod._id.toString());
      
      // Determine lock status
      let isUnlocked = false;
      let lockReason = '';
      let lockReasonAmharic = '';

      if (idx === 0) {
        isUnlocked = true;
      } else {
        if (previousModuleCompleted) {
          isUnlocked = true;
        } else {
          isUnlocked = false;
          lockReason = `Module ${idx + 1} is locked. Complete all required activities and passing quiz in Module ${idx} first.`;
          lockReasonAmharic = `ሞጁል ${idx + 1} ተቆልፏል። እባክዎ መጀመሪያ በሞጁል ${idx} ያሉትን ቪዲዮዎች፣ ንባቦችና የፈተና ውጤት (70%+) ያጠናቁ።`;
        }
      }

      // Check lessons progress
      const lessonsWithProgress = lessons.map(lesson => {
        const lProg = progress?.lessonProgress?.find(lp => lp.lessonId.toString() === lesson._id.toString());
        return {
          _id: lesson._id,
          title: lesson.title,
          titleAmharic: lesson.titleAmharic || lesson.title,
          order: lesson.order,
          durationMinutes: lesson.videoDurationSeconds ? Math.ceil(lesson.videoDurationSeconds / 60) : (lesson.readingEstimatedMinutes || 10),
          
          // Video components
          videoUrl: lesson.videoUrl,
          videoTitle: lesson.videoTitle,
          videoDurationSeconds: lesson.videoDurationSeconds,
          isVideoMandatory: lesson.isVideoMandatory,
          videoWatchedPct: lProg?.videoWatchedPct || 0,
          videoCompleted: lProg?.videoCompleted || false,

          // Reading components
          readingContent: lesson.readingContent,
          readingContentAmharic: lesson.readingContentAmharic,
          isReadingMandatory: lesson.isReadingMandatory,
          readingScrollPct: lProg?.readingScrollPct || 0,
          readingCompleted: lProg?.readingCompleted || false,

          // Audio components
          audioUrl: lesson.audioUrl,
          audioTitle: lesson.audioTitle,
          audioCompleted: lProg?.audioCompleted || false,

          // Resources & Attached Quiz
          quizId: lesson.quizId,
          assignmentId: lesson.assignmentId,
          attachedResources: lesson.attachedResources || [],
          
          isFullyCompleted: lProg?.isFullyCompleted || false,
        };
      });

      // Module completion check for chaining
      const isCompleted = modProg?.status === 'completed';
      if (!isCompleted) {
        previousModuleCompleted = false;
      }

      return {
        _id: mod._id,
        order: mod.order || (idx + 1),
        title: mod.title,
        titleAmharic: mod.titleAmharic || mod.title,
        description: mod.description,
        descriptionAmharic: mod.descriptionAmharic || mod.description,
        estimatedHours: mod.estimatedHours || 2,
        mandatoryActivities: mod.mandatoryActivities,
        isUnlocked,
        lockReason,
        lockReasonAmharic,
        status: isCompleted ? 'completed' : (isUnlocked ? 'in_progress' : 'locked'),
        progressPct: modProg?.progressPct || 0,
        lessons: lessonsWithProgress,
        quizzes: quizzes.map(q => {
          const rec = progress?.assessmentRecords?.find(ar => ar.quizId.toString() === q._id.toString());
          return {
            _id: q._id,
            title: q.title,
            quizType: q.quizType,
            duration: q.duration || 20,
            passingMark: q.passingMark || 70,
            maxScore: q.maxScore || 100,
            bestScore: rec?.bestScore || 0,
            passed: rec?.passed || false,
            attemptsCount: rec?.attemptsCount || 0,
          };
        }),
        assignments: assignments.map(a => {
          const sub = progress?.assignmentSubmissions?.find(as => as.assignmentId.toString() === a._id.toString());
          return {
            _id: a._id,
            title: a.title,
            description: a.description,
            dueDate: a.dueDate,
            maxScore: a.maxScore || 100,
            status: sub?.status || 'pending_submission',
            score: sub?.score,
          };
        }),
      };
    }));

    res.json({
      success: true,
      course: {
        _id: course._id,
        name: course.name,
        nameAmharic: course.nameAmharic || course.name,
        code: course.code,
        description: course.description,
        descriptionAmharic: course.descriptionAmharic || course.description,
        bibleTheme: course.bibleTheme,
        mainBibleVerse: course.mainBibleVerse,
        grade: course.grade,
        teacher: course.teacher,
        instructors: course.instructors,
        syllabus: course.syllabus || [],
        learningOutcomes: course.learningOutcomes || [],
      },
      overallProgressPct: progress?.overallCourseProgressPct || 0,
      isCourseCompleted: progress?.isCourseCompleted || false,
      modules: modulesWithTree,
    });
  } catch (err) {
    console.error('courses/learn error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/distance/lessons/:lessonId/progress – Real-time Video Watch & Reading Scroll Heartbeat
router.post('/lessons/:lessonId/progress', protect, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const {
      courseId,
      videoWatchedSeconds = 0,
      videoWatchedPct = 0,
      readingScrollPct = 0,
      readingCompleted = false,
      audioCompleted = false,
    } = req.body;

    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found' });

    const cId = courseId || lesson.course;
    const progress = await getOrCreateProgress(student._id, req.user._id, cId);

    // Update lesson progress
    let lp = progress.lessonProgress.find(item => item.lessonId.toString() === lessonId);
    if (!lp) {
      progress.lessonProgress.push({
        lessonId,
        videoWatchedSeconds,
        videoWatchedPct,
        videoCompleted: videoWatchedPct >= (lesson.minWatchPct || 90),
        readingScrollPct,
        readingCompleted: readingCompleted || readingScrollPct >= 95,
        audioCompleted,
        lastAccessedAt: new Date(),
      });
      lp = progress.lessonProgress[progress.lessonProgress.length - 1];
    } else {
      lp.videoWatchedSeconds = Math.max(lp.videoWatchedSeconds, videoWatchedSeconds);
      lp.videoWatchedPct = Math.max(lp.videoWatchedPct, videoWatchedPct);
      if (lp.videoWatchedPct >= (lesson.minWatchPct || 90)) {
        lp.videoCompleted = true;
      }
      lp.readingScrollPct = Math.max(lp.readingScrollPct, readingScrollPct);
      if (readingCompleted || lp.readingScrollPct >= 95) {
        lp.readingCompleted = true;
      }
      if (audioCompleted) {
        lp.audioCompleted = true;
      }
      lp.lastAccessedAt = new Date();
    }

    // Check if lesson is fully complete
    const isVideoDone = !lesson.isVideoMandatory || lp.videoCompleted;
    const isReadingDone = !lesson.isReadingMandatory || lp.readingCompleted;
    if (isVideoDone && isReadingDone) {
      lp.isFullyCompleted = true;
      if (!lp.completedAt) lp.completedAt = new Date();
    }

    // Recompute Module Completion Status
    if (lesson.moduleId) {
      const moduleLessons = await Lesson.find({ moduleId: lesson.moduleId, status: 'Published' });
      const totalLessonsCount = moduleLessons.length || 1;
      
      const completedCount = moduleLessons.filter(l => {
        const item = progress.lessonProgress.find(p => p.lessonId.toString() === l._id.toString());
        return item && item.isFullyCompleted;
      }).length;

      const modPct = Math.round((completedCount / totalLessonsCount) * 100);

      let mp = progress.moduleProgress.find(m => m.moduleId.toString() === lesson.moduleId.toString());
      if (mp) {
        mp.progressPct = modPct;
        mp.completedActivitiesCount = completedCount;
        mp.totalActivitiesCount = totalLessonsCount;

        if (modPct >= 100 && mp.status !== 'completed') {
          mp.status = 'completed';
          mp.completedAt = new Date();

          // Unlock next module sequentially!
          const currentModIndex = progress.moduleProgress.findIndex(m => m.moduleId.toString() === lesson.moduleId.toString());
          if (currentModIndex >= 0 && currentModIndex + 1 < progress.moduleProgress.length) {
            const nextMod = progress.moduleProgress[currentModIndex + 1];
            if (nextMod.status === 'locked') {
              nextMod.status = 'in_progress';
              nextMod.unlockedAt = new Date();
            }
          }
        }
      }
    }

    // Recompute Overall Course Progress
    const totalPublishedModules = progress.moduleProgress.length || 1;
    const completedModulesCount = progress.moduleProgress.filter(m => m.status === 'completed').length;
    progress.overallCourseProgressPct = Math.round((completedModulesCount / totalPublishedModules) * 100);

    if (progress.overallCourseProgressPct >= 100) {
      progress.isCourseCompleted = true;
      if (!progress.completedAt) progress.completedAt = new Date();
    }

    progress.lastActivityAt = new Date();
    await progress.save();

    res.json({
      success: true,
      lessonProgress: lp,
      overallCourseProgressPct: progress.overallCourseProgressPct,
      isCourseCompleted: progress.isCourseCompleted,
    });
  } catch (err) {
    console.error('lesson progress error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/distance/quizzes/:quizId/submit – Timed Assessment Evaluation & Module Unlocking
router.post('/quizzes/:quizId/submit', protect, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers = {}, courseId } = req.body;

    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const questions = await Question.find({ quiz: quizId });
    if (questions.length === 0) {
      return res.status(400).json({ success: false, message: 'No questions found in this assessment' });
    }

    let correctCount = 0;
    const questionResults = questions.map((q) => {
      const studentAnswer = answers[q._id.toString()];
      const isCorrect = studentAnswer !== undefined && parseInt(studentAnswer, 10) === parseInt(q.correctAnswer, 10);
      if (isCorrect) correctCount++;

      return {
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        studentAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        explanation: q.explanation || '',
      };
    });

    const scorePct = Math.round((correctCount / questions.length) * 100);
    const passingMark = quiz.passingMark || 70;
    const passed = scorePct >= passingMark;

    const cId = courseId || quiz.course;
    const progress = await getOrCreateProgress(student._id, req.user._id, cId);

    // Record assessment
    let ar = progress.assessmentRecords.find(item => item.quizId.toString() === quizId);
    if (!ar) {
      progress.assessmentRecords.push({
        quizId,
        bestScore: scorePct,
        maxScore: 100,
        passingScore: passingMark,
        passed,
        attemptsCount: 1,
        lastAttemptAt: new Date(),
      });
      ar = progress.assessmentRecords[progress.assessmentRecords.length - 1];
    } else {
      ar.bestScore = Math.max(ar.bestScore, scorePct);
      ar.attemptsCount += 1;
      ar.lastAttemptAt = new Date();
      if (scorePct >= passingMark) {
        ar.passed = true;
      }
    }

    // If passed and connected to a module, unlock subsequent module
    let unlockedNextModule = false;
    if (passed) {
      // Find current module
      const currentModIndex = progress.moduleProgress.findIndex(m => m.status === 'in_progress');
      if (currentModIndex >= 0 && currentModIndex + 1 < progress.moduleProgress.length) {
        const nextMod = progress.moduleProgress[currentModIndex + 1];
        if (nextMod.status === 'locked') {
          nextMod.status = 'in_progress';
          nextMod.unlockedAt = new Date();
          unlockedNextModule = true;
        }
      }
    }

    await progress.save();

    res.json({
      success: true,
      score: scorePct,
      correctCount,
      totalQuestions: questions.length,
      passingMark,
      passed,
      attemptsCount: ar.attemptsCount,
      unlockedNextModule,
      results: questionResults,
      message: passed 
        ? '🎉 እንኳን ደስ አለዎት! ፈተናውን በስኬት አልፈዋል።' 
        : `⚠️ የሚያሳልፈው ውጤት ${passingMark}% ነው። እባክዎ ትምህርቱን ደግመው ይከልሱና እንደገና ይፈተኑ።`,
    });
  } catch (err) {
    console.error('quiz submit error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/distance/assignments/:assignmentId/submit – Submit Homework/Study Paper
router.post('/assignments/:assignmentId/submit', protect, async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content = '', attachmentUrl = '', courseId } = req.body;

    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    let submission = await Submission.findOne({ assignment: assignmentId, student: student._id });
    if (!submission) {
      submission = await Submission.create({
        assignment: assignmentId,
        student: student._id,
        content,
        attachmentUrl,
        submittedAt: new Date(),
        status: 'Submitted',
      });
    } else {
      submission.content = content || submission.content;
      submission.attachmentUrl = attachmentUrl || submission.attachmentUrl;
      submission.submittedAt = new Date();
      submission.status = 'Submitted';
      await submission.save();
    }

    const cId = courseId;
    if (cId) {
      const progress = await getOrCreateProgress(student._id, req.user._id, cId);
      let asRecord = progress.assignmentSubmissions.find(item => item.assignmentId.toString() === assignmentId);
      if (!asRecord) {
        progress.assignmentSubmissions.push({
          assignmentId,
          submissionId: submission._id,
          status: 'submitted',
          submittedAt: new Date(),
        });
      } else {
        asRecord.status = 'submitted';
        asRecord.submittedAt = new Date();
      }
      await progress.save();
    }

    res.json({
      success: true,
      message: 'የቤት ሥራዎ በተሳካ ሁኔታ ተልኳል! (Assignment submitted successfully)',
      submission,
    });
  } catch (err) {
    console.error('assignment submit error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 2. TEACHER MONITORING & MANAGEMENT ENDPOINTS
// ============================================================================

// GET /api/education/distance/teacher/overview – Teacher Distance Course Hub
router.get('/teacher/overview', protect, authorize('teacher', 'admin', 'superadmin', 'department_admin'), async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'superadmin' || req.user.role === 'admin';
    const query = { studentType: 'distance' };
    
    if (!isSuperAdmin) {
      query.$or = [
        { teacher: req.user._id },
        { instructors: req.user._id },
      ];
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    const courseStats = await Promise.all(courses.map(async (c) => {
      const studentProgressList = await StudentLearningProgress.find({ courseId: c._id })
        .populate('studentId', 'firstName lastName studentId studentPhone batch grade')
        .populate('userId', 'fullName email');

      const totalEnrolled = studentProgressList.length;
      const completedStudents = studentProgressList.filter(p => p.isCourseCompleted).length;
      const inProgressStudents = studentProgressList.filter(p => !p.isCourseCompleted && p.overallCourseProgressPct > 0).length;
      const behindScheduleStudents = studentProgressList.filter(p => p.overallCourseProgressPct < 25).length;

      // Pending assignments
      const pendingSubmissionsCount = await Submission.countDocuments({
        assignment: { $in: await Assignment.find({ course: c._id }).distinct('_id') },
        status: 'Submitted'
      });

      return {
        _id: c._id,
        name: c.name,
        nameAmharic: c.nameAmharic || c.name,
        code: c.code,
        grade: c.grade,
        totalEnrolled,
        completedStudents,
        inProgressStudents,
        behindScheduleStudents,
        pendingSubmissionsCount,
        students: studentProgressList.map(p => ({
          studentId: p.studentId?._id,
          fullName: p.studentId?.firstName ? `${p.studentId.firstName} ${p.studentId.lastName}` : (p.userId?.fullName || 'ተማሪ'),
          studentNumber: p.studentId?.studentId || 'TKD-STU',
          email: p.userId?.email,
          progressPct: p.overallCourseProgressPct,
          isCompleted: p.isCourseCompleted,
          lastActivityAt: p.lastActivityAt,
        }))
      };
    }));

    res.json({
      success: true,
      teacherName: req.user.fullName,
      courses: courseStats,
    });
  } catch (err) {
    console.error('teacher overview error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/education/distance/submissions/pending – Teacher Grading Queue
router.get('/submissions/pending', protect, authorize('teacher', 'admin', 'superadmin', 'department_admin'), async (req, res) => {
  try {
    const submissions = await Submission.find({ status: 'Submitted' })
      .populate('student', 'firstName lastName studentId studentPhone')
      .populate({
        path: 'assignment',
        populate: { path: 'course', select: 'name code grade' }
      })
      .sort({ submittedAt: -1 })
      .limit(50);

    res.json({
      success: true,
      submissions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/education/distance/submissions/:submissionId/grade – Grade Student Assignment
router.put('/submissions/:submissionId/grade', protect, authorize('teacher', 'admin', 'superadmin', 'department_admin'), async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback, status = 'Graded' } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    submission.score = score;
    submission.feedback = feedback || '';
    submission.status = status;
    submission.gradedBy = req.user._id;
    await submission.save();

    res.json({
      success: true,
      message: 'ውጤቱ በተሳካ ሁኔታ ተመዝግቧል (Graded successfully)',
      submission,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 3. ADMIN ANALYTICS & CURRICULUM MANAGEMENT
// ============================================================================

// GET /api/education/distance/admin/analytics – High-Level LMS Dashboard
router.get('/admin/analytics', protect, authorize('admin', 'superadmin', 'department_admin'), async (req, res) => {
  try {
    const [
      totalDistanceStudents,
      activeDistanceCourses,
      totalModulesCount,
      completedCertificatesCount,
      batch1Count,
      batch2Count,
      batch3Count,
      batch4Count,
    ] = await Promise.all([
      Student.countDocuments({ studentType: 'distance' }),
      Course.countDocuments({ studentType: 'distance', status: { $in: ['active', 'Active'] } }),
      Module.countDocuments({ status: 'Published' }),
      Certificate.countDocuments({ status: 'Valid' }),
      Student.countDocuments({ studentType: 'distance', $or: [{ batch: 'Batch 1' }, { grade: 'Batch 1' }] }),
      Student.countDocuments({ studentType: 'distance', $or: [{ batch: 'Batch 2' }, { grade: 'Batch 2' }] }),
      Student.countDocuments({ studentType: 'distance', $or: [{ batch: 'Batch 3' }, { grade: 'Batch 3' }] }),
      Student.countDocuments({ studentType: 'distance', $or: [{ batch: 'Batch 4' }, { grade: 'Batch 4' }] }),
    ]);

    const progressRecords = await StudentLearningProgress.find({});
    const completedCoursesCount = progressRecords.filter(p => p.isCourseCompleted).length;
    const avgCompletionRate = progressRecords.length > 0
      ? Math.round(progressRecords.reduce((acc, p) => acc + (p.overallCourseProgressPct || 0), 0) / progressRecords.length)
      : 0;

    res.json({
      success: true,
      metrics: {
        totalDistanceStudents,
        activeDistanceCourses,
        totalModulesCount,
        completedCertificatesCount,
        completedCoursesCount,
        avgCompletionRate,
        batchBreakdown: {
          batch1: batch1Count,
          batch2: batch2Count,
          batch3: batch3Count,
          batch4: batch4Count,
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/distance/courses/:courseId/modules – Create Module
router.post('/courses/:courseId/modules', protect, authorize('admin', 'superadmin', 'department_admin', 'teacher'), async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, titleAmharic, description, descriptionAmharic, order, estimatedHours, mandatoryActivities } = req.body;

    const count = await Module.countDocuments({ courseId });
    const newModule = await Module.create({
      courseId,
      title,
      titleAmharic,
      description,
      descriptionAmharic,
      order: order || (count + 1),
      estimatedHours: estimatedHours || 2,
      mandatoryActivities: mandatoryActivities || {
        requireAllVideos: true,
        minVideoWatchPct: 90,
        requireAllReadings: true,
        requireQuizPassing: true,
        minQuizScorePct: 70,
      }
    });

    // Update course modules array
    await Course.findByIdAndUpdate(courseId, { $push: { modules: newModule._id } });

    res.status(201).json({
      success: true,
      message: 'ሞጁል በተሳካ ሁኔታ ተፈጥሯል (Module created successfully)',
      module: newModule,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/distance/modules/:moduleId/lessons – Create Rich Lesson
router.post('/modules/:moduleId/lessons', protect, authorize('admin', 'superadmin', 'department_admin', 'teacher'), async (req, res) => {
  try {
    const { moduleId } = req.params;
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) return res.status(404).json({ success: false, message: 'Module not found' });

    const {
      title,
      titleAmharic,
      videoUrl,
      videoTitle,
      videoDurationSeconds,
      isVideoMandatory,
      readingContent,
      readingContentAmharic,
      readingEstimatedMinutes,
      isReadingMandatory,
      audioUrl,
      audioTitle,
      order,
    } = req.body;

    const count = await Lesson.countDocuments({ moduleId });
    const newLesson = await Lesson.create({
      title,
      titleAmharic,
      course: moduleDoc.courseId,
      moduleId,
      uploadedBy: req.user._id,
      order: order || (count + 1),
      videoUrl: videoUrl || '',
      videoTitle: videoTitle || '',
      videoDurationSeconds: videoDurationSeconds || 0,
      isVideoMandatory: isVideoMandatory !== undefined ? isVideoMandatory : true,
      readingContent: readingContent || '',
      readingContentAmharic: readingContentAmharic || '',
      readingEstimatedMinutes: readingEstimatedMinutes || 10,
      isReadingMandatory: isReadingMandatory !== undefined ? isReadingMandatory : true,
      audioUrl: audioUrl || '',
      audioTitle: audioTitle || '',
    });

    res.status(201).json({
      success: true,
      message: 'ትምህርት በተሳካ ሁኔታ ተጨምሯል (Lesson created successfully)',
      lesson: newLesson,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 4. VERIFIABLE CERTIFICATE & ACADEMIC CLEARANCE SYSTEM
// ============================================================================

// Helper: Calculate graduation clearance for a student
async function getStudentClearance(student, batch) {
  const targetBatch = batch || student.batch || student.grade || 'Batch 1';

  // Find all required distance courses for this batch
  const requiredCourses = await Course.find({
    studentType: 'distance',
    status: { $in: ['active', 'Active'] },
    $or: [
      { grade: targetBatch },
      { grade: { $exists: false } },
      { grade: null },
    ]
  }).sort({ order: 1 });

  const progressDocs = await StudentLearningProgress.find({
    studentId: student._id,
    courseId: { $in: requiredCourses.map(c => c._id) }
  });

  const courseStatuses = requiredCourses.map(course => {
    const prog = progressDocs.find(p => p.courseId.toString() === course._id.toString());
    const isCompleted = prog?.isCourseCompleted || (prog?.overallCourseProgressPct >= 100);
    return {
      courseId: course._id,
      code: course.code,
      name: course.name,
      nameAmharic: course.nameAmharic || course.name,
      progressPct: prog?.overallCourseProgressPct || 0,
      isCompleted: !!isCompleted,
    };
  });

  const completedCourses = courseStatuses.filter(c => c.isCompleted);
  const incompleteCourses = courseStatuses.filter(c => !c.isCompleted);
  const isEligible = requiredCourses.length > 0 && incompleteCourses.length === 0;
  const overallBatchProgressPct = requiredCourses.length > 0 
    ? Math.round(courseStatuses.reduce((acc, c) => acc + c.progressPct, 0) / requiredCourses.length)
    : 0;

  return {
    batch: targetBatch,
    totalRequired: requiredCourses.length,
    completedCount: completedCourses.length,
    incompleteCount: incompleteCourses.length,
    overallBatchProgressPct,
    isEligible,
    completedCourses,
    incompleteCourses,
  };
}

// GET /api/education/distance/clearance – Student's own academic clearance
router.get('/clearance', protect, async (req, res) => {
  try {
    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }
    if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });

    const clearance = await getStudentClearance(student);
    res.json({ success: true, clearance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/education/distance/students/:studentId/clearance – Admin view of student clearance
router.get('/students/:studentId/clearance', protect, authorize('admin', 'superadmin', 'department_admin', 'teacher'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const clearance = await getStudentClearance(student);
    res.json({ success: true, clearance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/distance/certificates/generate/:studentId – Issue Formal Certificate with Strict Clearance Check
router.post('/certificates/generate/:studentId', protect, authorize('admin', 'superadmin', 'department_admin'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { forceBypass } = req.body; // Optional admin override

    const student = await Student.findById(studentId).populate('userId', 'fullName email');
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const clearance = await getStudentClearance(student);

    // Strict Academic Rule: Student MUST complete all courses before getting certified
    if (!clearance.isEligible && !forceBypass) {
      return res.status(400).json({
        success: false,
        isEligible: false,
        message: `ተማሪው ገና ያላጠናቀቃቸው ${clearance.incompleteCount} ኮርሶች አሉ። የምስክር ወረቀት የሚሰጠው ሁሉንም ${clearance.totalRequired} ኮርሶች 100% ሲያጠናቅቁ ብቻ ነው።`,
        clearance,
      });
    }

    const batch = clearance.batch;
    const year = new Date().getFullYear();
    const certNumber = `TKD-CERT-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    // Cryptographic hash for instant tamper-proof verification
    const verificationHash = crypto.createHash('sha256')
      .update(`${certNumber}-${student.studentId}-${batch}-${year}`)
      .digest('hex');

    // Public verification URL embedded in QR Code
    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-certificate/${certNumber}`;
    const qrCodeDataUrl = await qrcode.toDataURL(verifyUrl);

    // Ethiopian calendar date format
    const ethiopianDate = new Date().toLocaleDateString('am-ET-u-ca-ethiopic', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const cert = await Certificate.create({
      certificateNumber: certNumber,
      studentId: student._id,
      userId: student.userId?._id || student.userId,
      studentName: student.userId?.fullName || `${student.firstName} ${student.lastName}`,
      studentNameAmharic: `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim(),
      studentNumber: student.studentId || 'TKD-STU',
      batch,
      academicYear: '2017 ዓ.ም',
      completedCourses: clearance.completedCourses.map(c => ({
        courseName: c.nameAmharic || c.name,
        code: c.code,
        mark: 100,
        grade: 'A',
      })),
      issueDateEthiopian: ethiopianDate,
      issueDateGregorian: new Date(),
      verificationHash,
      qrCodeUrl: qrCodeDataUrl,
      status: 'Valid',
      honors: clearance.overallBatchProgressPct >= 95 ? 'በከፍተኛ ማዕረግ ተመርቋል (With High Distinction)' : 'በማዕረግ ተመርቋል (With Distinction)',
      signatories: [
        { title: 'የሰንበት ት/ቤት ሰብሳቢ (Sunday School Chair)', name: 'ሊቀ ማእምራን', signatureUrl: '' },
        { title: 'የደብሩ አስተዳዳሪ (Parish Administrator)', name: 'መልአከ ሰላም', signatureUrl: '' },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'የምስክር ወረቀት በተሳካ ሁኔታ ተዘጋጅቷል (Certificate generated successfully)',
      certificate: cert,
    });
  } catch (err) {
    console.error('generate certificate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/education/distance/certificates/my-certificates – Get Student's Certificates & Clearance
router.get('/certificates/my-certificates', protect, async (req, res) => {
  try {
    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.findOne({ email: req.user.email });
    }

    if (!student) return res.json({ success: true, certificates: [], clearance: null });

    const [certificates, clearance] = await Promise.all([
      Certificate.find({ studentId: student._id, status: 'Valid' }).sort({ createdAt: -1 }),
      getStudentClearance(student),
    ]);

    res.json({
      success: true,
      certificates,
      clearance,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 5. PUBLIC CERTIFICATE VERIFICATION (NO AUTH REQUIRED)
// ============================================================================

// GET /api/education/distance/public/verify/:certNumber – Public Certificate Verification
router.get('/public/verify/:certNumber', async (req, res) => {
  try {
    const { certNumber } = req.params;
    const cert = await Certificate.findOne({ 
      certificateNumber: certNumber.trim().toUpperCase(), 
      status: 'Valid' 
    });

    if (!cert) {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: 'ይህ የምስክር ወረቀት በስርዓቱ ውስጥ አልተገኘም ወይም ውድቅ ተደርጓል (Certificate not found or revoked)',
      });
    }

    res.json({
      success: true,
      isValid: true,
      certificate: {
        certificateNumber: cert.certificateNumber,
        studentName: cert.studentName,
        studentNameAmharic: cert.studentNameAmharic,
        studentNumber: cert.studentNumber,
        program: cert.program,
        batch: cert.batch,
        academicYear: cert.academicYear,
        issueDateEthiopian: cert.issueDateEthiopian,
        honors: cert.honors,
        status: cert.status,
        institution: 'ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት (Teklesawiros Sunday School)',
// GET /api/education/distance/public/certificate/:certNumber – Full Certificate View
router.get('/public/certificate/:certNumber', async (req, res) => {
  try {
    const { certNumber } = req.params;
    const cert = await Certificate.findOne({
      certificateNumber: certNumber.trim().toUpperCase(),
      status: 'Valid',
    });

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.json({ success: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
