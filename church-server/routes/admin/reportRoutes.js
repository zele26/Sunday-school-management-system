// routes/admin/reportRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../../models/Student');
const Course = require('../../models/Course');
const Attendance = require('../../models/Attendance');
const User = require('../../models/User');

// ---------- 1. By Student Report ----------
router.get('/student/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .populate('userId', 'email phone fullName')
      .populate({
        path: 'courses',
        select: 'name code teacher grade shift',
        populate: { path: 'teacher', select: 'fullName email phone' },
      })
      .lean();
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const history = await Attendance.find({ student: student._id })
      .populate('course', 'name code')
      .populate('teacher', 'fullName')
      .sort({ date: -1 })
      .lean();

    const courseSummaries = [];
    let totalAttendedAll = 0;
    let totalSessionsAll = 0;

    const studentCourses = student.courses || [];
    for (const course of studentCourses) {
      const distinctSessions = await Attendance.distinct('date', { course: course._id });
      const totalSessions = Math.max(distinctSessions.length, 0);
      const attended = await Attendance.countDocuments({ student: student._id, course: course._id, status: { $ne: 'Absent' } });
      const missed = Math.max(0, totalSessions - attended);
      const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : (attended > 0 ? 100 : 0);

      totalAttendedAll += attended;
      totalSessionsAll += totalSessions;

      courseSummaries.push({
        courseId: course._id,
        courseName: course.name,
        courseCode: course.code || '—',
        teacherName: course.teacher?.fullName || 'ያልተመደበ',
        grade: course.grade || student.grade || '—',
        totalSessions,
        attended,
        missed,
        rate,
      });
    }

    const overallRate = totalSessionsAll > 0 ? Math.round((totalAttendedAll / totalSessionsAll) * 100) : (totalAttendedAll > 0 ? 100 : 0);

    const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || student.fullName || 'ስም ያልተጠቀሰ';

    res.json({
      success: true,
      student: {
        _id: student._id,
        fullName,
        studentId: student.studentId || '—',
        grade: student.grade || '—',
        studentType: student.studentType || 'regular',
        shift: student.shift || 'weekend',
        phone: student.studentPhone || student.contactPhone || student.userId?.phone || '—',
        email: student.userId?.email || student.email || '—',
      },
      summary: {
        totalCourses: studentCourses.length,
        totalSessions: totalSessionsAll,
        totalAttended: totalAttendedAll,
        totalMissed: Math.max(0, totalSessionsAll - totalAttendedAll),
        overallRate,
      },
      courseSummaries,
      attendanceHistory: history.map((r) => ({
        _id: r._id,
        date: r.date,
        checkInTime: r.checkInTime || r.date,
        courseName: r.course?.name || r.courseName || 'አጠቃላይ (General)',
        courseCode: r.course?.code || '—',
        teacherName: r.teacherName || r.teacher?.fullName || '—',
        status: r.status || 'Present',
        shift: r.shift || student.shift || 'weekend',
        session: r.session || 'መደበኛ',
      })),
    });
  } catch (err) {
    console.error('Report by student error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 2. By Grade Report ----------
router.get('/grade/:grade', async (req, res) => {
  try {
    const grade = req.params.grade;
    const students = await Student.find({ grade })
      .populate('userId', 'email phone fullName')
      .populate('courses', 'name code')
      .lean();

    const result = [];
    let grandAttended = 0;
    let grandSessions = 0;

    for (const student of students) {
      const courseBreakdown = [];
      let totalAttended = 0;
      let totalSessions = 0;

      for (const course of (student.courses || [])) {
        const sessions = (await Attendance.distinct('date', { course: course._id })).length;
        const attended = await Attendance.countDocuments({ student: student._id, course: course._id, status: { $ne: 'Absent' } });
        const rate = sessions > 0 ? Math.round((attended / sessions) * 100) : (attended > 0 ? 100 : 0);
        courseBreakdown.push({
          courseName: course.name,
          courseCode: course.code || '',
          attended,
          totalSessions: sessions,
          rate,
        });
        totalAttended += attended;
        totalSessions += sessions;
      }

      grandAttended += totalAttended;
      grandSessions += totalSessions;

      const studentRate = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : (totalAttended > 0 ? 100 : 0);
      const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || student.fullName || 'ተማሪ';

      result.push({
        studentId: student._id,
        studentCustomId: student.studentId || '—',
        studentName: fullName,
        studentType: student.studentType || 'regular',
        shift: student.shift || 'weekend',
        phone: student.studentPhone || student.contactPhone || '—',
        email: student.userId?.email || '—',
        courses: courseBreakdown,
        overallAttended: totalAttended,
        overallSessions: totalSessions,
        overallMissed: Math.max(0, totalSessions - totalAttended),
        overallRate: studentRate,
      });
    }

    const averageRate = grandSessions > 0 ? Math.round((grandAttended / grandSessions) * 100) : 0;

    res.json({
      success: true,
      grade,
      summary: {
        totalStudents: students.length,
        totalSessions: grandSessions,
        totalAttended: grandAttended,
        averageRate,
      },
      students: result,
    });
  } catch (err) {
    console.error('Report by grade error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 3. By Course Report ----------
router.get('/course/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('teacher', 'fullName email phone')
      .lean();
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const students = await Student.find({ courses: course._id })
      .populate('userId', 'email phone')
      .lean();
    const totalSessions = (await Attendance.distinct('date', { course: course._id })).length;

    const studentSummaries = [];
    let totalAttendedInCourse = 0;

    for (const student of students) {
      const attended = await Attendance.countDocuments({ student: student._id, course: course._id, status: { $ne: 'Absent' } });
      const missed = Math.max(0, totalSessions - attended);
      const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : (attended > 0 ? 100 : 0);
      totalAttendedInCourse += attended;

      const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || student.fullName || 'ተማሪ';

      studentSummaries.push({
        studentId: student._id,
        studentCustomId: student.studentId || '—',
        studentName: fullName,
        grade: student.grade || course.grade || '—',
        phone: student.studentPhone || student.contactPhone || '—',
        email: student.userId?.email || '—',
        attended,
        missed,
        totalSessions,
        rate,
      });
    }

    const averageRate = (students.length > 0 && totalSessions > 0)
      ? Math.round((totalAttendedInCourse / (students.length * totalSessions)) * 100)
      : 0;

    res.json({
      success: true,
      course: {
        _id: course._id,
        name: course.name,
        code: course.code || '—',
        grade: course.grade || '—',
        shift: course.shift || '—',
        teacherName: course.teacher?.fullName || 'ያልተመደበ',
        teacherEmail: course.teacher?.email || '',
        teacherPhone: course.teacher?.phone || '',
      },
      summary: {
        totalEnrolled: students.length,
        totalSessions,
        averageRate,
      },
      students: studentSummaries,
    });
  } catch (err) {
    console.error('Report by course error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 4. By Teacher Report ----------
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const teacher = await User.findById(req.params.teacherId).lean();
    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const courses = await Course.find({ teacher: teacher._id }).lean();
    const coursesData = [];
    let grandTotalStudents = 0;

    for (const course of courses) {
      const students = await Student.find({ courses: course._id })
        .populate('userId', 'email')
        .lean();
      const totalSessions = (await Attendance.distinct('date', { course: course._id })).length;
      const studentSummaries = [];
      grandTotalStudents += students.length;

      for (const student of students) {
        const attended = await Attendance.countDocuments({ student: student._id, course: course._id, status: { $ne: 'Absent' } });
        const missed = Math.max(0, totalSessions - attended);
        const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : (attended > 0 ? 100 : 0);
        const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || student.fullName || 'ተማሪ';

        studentSummaries.push({
          studentId: student._id,
          studentCustomId: student.studentId || '—',
          studentName: fullName,
          grade: student.grade || course.grade || '—',
          attended,
          missed,
          totalSessions,
          rate,
        });
      }
      coursesData.push({
        courseId: course._id,
        courseName: course.name,
        courseCode: course.code || '—',
        grade: course.grade || '—',
        totalSessions,
        enrolledCount: students.length,
        students: studentSummaries,
      });
    }

    res.json({
      success: true,
      teacher: {
        _id: teacher._id,
        fullName: teacher.fullName,
        email: teacher.email || '—',
        phone: teacher.phone || '—',
      },
      summary: {
        totalCourses: courses.length,
        totalStudents: grandTotalStudents,
      },
      courses: coursesData,
    });
  } catch (err) {
    console.error('Report by teacher error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 5. By Date Report ----------
router.get('/date', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'date query parameter is required (YYYY-MM-DD)' });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await Attendance.find({ date: { $gte: startOfDay, $lte: endOfDay } })
      .populate('student', 'firstName middleName lastName studentId grade studentType shift')
      .populate('course', 'name code')
      .populate('teacher', 'fullName')
      .sort({ date: 1 })
      .lean();

    const formattedRecords = records.map((r) => {
      const studentName = r.student
        ? [r.student.firstName, r.student.middleName, r.student.lastName].filter(Boolean).join(' ')
        : (r.studentName || 'ተማሪ');
      return {
        _id: r._id,
        time: r.checkInTime || r.date,
        studentId: r.student?.studentId || '—',
        studentName,
        studentType: r.studentType || r.student?.studentType || 'regular',
        shift: r.shift || r.student?.shift || 'weekend',
        grade: r.grade || r.student?.grade || '—',
        courseName: r.course?.name || r.courseName || 'አጠቃላይ (General)',
        courseCode: r.course?.code || '—',
        teacherName: r.teacherName || r.teacher?.fullName || '—',
        status: r.status || 'Present',
      };
    });

    res.json({
      success: true,
      date,
      summary: {
        totalPresent: formattedRecords.length,
      },
      records: formattedRecords,
    });
  } catch (err) {
    console.error('Report by date error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;