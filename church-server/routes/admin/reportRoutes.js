// routes/admin/reportRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../../models/Student');
const Course = require('../../models/Course');
const Attendance = require('../../models/Attendance');
const User = require('../../models/User');

// By Student
router.get('/student/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate('userId', 'email')
      .populate('courses', 'name')
      .lean();
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const history = await Attendance.find({ student: student._id })
      .populate('course', 'name')
      .sort({ date: -1 })
      .lean();

    const courseSummaries = [];
    for (const course of student.courses) {
      const totalSessions = (await Attendance.distinct('date', { course: course._id })).length;
      const attended = await Attendance.countDocuments({ student: student._id, course: course._id });
      courseSummaries.push({
        courseId: course._id,
        courseName: course.name,
        totalSessions,
        attended,
        missed: totalSessions - attended,
      });
    }

    res.json({
      student: {
        _id: student._id,
        fullName: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        email: student.userId?.email,
      },
      courseSummaries,
      attendanceHistory: history.map(r => ({
        _id: r._id,
        date: r.date,
        courseName: r.course?.name || 'General',
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// By Grade
router.get('/grade/:grade', async (req, res) => {
  try {
    const grade = req.params.grade;
    const students = await Student.find({ grade }).populate('courses', 'name').lean();

    const result = [];
    for (const student of students) {
      const courseBreakdown = [];
      let totalAttended = 0, totalSessions = 0;
      for (const course of (student.courses || [])) {
        const sessions = (await Attendance.distinct('date', { course: course._id })).length;
        const attended = await Attendance.countDocuments({ student: student._id, course: course._id });
        courseBreakdown.push({ courseName: course.name, attended, totalSessions: sessions });
        totalAttended += attended;
        totalSessions += sessions;
      }
      result.push({
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        courses: courseBreakdown,
        overallAttended: totalAttended,
        overallSessions: totalSessions,
      });
    }

    res.json({ grade, students: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// By Course
router.get('/course/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('teacher', 'fullName').lean();
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const students = await Student.find({ courses: course._id }).lean();
    const totalSessions = (await Attendance.distinct('date', { course: course._id })).length;

    const studentSummaries = [];
    for (const student of students) {
      const attended = await Attendance.countDocuments({ student: student._id, course: course._id });
      studentSummaries.push({
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        attended,
        totalSessions,
      });
    }

    res.json({ course: { _id: course._id, name: course.name, teacherName: course.teacher?.fullName }, totalSessions, students: studentSummaries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// By Teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const teacher = await User.findById(req.params.teacherId).lean();
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    const courses = await Course.find({ teacher: teacher._id }).lean();
    const coursesData = [];

    for (const course of courses) {
      const students = await Student.find({ courses: course._id }).lean();
      const totalSessions = (await Attendance.distinct('date', { course: course._id })).length;
      const studentSummaries = [];
      for (const student of students) {
        const attended = await Attendance.countDocuments({ student: student._id, course: course._id });
        studentSummaries.push({ studentId: student._id, studentName: `${student.firstName} ${student.lastName}`, attended, totalSessions });
      }
      coursesData.push({ courseId: course._id, courseName: course.name, totalSessions, students: studentSummaries });
    }

    res.json({ teacher: { _id: teacher._id, fullName: teacher.fullName, email: teacher.email }, courses: coursesData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// By Date
router.get('/date', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'date query parameter is required (YYYY-MM-DD)' });

    const startOfDay = new Date(date);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23,59,59,999);

    const records = await Attendance.find({ date: { $gte: startOfDay, $lte: endOfDay } })
      .populate('student', 'firstName lastName grade')
      .populate('course', 'name')
      .sort({ date: 1 })
      .lean();

    res.json({
      date,
      records: records.map(r => ({
        _id: r._id,
        time: r.date,
        studentName: `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim(),
        courseName: r.course?.name || 'General',
        grade: r.student?.grade || '',
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;