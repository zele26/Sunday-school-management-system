// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Lesson = require('../models/Lesson');

// All routes require a valid token (any role, but we further restrict to student)
router.use(protect);

// Middleware to ensure the user is a student
const ensureStudent = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(403).json({ message: 'Access denied. Student record not found.' });
    }
    req.student = student;   // attach student document to request
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

module.exports = router;