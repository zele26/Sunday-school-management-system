// routes/admin/reportRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Student = require('../../models/Student');
const Course = require('../../models/Course');
const Attendance = require('../../models/Attendance');
const User = require('../../models/User');
const ClassSession = require('../../models/education/ClassSession');

const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

    // Also include general grade attendance records (where course is null or not in courseIds)
    const generalRecords = history.filter((r) => !r.course || !courseIds.some(cid => cid.toString() === (r.course._id || r.course).toString()));
    if (generalRecords.length > 0) {
      const generalAttended = generalRecords.filter((r) => r.status === 'Present' || r.status === 'Late').length;
      const generalMissed = generalRecords.filter((r) => r.status === 'Absent').length;
      const generalTotal = generalRecords.length;
      const generalRate = generalTotal > 0 ? Math.round((generalAttended / generalTotal) * 100) : 0;

      courseSummaries.push({
        courseId: 'general',
        courseName: 'አጠቃላይ የክፍለ-ጊዜ ተገኝነት (General Sessions)',
        courseCode: 'GEN',
        teacherName: 'የሰንበት ት/ቤት',
        grade: student.grade || '—',
        totalSessions: generalTotal,
        attended: generalAttended,
        missed: generalMissed,
        rate: generalRate,
      });

      totalAttendedAll += generalAttended;
      totalSessionsAll += generalTotal;
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

// ---------- 2. By Grade Report (Comprehensive Session & Attendance Aggregations) ----------
router.get('/grade/:grade', async (req, res) => {
  try {
    const rawGrade = req.params.grade;
    const { shift, studentType, startDate, endDate, totalSessionsOverride, customSessions } = req.query;

    // 1. Build grade matching regex (handles 'Grade 9', '9', '9ኛ', 'Batch 1', etc.)
    const gradeNum = rawGrade.match(/\d+/);
    const gradeRegex = gradeNum
      ? new RegExp(`(${gradeNum[0]}|${escapeRegex(rawGrade)})`, 'i')
      : new RegExp(escapeRegex(rawGrade), 'i');

    const studentQuery = {
      $or: [
        { grade: gradeRegex },
        { batch: gradeRegex },
      ],
    };

    // 2. Shift filtering: weekend vs night
    if (shift && shift !== 'all') {
      if (shift === 'night') {
        studentQuery.shift = 'night';
      } else if (shift === 'weekend' || shift === 'day') {
        studentQuery.shift = { $in: ['weekend', 'day', '', null] };
      } else {
        studentQuery.shift = shift;
      }
    }

    // 3. Student type filtering: regular vs distance
    if (studentType && studentType !== 'all') {
      studentQuery.studentType = { $regex: new RegExp(`^${escapeRegex(studentType)}$`, 'i') };
    }

    const students = await Student.find(studentQuery)
      .populate('userId', 'email phone fullName')
      .populate('courses', 'name code')
      .sort({ firstName: 1, lastName: 1 })
      .lean();

    if (!students || students.length === 0) {
      return res.json({
        success: true,
        grade: rawGrade,
        filters: {
          shift: shift || 'all',
          studentType: studentType || 'all',
          startDate: startDate || null,
          endDate: endDate || null,
        },
        summary: {
          totalStudents: 0,
          totalSessions: 0,
          totalAttended: 0,
          totalLate: 0,
          totalExcused: 0,
          totalAbsent: 0,
          averageRate: 0,
        },
        students: [],
      });
    }

    const studentIds = students.map((s) => s._id);

    // 4. Build Date Range Filter
    const dateQuery = {};
    let sessionDateQuery = {};
    if (startDate && endDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      dateQuery.date = { $gte: s, $lte: e };
      sessionDateQuery = {
        sessionDate: {
          $gte: s.toISOString().split('T')[0],
          $lte: e.toISOString().split('T')[0],
        },
      };
    } else if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      dateQuery.date = { $gte: s };
      sessionDateQuery = { sessionDate: { $gte: s.toISOString().split('T')[0] } };
    } else if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      dateQuery.date = { $lte: e };
      sessionDateQuery = { sessionDate: { $lte: e.toISOString().split('T')[0] } };
    }

    // 5. Query all Attendance records for these students in this grade / date range
    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
      ...dateQuery,
    }).sort({ date: -1, checkInTime: -1 }).lean();

    // 6. Query ClassSessions held for this grade / shift
    const sessionQuery = {
      $or: [
        { grade: gradeRegex },
        { targetGrades: gradeRegex },
        { isCombinedSession: true },
      ],
      status: { $in: ['closed', 'open', 'completed', 'active'] },
      ...sessionDateQuery,
    };
    if (shift && shift !== 'all') {
      if (shift === 'night') {
        sessionQuery.$and = [
          { $or: [{ shift: 'night' }, { targetShifts: 'night' }] }
        ];
      } else if (shift === 'weekend' || shift === 'day') {
        sessionQuery.$and = [
          { $or: [{ shift: { $in: ['weekend', 'day', 'all', '', null] } }, { targetShifts: { $in: ['weekend', 'day', 'all'] } }] }
        ];
      }
    }
    const classSessions = await ClassSession.find(sessionQuery).select('_id sessionDate title grade shift status').lean().catch(() => []);

    // 7. Calculate total distinct sessions held for this class
    const distinctSessionKeys = new Set();
    classSessions.forEach((cs) => {
      distinctSessionKeys.add(cs._id.toString());
    });
    attendanceRecords.forEach((att) => {
      if (att.sessionId) {
        distinctSessionKeys.add(att.sessionId.toString());
      } else if (att.date) {
        const dateStr = new Date(att.date).toISOString().split('T')[0];
        const sName = att.session || att.courseName || 'regular';
        distinctSessionKeys.add(`${dateStr}_${sName}`);
      }
    });

    const parsedOverride = parseInt(totalSessionsOverride || customSessions, 10);
    const hasManualOverride = !isNaN(parsedOverride) && parsedOverride > 0;
    const totalSessionsHeld = hasManualOverride ? parsedOverride : distinctSessionKeys.size;

    // 8. Map attendance per student
    // Group records by session (or date if no sessionId) to ensure clean single-status per session
    const studentRecordsMap = new Map();
    for (const att of attendanceRecords) {
      const sId = att.student.toString();
      if (!studentRecordsMap.has(sId)) {
        studentRecordsMap.set(sId, new Map());
      }
      const sessionMap = studentRecordsMap.get(sId);
      const sessionKey = att.sessionId ? att.sessionId.toString() : (att.date ? new Date(att.date).toISOString().split('T')[0] : att._id.toString());

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, att);
      } else {
        const existing = sessionMap.get(sessionKey);
        // Non-Absent status ('Present', 'Late', 'Excused') ALWAYS takes priority over 'Absent'
        if (existing.status === 'Absent' && att.status !== 'Absent') {
          sessionMap.set(sessionKey, att);
        }
      }
    }

    const result = [];
    let grandAttended = 0;
    let grandSessions = 0;
    let grandLate = 0;
    let grandExcused = 0;
    let grandAbsent = 0;

    for (const student of students) {
      const sId = student._id.toString();
      const sessionMap = studentRecordsMap.get(sId) || new Map();
      const dedupedRecords = Array.from(sessionMap.values());

      let attended = 0;
      let late = 0;
      let excused = 0;
      let absent = 0;

      for (const r of dedupedRecords) {
        if (r.status === 'Present') attended++;
        else if (r.status === 'Late') {
          attended++;
          late++;
        } else if (r.status === 'Excused') excused++;
        else if (r.status === 'Absent') absent++;
      }

      // Expected sessions for this student:
      // If manual override is specified, use totalSessionsHeld strictly; otherwise at least totalSessionsHeld
      const studentTotalSessions = hasManualOverride ? totalSessionsHeld : Math.max(totalSessionsHeld, dedupedRecords.length);
      const missed = Math.max(0, studentTotalSessions - attended - excused);
      const studentRate = studentTotalSessions > 0 ? Math.round((attended / studentTotalSessions) * 100) : (attended > 0 ? 100 : 0);

      grandAttended += attended;
      grandSessions += studentTotalSessions;
      grandLate += late;
      grandExcused += excused;
      grandAbsent += (absent + missed);

      const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || student.fullName || 'ተማሪ';

      result.push({
        studentId: student._id,
        studentCustomId: student.studentId || '—',
        studentName: fullName,
        studentType: student.studentType || 'regular',
        shift: student.shift || 'weekend',
        phone: student.studentPhone || student.contactPhone || '—',
        email: student.userId?.email || '—',
        attended,
        late,
        excused,
        absent: absent + missed,
        overallAttended: attended,
        overallSessions: studentTotalSessions,
        overallMissed: missed,
        overallRate: studentRate,
      });
    }

    const averageRate = grandSessions > 0
      ? Math.round((grandAttended / grandSessions) * 100)
      : (students.length > 0 ? Math.round(result.reduce((acc, s) => acc + s.overallRate, 0) / students.length) : 0);

    res.json({
      success: true,
      grade: rawGrade,
      filters: {
        shift: shift || 'all',
        studentType: studentType || 'all',
        startDate: startDate || null,
        endDate: endDate || null,
      },
      summary: {
        totalStudents: students.length,
        totalSessions: totalSessionsHeld,
        isManuallyAdjusted: hasManualOverride,
        totalAttended: grandAttended,
        totalLate: grandLate,
        totalExcused: grandExcused,
        totalAbsent: grandAbsent,
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
    const { date, shift, grade } = req.query;
    if (!date) return res.status(400).json({ success: false, message: 'date query parameter is required (YYYY-MM-DD)' });

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = { date: { $gte: startOfDay, $lte: endOfDay } };

    if (shift && shift !== 'all') {
      if (shift === 'night') query.shift = 'night';
      else if (shift === 'weekend' || shift === 'day') query.shift = { $in: ['weekend', 'day', '', null] };
      else query.shift = shift;
    }

    if (grade && grade !== 'all') {
      const num = grade.match(/\d+/);
      const gradeRegex = num ? new RegExp(`(${num[0]}|${escapeRegex(grade)})`, 'i') : new RegExp(escapeRegex(grade), 'i');
      query.$or = [{ grade: gradeRegex }, { batch: gradeRegex }];
    }

    const records = await Attendance.find(query)
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
        totalPresent: formattedRecords.filter(r => r.status === 'Present' || r.status === 'Late').length,
        totalLate: formattedRecords.filter(r => r.status === 'Late').length,
        totalAbsent: formattedRecords.filter(r => r.status === 'Absent').length,
        totalExcused: formattedRecords.filter(r => r.status === 'Excused').length,
        totalRecords: formattedRecords.length,
      },
      records: formattedRecords,
    });
  } catch (err) {
    console.error('Report by date error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;