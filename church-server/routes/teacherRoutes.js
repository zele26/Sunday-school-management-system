// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');

// All routes require a valid token and teacher (or admin) role
router.use(protect);
router.use(authorize('teacher', 'admin'));

// ---------- Teacher Profile ----------
router.get('/profile', async (req, res) => {
  try {
    // req.user already has the full user object (excluding password)
    const user = req.user;
    // Optionally return courses count, students count, etc.
    const coursesCount = await Course.countDocuments({ teacher: user._id });
    const studentsCount = await Student.countDocuments({ teacher: user._id });

    res.json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      coursesCount,
      studentsCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- My Courses (courses taught by the logged-in teacher) ----------
router.get('/my-courses', async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id })
      .populate('teacher', 'fullName email')
      .sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- My Students (students assigned to the teacher) ----------
router.get('/my-students', async (req, res) => {
  try {
    const students = await Student.find({ teacher: req.user._id })
      .populate('userId', 'email');
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher's Attendance Report ----------
router.get('/attendance', async (req, res) => {
  try {
    const { startDate, endDate, courseId } = req.query;
    const teacherStudents = await Student.find({ teacher: req.user._id }).select('_id');
    const studentIds = teacherStudents.map(s => s._id);

    const query = { student: { $in: studentIds } };
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (courseId) {
      query.course = courseId;
    }

    const attendances = await Attendance.find(query)
      .populate('student', 'firstName lastName grade')
      .populate('course', 'name')
      .sort({ date: -1 });

    res.json(attendances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;