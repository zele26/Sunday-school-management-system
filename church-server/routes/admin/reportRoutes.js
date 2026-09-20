// routes/admin/reportRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Student = require('../../models/Student');
const Course = require('../../models/Course');
const Attendance = require('../../models/Attendance');
const User = require('../../models/User');

const toObjectId = (id) => {
  try {
    return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
  } catch {
    return null;
  }
};

// ---------- 1. By Student Report ----------
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentObjId = toObjectId(req.params.studentId);
    if (!studentObjId) {
      return res.status(400).json({ success: false, message: 'Invalid Student ID format' });
    }

    // Parallel fetch: Student info & Attendance history (both with .lean())
    const [student, history] = await Promise.all([
      Student.findById(studentObjId)
        .populate('userId', 'email phone fullName')
        .populate({
          path: 'courses',
          select: 'name code teacher grade shift',
          populate: { path: 'teacher', select: 'fullName email phone' },
        })
        .lean(),
      Attendance.find({ student: studentObjId })
        .populate('course', 'name code')
        .populate('teacher', 'fullName')
        .sort({ date: -1 })
        .lean()
    ]);

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const studentCourses = student.courses || [];
    const courseIds = studentCourses.map((c) => toObjectId(c._id)).filter(Boolean);

    // Single-pass aggregation for all courses assigned to this student
    const courseStatsAggregation = courseIds.length > 0 ? await Attendance.aggregate([
      { $match: { course: { $in: courseIds } } },
      {
        $group: {
          _id: { course: '$course', date: '$date' },
          hasStudent: {
            $max: {
              $cond: [
                { $and: [{ $eq: ['$student', studentObjId] }, { $ne: ['$status', 'Absent'] }] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: '$_id.course',
          totalSessions: { $sum: 1 },
          attended: { $sum: '$hasStudent' }
        }
      }
    ]) : [];

    const statsMap = {};
    courseStatsAggregation.forEach((s) => {
      statsMap[s._id.toString()] = s;
    });

    const courseSummaries = [];
    let totalAttendedAll = 0;
    let totalSessionsAll = 0;

    for (const course of studentCourses) {
      const cIdStr = course._id.toString();
      const stats = statsMap[cIdStr] || { totalSessions: 0, attended: 0 };
      const totalSessions = stats.totalSessions || 0;
      const attended = stats.attended || 0;
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

// ---------- 2. By Grade Report (High-Performance Parallel Aggregations) ----------
router.get('/grade/:grade', async (req, res) => {
  try {
    const grade = req.params.grade;
    const students = await Student.find({ grade })
      .populate('userId', 'email phone fullName')
      .populate('courses', 'name code')
      .lean();

    if (!students || students.length === 0) {
      return res.json({
        success: true,
        grade,
        summary: { totalStudents: 0, totalSessions: 0, totalAttended: 0, averageRate: 0 },
        students: [],
      });
    }

    const studentIds = students.map((s) => s._id);
    const allCourseIds = Array.from(new Set(
      students.flatMap((s) => (s.courses || []).map((c) => toObjectId(c._id))).filter(Boolean)
    ));

    // Parallel Aggregation Pipeline: 
    // 1. Total distinct sessions per course
    // 2. Total attendances per student per course
    const [courseSessionsAgg, studentAttendanceAgg] = await Promise.all([
      allCourseIds.length > 0 ? Attendance.aggregate([
        { $match: { course: { $in: allCourseIds } } },
        { $group: { _id: { course: '$course', date: '$date' } } },
        { $group: { _id: '$_id.course', totalSessions: { $sum: 1 } } }
      ]) : [],
      Attendance.aggregate([
        { $match: { student: { $in: studentIds }, status: { $ne: 'Absent' } } },
        {
          $group: {
            _id: { student: '$student', course: '$course' },
            attended: { $sum: 1 }
          }
        }
      ])
    ]);

    const courseSessionsMap = {};
    courseSessionsAgg.forEach((c) => {
      courseSessionsMap[c._id.toString()] = c.totalSessions;
    });

    const studentAttendanceMap = {};
    studentAttendanceAgg.forEach((item) => {
      const key = `${item._id.student?.toString()}_${item._id.course?.toString() || 'null'}`;
      studentAttendanceMap[key] = item.attended;
    });

    const result = [];
    let grandAttended = 0;
    let grandSessions = 0;

    for (const student of students) {
      const courseBreakdown = [];
      let totalAttended = 0;
      let totalSessions = 0;

      for (const course of (student.courses || [])) {
        const cIdStr = course._id.toString();
        const sessions = courseSessionsMap[cIdStr] || 0;
        const attended = studentAttendanceMap[`${student._id.toString()}_${cIdStr}`] || 0;
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

// ---------- 3. By Course Report (Parallel Single-Pass Aggregation) ----------
router.get('/course/:courseId', async (req, res) => {
  try {
    const courseObjId = toObjectId(req.params.courseId);
    if (!courseObjId) {
      return res.status(400).json({ success: false, message: 'Invalid Course ID format' });
    }

    // Parallel fetch: Course info, Enrolled students, Total distinct dates, Student attendance counts
    const [course, students, totalSessionsData, studentStatsAgg] = await Promise.all([
      Course.findById(courseObjId).populate('teacher', 'fullName email phone').lean(),
      Student.find({ courses: courseObjId }).populate('userId', 'email phone').lean(),
      Attendance.aggregate([
        { $match: { course: courseObjId } },
        { $group: { _id: '$date' } },
        { $count: 'total' }
      ]),
      Attendance.aggregate([
        { $match: { course: courseObjId, status: { $ne: 'Absent' } } },
        { $group: { _id: '$student', attended: { $sum: 1 } } }
      ])
    ]);

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const totalSessions = totalSessionsData[0]?.total || 0;
    const studentAttendanceMap = {};
    studentStatsAgg.forEach((s) => {
      studentAttendanceMap[s._id.toString()] = s.attended;
    });

    const studentSummaries = [];
    let totalAttendedInCourse = 0;

    for (const student of students) {
      const attended = studentAttendanceMap[student._id.toString()] || 0;
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

// ---------- 4. By Teacher Report (Parallel Aggregation) ----------
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const teacherObjId = toObjectId(req.params.teacherId);
    if (!teacherObjId) {
      return res.status(400).json({ success: false, message: 'Invalid Teacher ID format' });
    }

    const [teacher, courses] = await Promise.all([
      User.findById(teacherObjId).lean(),
      Course.find({ teacher: teacherObjId }).lean()
    ]);

    if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

    const courseIds = courses.map((c) => toObjectId(c._id)).filter(Boolean);

    // Parallel fetch: Enrolled students, distinct session counts, student attendance per course
    const [allStudents, courseSessionsAgg, studentAttendanceAgg] = await Promise.all([
      courseIds.length > 0 ? Student.find({ courses: { $in: courseIds } }).populate('userId', 'email').lean() : [],
      courseIds.length > 0 ? Attendance.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: { course: '$course', date: '$date' } } },
        { $group: { _id: '$_id.course', totalSessions: { $sum: 1 } } }
      ]) : [],
      courseIds.length > 0 ? Attendance.aggregate([
        { $match: { course: { $in: courseIds }, status: { $ne: 'Absent' } } },
        { $group: { _id: { course: '$course', student: '$student' }, attended: { $sum: 1 } } }
      ]) : []
    ]);

    const courseSessionsMap = {};
    courseSessionsAgg.forEach((c) => {
      courseSessionsMap[c._id.toString()] = c.totalSessions;
    });

    const studentAttendanceMap = {};
    studentAttendanceAgg.forEach((item) => {
      const key = `${item._id.course?.toString()}_${item._id.student?.toString()}`;
      studentAttendanceMap[key] = item.attended;
    });

    const coursesData = [];
    let grandTotalStudents = 0;

    for (const course of courses) {
      const cIdStr = course._id.toString();
      const courseStudents = allStudents.filter((s) => (s.courses || []).some((c) => (c._id || c).toString() === cIdStr));
      const totalSessions = courseSessionsMap[cIdStr] || 0;
      const studentSummaries = [];
      grandTotalStudents += courseStudents.length;

      for (const student of courseStudents) {
        const attended = studentAttendanceMap[`${cIdStr}_${student._id.toString()}`] || 0;
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
        enrolledCount: courseStudents.length,
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

// ---------- 5. By Date Report (Indexed Range with .lean()) ----------
router.get('/date', async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'date query parameter is required (YYYY-MM-DD)' });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const records = await Attendance.find({ date: { $gte: startOfDay, $lte: endOfDay } })
      .select('student course teacher date checkInTime status shift session studentName grade courseName teacherName')
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