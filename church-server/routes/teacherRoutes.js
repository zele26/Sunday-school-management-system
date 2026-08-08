// routes/teacherRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Teacher = require('../models/Teacher');

// All routes require a valid token and teacher (or admin) role
router.use(protect);
router.use(authorize('teacher', 'admin'));

// ---------- Teacher Profile ----------
router.get('/profile', async (req, res) => {
  try {
    // req.user already has the full user object (excluding password)
    const user = req.user;
    // Optionally return courses count, students count, etc.
    const teacherDoc = await Teacher.findOne({ userId: user._id }).select('_id');
    const teacherIds = [user._id];
    if (teacherDoc) teacherIds.push(teacherDoc._id);

    const coursesCount = await Course.countDocuments({ teacher: { $in: teacherIds } });
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
    const teacherDoc = await Teacher.findOne({ userId: req.user._id }).select('_id');
    const teacherIds = [req.user._id];
    if (teacherDoc) {
      teacherIds.push(teacherDoc._id);
    }

    const courses = await Course.find({ teacher: { $in: teacherIds } })
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

// routes/teacherRoutes.js (add inside the file, after existing routes)

// ---------- Teacher Attendance Summary ----------
router.get('/attendance-summary', async (req, res) => {
  try {
    const { courseId } = req.query;

    // Build filter for courses taught by this teacher
    const courseFilter = { teacher: req.user._id };
    if (courseId) {
      courseFilter._id = courseId;
    }

    // Get all courses taught by this teacher (matching filter)
    const courses = await Course.find(courseFilter).select('name');
    if (!courses.length) {
      return res.json([]);
    }

    // For each course, compute attendance summary
    const summaries = [];

    for (const course of courses) {
      // Total distinct dates (class sessions) for this course
      const distinctDates = await Attendance.distinct('date', { course: course._id });
      const totalClasses = distinctDates.length;

      // Get all students assigned to this course? Actually students are enrolled in courses via Student.courses array.
      // We'll find students who have this course in their courses array.
      const students = await Student.find({ courses: course._id })
        .select('firstName lastName _id')
        .lean();

      const studentSummaries = [];

      for (const student of students) {
        const attendedCount = await Attendance.countDocuments({
          student: student._id,
          course: course._id,
        });

        studentSummaries.push({
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          attended: attendedCount,
          totalClasses,
        });
      }

      summaries.push({
        courseId: course._id,
        courseName: course.name,
        students: studentSummaries,
      });
    }

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// routes/teacherRoutes.js (add this route)
router.get('/dashboard-stats', async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Course = require('../models/Course');
    const teacherDoc = await Teacher.findOne({ userId: req.user._id }).select('_id');
    const teacherIds = [req.user._id];
    if (teacherDoc) teacherIds.push(teacherDoc._id);

    const studentsCount = await Student.countDocuments({ teacher: req.user._id });
    const coursesCount = await Course.countDocuments({ teacher: { $in: teacherIds } });
    res.json({ studentsCount, coursesCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;