// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Lesson = require('../models/Lesson');
const ExamResult = require('../models/ExamResult');   // ← NEW

// All routes require a valid token (any role, but we further restrict to student)
router.use(protect);

// Middleware to ensure the user is a student (auto-creates Student doc if missing)
const ensureStudent = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Only students can access this resource.' });
    }

    let student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      student = await Student.create({
        userId: req.user._id,
        firstName: req.user.fullName || 'Student',
        lastName: '',
        grade: '',
      });
      console.log(`✅ Created missing Student document for user ${req.user.email}`);
    }

    req.student = student;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Apply student check to all routes below
router.use(ensureStudent);

// ---------- Profile ----------
router.get('/profile', async (req, res) => {
  try {
    const student = await Student.findById(req.student._id)
      .populate('userId', 'email')
      .populate('courses', 'name grade')
      .populate('teacher', 'fullName email');
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- My Attendance ----------
router.get('/attendance', async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.student._id })
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- My Courses (enrolled) ----------
router.get('/my-courses', async (req, res) => {
  try {
    const student = await Student.findById(req.student._id)
      .populate('courses', 'name grade schedule teacher');
    res.json(student.courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Lessons for my courses ----------
router.get('/lessons', async (req, res) => {
  try {
    const student = await Student.findById(req.student._id).select('courses');
    const courseIds = student.courses;
    const lessons = await Lesson.find({ course: { $in: courseIds } })
      .populate('course', 'name')
      .sort({ course: 1, order: 1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- My Exam Results (list) ----------
router.get('/exam-results', async (req, res) => {
  try {
    const results = await ExamResult.find({ student: req.student._id })
      .populate('quiz', 'title')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Detailed Exam Result ----------
router.get('/exam-results/:resultId', async (req, res) => {
  try {
    const result = await ExamResult.findById(req.params.resultId)
      .populate('quiz', 'title')
      .populate('answers.question', 'text type options correctAnswer points');
    if (!result) return res.status(404).json({ message: 'Result not found' });

    // Ensure the student owns this result
    if (result.student.toString() !== req.student._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;