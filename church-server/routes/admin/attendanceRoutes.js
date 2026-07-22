// routes/admin/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const Attendance = require('../../models/Attendance');
const Student = require('../../models/Student');
const Course = require('../../models/Course');

// ---------- Scan QR and record attendance (full data stored) ----------
router.post('/scan', async (req, res) => {
  try {
    const { qrCode, courseId, status: forcedStatus } = req.body;
    if (!qrCode) return res.status(400).json({ message: 'QR code data required' });

    const student = await Student.findOne({ qrCode });
    if (!student) return res.status(404).json({ message: 'Invalid QR code. Student not found.' });

    // Look up course and teacher if a courseId is provided
    let courseName = '';
    let teacher = null;
    let teacherName = '';
    if (courseId) {
      const course = await Course.findById(courseId).populate('teacher', 'fullName');
      if (course) {
        courseName = course.name;
        if (course.teacher) {
          teacher = course.teacher._id;
          teacherName = course.teacher.fullName;
        }
      }
    }

    // Duplicate check for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const alreadyMarked = await Attendance.findOne({
      student: student._id,
      date: { $gte: today, $lt: tomorrow },
      ...(courseId ? { course: courseId } : {}),
    });
    if (alreadyMarked) {
      return res.json({
        success: true,
        message: 'Attendance already recorded for today.',
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
        },
      });
    }

    // Determine academic year and semester
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan, 11 = Dec
    const year = now.getFullYear();
    let academicYear, semester;
    if (month >= 5 && month <= 11) {   // June - December
      academicYear = `${year}/${year + 1}`;
      semester = 'First';
    } else {                           // January - May
      academicYear = `${year - 1}/${year}`;
      semester = 'Second';
    }

    // Create the fully populated document – use forcedStatus if provided, else default to Present
    await Attendance.create({
      student: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      grade: student.grade || '',
      course: courseId || null,
      courseName,
      teacher,
      teacherName,
      date: today,
      checkInTime: new Date(),
      status: forcedStatus || 'Present',
      recordedBy: req.user._id,
      academicYear,
      semester,
    });

    res.json({
      success: true,
      message: 'Attendance recorded.',
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Manual attendance (admin marks attendance without QR) ----------
router.post('/manual', async (req, res) => {
  try {
    const { studentId, courseId, status: forcedStatus } = req.body;
    if (!studentId) return res.status(400).json({ message: 'Student ID required' });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // Duplicate check for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const alreadyMarked = await Attendance.findOne({
      student: student._id,
      date: { $gte: today, $lt: tomorrow },
      ...(courseId ? { course: courseId } : {}),
    });
    if (alreadyMarked) {
      return res.json({
        success: true,
        message: 'Attendance already recorded for today.',
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
        },
      });
    }

    // Look up course and teacher if a courseId is provided
    let courseName = '';
    let teacher = null;
    let teacherName = '';
    if (courseId) {
      const course = await Course.findById(courseId).populate('teacher', 'fullName');
      if (course) {
        courseName = course.name;
        if (course.teacher) {
          teacher = course.teacher._id;
          teacherName = course.teacher.fullName;
        }
      }
    }

    // Determine academic year and semester (same logic as scan)
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    let academicYear, semester;
    if (month >= 5 && month <= 11) {
      academicYear = `${year}/${year + 1}`;
      semester = 'First';
    } else {
      academicYear = `${year - 1}/${year}`;
      semester = 'Second';
    }

    // Create the attendance record
    await Attendance.create({
      student: student._id,
      studentName: `${student.firstName} ${student.lastName}`,
      grade: student.grade || '',
      course: courseId || null,
      courseName,
      teacher,
      teacherName,
      date: today,
      checkInTime: new Date(),
      status: forcedStatus || 'Present',
      recordedBy: req.user._id,
      academicYear,
      semester,
    });

    res.json({
      success: true,
      message: 'Attendance recorded.',
      student: {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Basic attendance report (admin) ----------
router.get('/report', async (req, res) => {
  try {
    const { startDate, endDate, courseId } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (courseId) query.course = courseId;

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