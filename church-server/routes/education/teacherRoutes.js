// routes/education/teacherRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const Student = require('../../models/Student');
const Course = require('../../models/education/Course');
const Attendance = require('../../models/education/Attendance');
const Teacher = require('../../models/Teacher');

// All routes require a valid token and teacher (or admin) role
router.use(protect);
router.use(authorize('teacher', 'admin'));

// ---------- Teacher Profile ----------
router.get('/profile', async (req, res) => {
  try {
    const user = req.user;
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

// ---------- Teacher Attendance Report ----------
router.get('/attendance', async (req, res) => {
  try {
    const { startDate, endDate, courseId } = req.query;
    const teacherDoc = await Teacher.findOne({ userId: req.user._id }).select('_id');
    const teacherIds = [req.user._id];
    if (teacherDoc) teacherIds.push(teacherDoc._id);

    const [teacherCourses, teacherStudents] = await Promise.all([
      Course.find({ $or: [{ teacher: { $in: teacherIds } }, { instructors: { $in: teacherIds } }] }).select('_id'),
      Student.find({ $or: [{ teacher: { $in: teacherIds } }, { teachers: { $in: teacherIds } }] }).select('_id'),
    ]);

    const courseIds = teacherCourses.map((c) => c._id);
    const studentIds = teacherStudents.map((s) => s._id);

    const query = {};
    if (courseId) {
      query.course = courseId;
    } else {
      const orClauses = [{ teacher: { $in: teacherIds } }, { recordedBy: req.user._id }];
      if (courseIds.length > 0) orClauses.push({ course: { $in: courseIds } });
      if (studentIds.length > 0) orClauses.push({ student: { $in: studentIds } });
      query.$or = orClauses;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        const s = new Date(startDate);
        s.setHours(0, 0, 0, 0);
        query.date.$gte = s;
      }
      if (endDate) {
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        query.date.$lte = e;
      }
    }

    const attendances = await Attendance.find(query)
      .populate('student', 'firstName middleName lastName christianName photoUrl grade studentId')
      .populate('course', 'name nameAmharic grade')
      .populate('sessionId', 'title grade sessionDate startTime endTime')
      .sort({ date: -1, checkInTime: -1 });

    res.json(attendances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher Attendance Summary ----------
router.get('/attendance-summary', async (req, res) => {
  try {
    const { courseId } = req.query;
    const teacherDoc = await Teacher.findOne({ userId: req.user._id }).select('_id');
    const teacherIds = [req.user._id];
    if (teacherDoc) teacherIds.push(teacherDoc._id);

    const courseFilter = {
      $or: [{ teacher: { $in: teacherIds } }, { instructors: { $in: teacherIds } }],
    };
    if (courseId) {
      courseFilter._id = courseId;
    }

    const courses = await Course.find(courseFilter).select('name nameAmharic grade studentType shift').lean();
    if (!courses.length) {
      return res.json([]);
    }

    const summaries = [];

    for (const course of courses) {
      // Fetch all attendance records for this course
      const courseAttendances = await Attendance.find({ course: course._id })
        .select('student status date sessionId')
        .lean();

      const uniqueSessionDays = new Set(
        courseAttendances.map((a) =>
          a.sessionId
            ? a.sessionId.toString()
            : (a.date ? new Date(a.date).toISOString().split('T')[0] : '')
        ).filter(Boolean)
      );
      const totalClasses = uniqueSessionDays.size;

      // Match students enrolled directly in the course, or fallback to course's grade/track
      let students = await Student.find({ courses: course._id })
        .select('firstName middleName lastName studentId grade shift _id')
        .sort({ firstName: 1, lastName: 1 })
        .lean();

      if (students.length === 0 && course.grade) {
        const gradeNum = course.grade.match(/\d+/);
        const studentFilter = {
          $or: gradeNum
            ? [
                { grade: { $regex: new RegExp(`(${gradeNum[0]}|${course.grade})`, 'i') } },
                { batch: { $regex: new RegExp(`(${gradeNum[0]}|${course.grade})`, 'i') } },
              ]
            : [{ grade: course.grade }, { batch: course.grade }],
        };
        if (course.studentType) {
          studentFilter.studentType = course.studentType;
        }
        students = await Student.find(studentFilter)
          .select('firstName middleName lastName studentId grade shift _id')
          .sort({ firstName: 1, lastName: 1 })
          .lean();
      }

      // Group attendance records by student
      const byStudent = new Map();
      for (const a of courseAttendances) {
        const sId = a.student?.toString();
        if (!sId) continue;
        if (!byStudent.has(sId)) {
          byStudent.set(sId, { present: 0, late: 0, excused: 0, absent: 0, total: 0 });
        }
        const entry = byStudent.get(sId);
        entry.total += 1;
        if (a.status === 'Present') entry.present += 1;
        else if (a.status === 'Late') entry.late += 1;
        else if (a.status === 'Excused') entry.excused += 1;
        else if (a.status === 'Absent') entry.absent += 1;
      }

      const studentSummaries = students.map((student) => {
        const sStats = byStudent.get(student._id.toString()) || { present: 0, late: 0, excused: 0, absent: 0, total: 0 };
        const attended = sStats.present + sStats.late;
        const denominator = Math.max(totalClasses, sStats.total);
        const attendanceRate = denominator > 0 ? Math.round((attended / denominator) * 100) : null;

        return {
          studentId: student._id,
          studentCode: student.studentId || '',
          studentName: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ').trim(),
          grade: student.grade || '',
          present: sStats.present,
          late: sStats.late,
          excused: sStats.excused,
          absent: sStats.absent,
          attended,
          totalClasses: denominator,
          attendanceRate,
          isAtRisk: attendanceRate !== null && attendanceRate < 75,
        };
      });

      const ratesWithData = studentSummaries.filter((s) => s.attendanceRate !== null);
      const averageRate = ratesWithData.length > 0
        ? Math.round(ratesWithData.reduce((acc, s) => acc + s.attendanceRate, 0) / ratesWithData.length)
        : 0;
      const atRiskCount = studentSummaries.filter((s) => s.isAtRisk).length;

      summaries.push({
        courseId: course._id,
        courseName: course.name,
        grade: course.grade || '',
        totalClasses,
        averageRate,
        atRiskCount,
        students: studentSummaries,
      });
    }

    res.json(summaries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher Dashboard Stats ----------
router.get('/dashboard-stats', async (req, res) => {
  try {
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
