// routes/admin/reportRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Student = require('../../models/Student');
const Course = require('../../models/Course');
const Teacher = require('../../models/Teacher');
const Attendance = require('../../models/Attendance');
const User = require('../../models/User');
const ClassSession = require('../../models/education/ClassSession');
const { getEthiopianTimeInfo } = require('../../services/sessionAutoCloseService');

const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toObjectId = (id) => {
  try {
    return mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : null;
  } catch {
    return null;
  }
};

const getStudentFullName = (s) => {
  if (!s) return 'ተማሪ';
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ').trim() || s.fullName || 'ተማሪ';
};

// Helper: Deduplicate attendance records per student + session/date (Present/Late/Excused overrides Absent)
const deduplicateAttendanceRecords = (records) => {
  const map = new Map();
  for (const r of records) {
    const sId = r.student?._id ? r.student._id.toString() : (r.student ? r.student.toString() : (r.studentName || ''));
    const sessKey = r.sessionId?._id
      ? r.sessionId._id.toString()
      : (r.sessionId ? r.sessionId.toString() : (r.session || (r.course?._id ? r.course._id.toString() : (r.course ? r.course.toString() : 'general'))));
    const dateKey = r.date ? new Date(r.date).toISOString().split('T')[0] : '';
    const key = r.sessionId ? `${sId}__${sessKey}` : `${sId}__${sessKey}__${dateKey}`;

    if (!map.has(key)) {
      map.set(key, r);
    } else {
      const existing = map.get(key);
      if (existing.status === 'Absent' && r.status !== 'Absent') {
        map.set(key, r);
      }
    }
  }
  return Array.from(map.values());
};

// Helper: Build date range query
const buildDateRangeFilter = (startDate, endDate) => {
  const dateQuery = {};
  if (startDate && endDate) {
    const s = new Date(startDate);
    s.setHours(0, 0, 0, 0);
    const e = new Date(endDate);
    e.setHours(23, 59, 59, 999);
    dateQuery.date = { $gte: s, $lte: e };
  } else if (startDate) {
    const s = new Date(startDate);
    s.setHours(0, 0, 0, 0);
    dateQuery.date = { $gte: s };
  } else if (endDate) {
    const e = new Date(endDate);
    e.setHours(23, 59, 59, 999);
    dateQuery.date = { $lte: e };
  }
  return dateQuery;
};

// ---------- 0. School-Wide Overview, Daily Trend & At-Risk Students Report ----------
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate, studentType, shift, grade, threshold = 75 } = req.query;
    const atRiskThreshold = Math.min(100, Math.max(10, parseInt(threshold, 10) || 75));

    const query = { ...buildDateRangeFilter(startDate, endDate) };
    if (studentType && studentType !== 'all') {
      query.studentType = { $regex: new RegExp(`^${escapeRegex(studentType)}$`, 'i') };
    }
    if (shift && shift !== 'all') {
      if (shift === 'night') {
        query.shift = { $in: ['night', 'Night', 'የማታ', 'ማታ'] };
      } else if (shift === 'weekend' || shift === 'day') {
        query.shift = { $nin: ['night', 'Night', 'የማታ', 'ማታ'] };
      } else {
        query.shift = shift;
      }
    }
    if (grade && grade !== 'all') {
      const m = grade.match(/\d+/);
      query.grade = m
        ? { $regex: new RegExp(`(${m[0]}|${escapeRegex(grade)})`, 'i') }
        : { $regex: new RegExp(escapeRegex(grade), 'i') };
    }

    const [rawRecords, totalRegisteredStudents] = await Promise.all([
      Attendance.find(query)
        .populate('student', 'firstName middleName lastName studentId grade batch studentType shift studentPhone contactPhone')
        .populate('course', 'name code')
        .populate('sessionId', 'title grade sessionDate startTime endTime')
        .sort({ date: -1, checkInTime: -1 })
        .lean(),
      Student.countDocuments(
        studentType && studentType !== 'all'
          ? { studentType: { $regex: new RegExp(`^${escapeRegex(studentType)}$`, 'i') } }
          : {}
      ),
    ]);

    const records = deduplicateAttendanceRecords(rawRecords);

    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;

    const gradeMap = new Map();
    const dailyMap = new Map();
    const studentMap = new Map();
    const distinctSessionKeys = new Set();

    for (const r of records) {
      const st = r.status || 'Present';
      if (st === 'Present') present++;
      else if (st === 'Late') late++;
      else if (st === 'Excused') excused++;
      else if (st === 'Absent') absent++;

      // Distinct sessions
      if (r.sessionId?._id) distinctSessionKeys.add(r.sessionId._id.toString());
      else if (r.date) {
        const dKey = new Date(r.date).toISOString().split('T')[0];
        distinctSessionKeys.add(`${dKey}_${r.grade || 'gen'}_${r.session || 'reg'}`);
      }

      // By Grade
      const gKey = r.grade || r.student?.grade || r.student?.batch || 'አጠቃላይ';
      if (!gradeMap.has(gKey)) {
        gradeMap.set(gKey, { grade: gKey, total: 0, present: 0, late: 0, excused: 0, absent: 0 });
      }
      const gEntry = gradeMap.get(gKey);
      gEntry.total++;
      if (st === 'Present') gEntry.present++;
      else if (st === 'Late') gEntry.late++;
      else if (st === 'Excused') gEntry.excused++;
      else if (st === 'Absent') gEntry.absent++;

      // By Date (Daily Trend)
      if (r.date) {
        const dateKey = new Date(r.date).toISOString().split('T')[0];
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, { date: dateKey, total: 0, present: 0, late: 0, excused: 0, absent: 0 });
        }
        const dEntry = dailyMap.get(dateKey);
        dEntry.total++;
        if (st === 'Present') dEntry.present++;
        else if (st === 'Late') dEntry.late++;
        else if (st === 'Excused') dEntry.excused++;
        else if (st === 'Absent') dEntry.absent++;
      }

      // By Student (for At-Risk & Excellent tracking)
      const sObj = r.student;
      const sId = sObj?._id ? sObj._id.toString() : (r.student ? r.student.toString() : null);
      if (sId) {
        if (!studentMap.has(sId)) {
          studentMap.set(sId, {
            studentId: sId,
            studentCustomId: sObj?.studentId || '—',
            studentName: sObj ? getStudentFullName(sObj) : (r.studentName || 'ተማሪ'),
            grade: sObj?.grade || sObj?.batch || r.grade || '—',
            studentType: sObj?.studentType || r.studentType || 'regular',
            shift: sObj?.shift || r.shift || 'weekend',
            phone: sObj?.studentPhone || sObj?.contactPhone || '—',
            present: 0,
            late: 0,
            excused: 0,
            absent: 0,
            total: 0,
          });
        }
        const sEntry = studentMap.get(sId);
        sEntry.total++;
        if (st === 'Present') sEntry.present++;
        else if (st === 'Late') sEntry.late++;
        else if (st === 'Excused') sEntry.excused++;
        else if (st === 'Absent') sEntry.absent++;
      }
    }

    const totalRecords = records.length;
    const attendedTotal = present + late;
    const attendanceRate = totalRecords > 0 ? Math.round((attendedTotal / totalRecords) * 100) : 0;
    const onTimeRate = totalRecords > 0 ? Math.round((present / totalRecords) * 100) : 0;

    const byGrade = Array.from(gradeMap.values())
      .map((g) => ({
        ...g,
        attended: g.present + g.late,
        rate: g.total > 0 ? Math.round(((g.present + g.late) / g.total) * 100) : 0,
      }))
      .sort((a, b) => a.grade.localeCompare(b.grade, undefined, { numeric: true }));

    const dailyTrend = Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .map((d) => ({
        ...d,
        attended: d.present + d.late,
        rate: d.total > 0 ? Math.round(((d.present + d.late) / d.total) * 100) : 0,
      }));

    const studentStatsList = Array.from(studentMap.values()).map((s) => {
      const attended = s.present + s.late;
      const effectiveDenom = Math.max(1, s.total - s.excused);
      const rate = s.total > 0 ? Math.round((attended / s.total) * 100) : 0;
      return {
        ...s,
        attended,
        effectiveRate: Math.round((attended / effectiveDenom) * 100),
        rate,
      };
    });

    const atRiskStudents = studentStatsList
      .filter((s) => s.rate < atRiskThreshold && s.absent > 0)
      .sort((a, b) => a.rate - b.rate || b.absent - a.absent);

    const excellentCount = studentStatsList.filter((s) => s.rate >= 90).length;

    res.json({
      success: true,
      filters: {
        startDate: startDate || null,
        endDate: endDate || null,
        studentType: studentType || 'all',
        shift: shift || 'all',
        grade: grade || 'all',
        threshold: atRiskThreshold,
      },
      summary: {
        totalRegisteredStudents,
        trackedStudents: studentStatsList.length,
        totalSessions: distinctSessionKeys.size,
        totalRecords,
        present,
        late,
        excused,
        absent,
        attended: attendedTotal,
        attendanceRate,
        onTimeRate,
        atRiskCount: atRiskStudents.length,
        excellentCount,
      },
      byGrade,
      dailyTrend,
      atRiskStudents,
    });
  } catch (err) {
    console.error('Report overview error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 1. By Student Report ----------
router.get('/student/:studentId', async (req, res) => {
  try {
    const studentObjId = toObjectId(req.params.studentId);
    if (!studentObjId) {
      return res.status(400).json({ success: false, message: 'Invalid Student ID format' });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = buildDateRangeFilter(startDate, endDate);

    // Parallel fetch: Student info & Attendance history (both with .lean())
    const [student, rawHistory] = await Promise.all([
      Student.findById(studentObjId)
        .populate('userId', 'email phone fullName')
        .populate({
          path: 'courses',
          select: 'name code teacher grade shift',
          populate: { path: 'teacher', select: 'fullName email phone' },
        })
        .lean(),
      Attendance.find({ student: studentObjId, ...dateFilter })
        .populate('course', 'name code')
        .populate('teacher', 'fullName')
        .populate('sessionId', 'title grade sessionDate startTime endTime')
        .sort({ date: -1, checkInTime: -1 })
        .lean(),
    ]);

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const history = deduplicateAttendanceRecords(rawHistory);
    const studentCourses = student.courses || [];
    const courseIds = studentCourses.map((c) => toObjectId(c._id)).filter(Boolean);

    // Group student's own records by course for exact Present/Late/Excused/Absent counts
    const courseSummaries = [];
    for (const course of studentCourses) {
      const cIdStr = course._id.toString();
      const cRecords = history.filter((r) => (r.course?._id || r.course)?.toString() === cIdStr);
      const present = cRecords.filter((r) => r.status === 'Present').length;
      const late = cRecords.filter((r) => r.status === 'Late').length;
      const excused = cRecords.filter((r) => r.status === 'Excused').length;
      const absent = cRecords.filter((r) => r.status === 'Absent').length;
      const attended = present + late;
      const totalSessions = cRecords.length;
      const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

      courseSummaries.push({
        courseId: course._id,
        courseName: course.name,
        courseCode: course.code || '—',
        teacherName: course.teacher?.fullName || 'ያልተመደበ',
        grade: course.grade || student.grade || '—',
        totalSessions,
        present,
        late,
        excused,
        attended,
        missed: absent,
        rate,
      });
    }

    // Also include general grade/session attendance records (where course is null or not in courseIds)
    const generalRecords = history.filter(
      (r) => !r.course || !courseIds.some((cid) => cid.toString() === (r.course._id || r.course).toString())
    );
    if (generalRecords.length > 0) {
      const present = generalRecords.filter((r) => r.status === 'Present').length;
      const late = generalRecords.filter((r) => r.status === 'Late').length;
      const excused = generalRecords.filter((r) => r.status === 'Excused').length;
      const absent = generalRecords.filter((r) => r.status === 'Absent').length;
      const attended = present + late;
      const totalSessions = generalRecords.length;
      const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

      courseSummaries.push({
        courseId: 'general',
        courseName: 'አጠቃላይ የክፍለ-ጊዜ ተገኝነት (General Sessions)',
        courseCode: 'GEN',
        teacherName: 'የሰንበት ት/ቤት',
        grade: student.grade || '—',
        totalSessions,
        present,
        late,
        excused,
        attended,
        missed: absent,
        rate,
      });
    }

    const totalPresent = history.filter((r) => r.status === 'Present').length;
    const totalLate = history.filter((r) => r.status === 'Late').length;
    const totalExcused = history.filter((r) => r.status === 'Excused').length;
    const totalAbsent = history.filter((r) => r.status === 'Absent').length;
    const totalAttendedAll = totalPresent + totalLate;
    const totalSessionsAll = history.length;
    const overallRate = totalSessionsAll > 0 ? Math.round((totalAttendedAll / totalSessionsAll) * 100) : 0;
    const fullName = getStudentFullName(student);

    res.json({
      success: true,
      filters: { startDate: startDate || null, endDate: endDate || null },
      student: {
        _id: student._id,
        fullName,
        studentId: student.studentId || '—',
        grade: student.grade || student.batch || '—',
        studentType: student.studentType || 'regular',
        shift: student.shift || 'weekend',
        phone: student.studentPhone || student.contactPhone || student.userId?.phone || '—',
        email: student.userId?.email || student.email || '—',
      },
      summary: {
        totalCourses: studentCourses.length,
        totalSessions: totalSessionsAll,
        totalPresent,
        totalLate,
        totalExcused,
        totalAttended: totalAttendedAll,
        totalMissed: totalAbsent,
        overallRate,
        isAtRisk: totalSessionsAll > 0 && overallRate < 75,
      },
      courseSummaries,
      attendanceHistory: history.map((r) => ({
        _id: r._id,
        date: r.date,
        checkInTime: r.checkInTime || r.date,
        courseName: r.sessionId?.title || r.session || r.course?.name || r.courseName || 'አጠቃላይ (General)',
        courseCode: r.course?.code || '—',
        teacherName: r.teacherName || r.teacher?.fullName || '—',
        status: r.status || 'Present',
        shift: r.shift || student.shift || 'weekend',
        session: r.sessionId?.title || r.session || 'መደበኛ',
        note: r.excuseReason || r.note || '',
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
      $or: [{ grade: gradeRegex }, { batch: gradeRegex }],
    };

    // 2. Shift filtering: weekend vs night
    if (shift && shift !== 'all') {
      if (shift === 'night') {
        studentQuery.shift = { $in: ['night', 'Night', 'የማታ', 'ማታ'] };
      } else if (shift === 'weekend' || shift === 'day') {
        studentQuery.shift = { $nin: ['night', 'Night', 'የማታ', 'ማታ'] };
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
          atRiskCount: 0,
          averageRate: 0,
        },
        sessions: [],
        students: [],
      });
    }

    const studentIds = students.map((s) => s._id);

    // 4. Build Date Range Filter
    const dateQuery = buildDateRangeFilter(startDate, endDate);
    let sessionDateQuery = {};
    if (startDate && endDate) {
      sessionDateQuery = { sessionDate: { $gte: startDate, $lte: endDate } };
    } else if (startDate) {
      sessionDateQuery = { sessionDate: { $gte: startDate } };
    } else if (endDate) {
      sessionDateQuery = { sessionDate: { $lte: endDate } };
    }

    // 5. Query all Attendance records for these students in this grade / date range
    const attendanceRecords = await Attendance.find({
      student: { $in: studentIds },
      ...dateQuery,
    })
      .sort({ date: -1, checkInTime: -1 })
      .lean();

    // 6. Query ClassSessions held for this grade / shift
    const sessionQuery = {
      $or: [{ grade: gradeRegex }, { targetGrades: gradeRegex }, { isCombinedSession: true }],
      status: { $in: ['closed', 'open', 'completed', 'active'] },
      ...sessionDateQuery,
    };
    if (shift && shift !== 'all') {
      if (shift === 'night') {
        sessionQuery.$and = [{ $or: [{ shift: 'night' }, { targetShifts: 'night' }] }];
      } else if (shift === 'weekend' || shift === 'day') {
        sessionQuery.$and = [
          {
            $or: [
              { shift: { $in: ['weekend', 'day', 'all', '', null] } },
              { targetShifts: { $in: ['weekend', 'day', 'all'] } },
            ],
          },
        ];
      }
    }
    const classSessions = await ClassSession.find(sessionQuery)
      .select('_id sessionDate title grade shift status startTime endTime createdBy stats')
      .populate('createdBy', 'fullName')
      .sort({ sessionDate: -1 })
      .lean()
      .catch(() => []);

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

    // 8. Map attendance per student cleanly (deduplicated per session/date)
    const studentRecordsMap = new Map();
    for (const att of attendanceRecords) {
      const sId = att.student.toString();
      if (!studentRecordsMap.has(sId)) {
        studentRecordsMap.set(sId, new Map());
      }
      const sessionMap = studentRecordsMap.get(sId);
      const sessionKey = att.sessionId
        ? att.sessionId.toString()
        : att.date
        ? new Date(att.date).toISOString().split('T')[0]
        : att._id.toString();

      if (!sessionMap.has(sessionKey)) {
        sessionMap.set(sessionKey, att);
      } else {
        const existing = sessionMap.get(sessionKey);
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
    let atRiskCount = 0;

    for (const student of students) {
      const sId = student._id.toString();
      const sessionMap = studentRecordsMap.get(sId) || new Map();
      const dedupedRecords = Array.from(sessionMap.values());

      let presentOnly = 0;
      let attended = 0;
      let late = 0;
      let excused = 0;
      let recordedAbsent = 0;

      for (const r of dedupedRecords) {
        if (r.status === 'Present') {
          presentOnly++;
          attended++;
        } else if (r.status === 'Late') {
          attended++;
          late++;
        } else if (r.status === 'Excused') excused++;
        else if (r.status === 'Absent') recordedAbsent++;
      }

      // Expected sessions for this student
      const studentTotalSessions = hasManualOverride
        ? totalSessionsHeld
        : Math.max(totalSessionsHeld, dedupedRecords.length);

      // Fixed: missed already includes recordedAbsent + any unrecorded sessions (no double counting!)
      const totalMissed = Math.max(recordedAbsent, studentTotalSessions - attended - excused);
      const studentRate =
        studentTotalSessions > 0
          ? Math.round((attended / studentTotalSessions) * 100)
          : attended > 0
          ? 100
          : 0;
      const isAtRisk = studentTotalSessions > 0 && studentRate < 75;
      if (isAtRisk) atRiskCount++;

      grandAttended += attended;
      grandSessions += studentTotalSessions;
      grandLate += late;
      grandExcused += excused;
      grandAbsent += totalMissed;

      const fullName = getStudentFullName(student);

      result.push({
        studentId: student._id,
        studentCustomId: student.studentId || '—',
        studentName: fullName,
        studentType: student.studentType || 'regular',
        shift: student.shift || 'weekend',
        phone: student.studentPhone || student.contactPhone || '—',
        email: student.userId?.email || '—',
        present: presentOnly,
        attended,
        late,
        excused,
        absent: totalMissed,
        overallAttended: attended,
        overallSessions: studentTotalSessions,
        overallMissed: totalMissed,
        overallRate: studentRate,
        isAtRisk,
      });
    }

    const averageRate =
      grandSessions > 0
        ? Math.round((grandAttended / grandSessions) * 100)
        : students.length > 0
        ? Math.round(result.reduce((acc, s) => acc + s.overallRate, 0) / students.length)
        : 0;

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
        atRiskCount,
        averageRate,
      },
      sessions: classSessions.slice(0, 20).map((cs) => ({
        _id: cs._id,
        title: cs.title || cs.grade,
        sessionDate: cs.sessionDate,
        startTime: cs.startTime,
        endTime: cs.endTime,
        status: cs.status,
        createdBy: cs.createdBy?.fullName || null,
        stats: cs.stats || null,
      })),
      students: result,
    });
  } catch (err) {
    console.error('Report by grade error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 3. By Course Report (With Grade Fallback & Full Breakdown) ----------
router.get('/course/:courseId', async (req, res) => {
  try {
    const courseObjId = toObjectId(req.params.courseId);
    if (!courseObjId) {
      return res.status(400).json({ success: false, message: 'Invalid Course ID format' });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = buildDateRangeFilter(startDate, endDate);

    const [course, directStudents, rawCourseAttendances] = await Promise.all([
      Course.findById(courseObjId).populate('teacher', 'fullName email phone').lean(),
      Student.find({ courses: courseObjId })
        .populate('userId', 'email phone')
        .sort({ firstName: 1, lastName: 1 })
        .lean(),
      Attendance.find({ course: courseObjId, ...dateFilter }).lean(),
    ]);

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    let students = directStudents;
    if (students.length === 0 && course.grade) {
      const m = course.grade.match(/\d+/);
      const gRegex = m
        ? new RegExp(`(${m[0]}|${escapeRegex(course.grade)})`, 'i')
        : new RegExp(escapeRegex(course.grade), 'i');
      const fallbackQuery = { $or: [{ grade: gRegex }, { batch: gRegex }] };
      if (course.studentType) fallbackQuery.studentType = course.studentType;
      students = await Student.find(fallbackQuery)
        .populate('userId', 'email phone')
        .sort({ firstName: 1, lastName: 1 })
        .lean();
    }

    const attendances = deduplicateAttendanceRecords(rawCourseAttendances);

    const distinctSessionKeys = new Set(
      attendances
        .map((a) => (a.sessionId ? a.sessionId.toString() : a.date ? new Date(a.date).toISOString().split('T')[0] : ''))
        .filter(Boolean)
    );
    const totalSessions = distinctSessionKeys.size;

    const studentMap = new Map();
    for (const a of attendances) {
      const sId = a.student?.toString();
      if (!sId) continue;
      if (!studentMap.has(sId)) {
        studentMap.set(sId, { present: 0, late: 0, excused: 0, absent: 0 });
      }
      const entry = studentMap.get(sId);
      if (a.status === 'Present') entry.present++;
      else if (a.status === 'Late') entry.late++;
      else if (a.status === 'Excused') entry.excused++;
      else if (a.status === 'Absent') entry.absent++;
    }

    const studentSummaries = [];
    let totalAttendedInCourse = 0;
    let totalLateInCourse = 0;
    let totalExcusedInCourse = 0;
    let totalAbsentInCourse = 0;
    let atRiskCount = 0;

    for (const student of students) {
      const stats = studentMap.get(student._id.toString()) || { present: 0, late: 0, excused: 0, absent: 0 };
      const attended = stats.present + stats.late;
      const missed = Math.max(stats.absent, totalSessions - attended - stats.excused);
      const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : attended > 0 ? 100 : 0;
      const isAtRisk = totalSessions > 0 && rate < 75;
      if (isAtRisk) atRiskCount++;

      totalAttendedInCourse += attended;
      totalLateInCourse += stats.late;
      totalExcusedInCourse += stats.excused;
      totalAbsentInCourse += missed;

      studentSummaries.push({
        studentId: student._id,
        studentCustomId: student.studentId || '—',
        studentName: getStudentFullName(student),
        grade: student.grade || course.grade || '—',
        phone: student.studentPhone || student.contactPhone || '—',
        email: student.userId?.email || '—',
        present: stats.present,
        late: stats.late,
        excused: stats.excused,
        attended,
        missed,
        totalSessions,
        rate,
        isAtRisk,
      });
    }

    const averageRate =
      students.length > 0 && totalSessions > 0
        ? Math.round((totalAttendedInCourse / (students.length * totalSessions)) * 100)
        : 0;

    res.json({
      success: true,
      filters: { startDate: startDate || null, endDate: endDate || null },
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
        totalAttended: totalAttendedInCourse,
        totalLate: totalLateInCourse,
        totalExcused: totalExcusedInCourse,
        totalAbsent: totalAbsentInCourse,
        atRiskCount,
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
    const teacherObjId = toObjectId(req.params.teacherId);
    if (!teacherObjId) {
      return res.status(400).json({ success: false, message: 'Invalid Teacher ID format' });
    }

    let teacherUser = await User.findById(teacherObjId).lean();
    let teacherDoc = await Teacher.findOne({ $or: [{ _id: teacherObjId }, { userId: teacherObjId }] }).lean();
    if (!teacherUser && teacherDoc?.userId) {
      teacherUser = await User.findById(teacherDoc.userId).lean();
    }

    if (!teacherUser && !teacherDoc) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const teacherIds = [teacherObjId];
    if (teacherUser?._id) teacherIds.push(teacherUser._id);
    if (teacherDoc?._id) teacherIds.push(teacherDoc._id);

    const courses = await Course.find({
      $or: [{ teacher: { $in: teacherIds } }, { instructors: { $in: teacherIds } }],
    }).lean();

    const courseIds = courses.map((c) => toObjectId(c._id)).filter(Boolean);

    const [allStudents, rawAttendances] = await Promise.all([
      courseIds.length > 0 ? Student.find({ courses: { $in: courseIds } }).populate('userId', 'email').lean() : [],
      courseIds.length > 0 ? Attendance.find({ course: { $in: courseIds } }).lean() : [],
    ]);

    const attendances = deduplicateAttendanceRecords(rawAttendances);

    const coursesData = [];
    let grandTotalStudents = 0;

    for (const course of courses) {
      const cIdStr = course._id.toString();
      const courseAtt = attendances.filter((a) => a.course?.toString() === cIdStr);
      const distinctSessions = new Set(
        courseAtt
          .map((a) => (a.sessionId ? a.sessionId.toString() : a.date ? new Date(a.date).toISOString().split('T')[0] : ''))
          .filter(Boolean)
      );
      const totalSessions = distinctSessions.size;

      let courseStudents = allStudents.filter((s) =>
        (s.courses || []).some((c) => (c._id || c).toString() === cIdStr)
      );

      if (courseStudents.length === 0 && course.grade) {
        const m = course.grade.match(/\d+/);
        const gRegex = m
          ? new RegExp(`(${m[0]}|${escapeRegex(course.grade)})`, 'i')
          : new RegExp(escapeRegex(course.grade), 'i');
        courseStudents = await Student.find({ $or: [{ grade: gRegex }, { batch: gRegex }] })
          .populate('userId', 'email')
          .lean();
      }

      grandTotalStudents += courseStudents.length;

      const byStudent = new Map();
      for (const a of courseAtt) {
        const sId = a.student?.toString();
        if (!sId) continue;
        if (!byStudent.has(sId)) byStudent.set(sId, { present: 0, late: 0, excused: 0, absent: 0 });
        const entry = byStudent.get(sId);
        if (a.status === 'Present') entry.present++;
        else if (a.status === 'Late') entry.late++;
        else if (a.status === 'Excused') entry.excused++;
        else if (a.status === 'Absent') entry.absent++;
      }

      let courseAttendedSum = 0;
      const studentSummaries = courseStudents.map((student) => {
        const stats = byStudent.get(student._id.toString()) || { present: 0, late: 0, excused: 0, absent: 0 };
        const attended = stats.present + stats.late;
        const missed = Math.max(stats.absent, totalSessions - attended - stats.excused);
        const rate = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : attended > 0 ? 100 : 0;
        courseAttendedSum += attended;

        return {
          studentId: student._id,
          studentCustomId: student.studentId || '—',
          studentName: getStudentFullName(student),
          grade: student.grade || course.grade || '—',
          present: stats.present,
          late: stats.late,
          excused: stats.excused,
          attended,
          missed,
          totalSessions,
          rate,
          isAtRisk: totalSessions > 0 && rate < 75,
        };
      });

      const courseAverageRate =
        courseStudents.length > 0 && totalSessions > 0
          ? Math.round((courseAttendedSum / (courseStudents.length * totalSessions)) * 100)
          : 0;

      coursesData.push({
        courseId: course._id,
        courseName: course.name,
        courseCode: course.code || '—',
        grade: course.grade || '—',
        totalSessions,
        enrolledCount: courseStudents.length,
        averageRate: courseAverageRate,
        students: studentSummaries,
      });
    }

    res.json({
      success: true,
      teacher: {
        _id: teacherUser?._id || teacherDoc?._id,
        fullName: teacherUser?.fullName || teacherDoc?.fullName || 'መምህር',
        email: teacherUser?.email || teacherDoc?.email || '—',
        phone: teacherUser?.phone || teacherDoc?.phone || '—',
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

// ---------- 5. By Date Report (Deduplicated & Enriched) ----------
router.get('/date', async (req, res) => {
  try {
    const { date, shift, grade } = req.query;
    const effectiveDate = date || getEthiopianTimeInfo().dateString;

    const startOfDay = new Date(effectiveDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(effectiveDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query = { date: { $gte: startOfDay, $lte: endOfDay } };

    if (shift && shift !== 'all') {
      if (shift === 'night') query.shift = { $in: ['night', 'Night', 'የማታ', 'ማታ'] };
      else if (shift === 'weekend' || shift === 'day') query.shift = { $nin: ['night', 'Night', 'የማታ', 'ማታ'] };
      else query.shift = shift;
    }

    if (grade && grade !== 'all') {
      const num = grade.match(/\d+/);
      const gradeRegex = num
        ? new RegExp(`(${num[0]}|${escapeRegex(grade)})`, 'i')
        : new RegExp(escapeRegex(grade), 'i');
      query.$or = [{ grade: gradeRegex }, { batch: gradeRegex }];
    }

    const rawRecords = await Attendance.find(query)
      .select('student course teacher date checkInTime status shift session sessionId studentName studentType grade courseName teacherName excuseReason note')
      .populate('student', 'firstName middleName lastName studentId grade studentType shift')
      .populate('course', 'name code')
      .populate('teacher', 'fullName')
      .populate('sessionId', 'title grade startTime endTime')
      .sort({ checkInTime: -1, date: 1 })
      .lean();

    const records = deduplicateAttendanceRecords(rawRecords);

    const formattedRecords = records.map((r) => {
      const studentName = r.student ? getStudentFullName(r.student) : r.studentName || 'ተማሪ';
      return {
        _id: r._id,
        time: r.checkInTime || r.date,
        studentId: r.student?.studentId || '—',
        studentName,
        studentType: r.studentType || r.student?.studentType || 'regular',
        shift: r.shift || r.student?.shift || 'weekend',
        grade: r.grade || r.student?.grade || '—',
        courseName: r.sessionId?.title || r.session || r.course?.name || r.courseName || 'አጠቃላይ (General)',
        courseCode: r.course?.code || '—',
        teacherName: r.teacherName || r.teacher?.fullName || '—',
        status: r.status || 'Present',
        note: r.excuseReason || r.note || '',
      };
    });

    const totalPresentOnly = formattedRecords.filter((r) => r.status === 'Present').length;
    const totalLate = formattedRecords.filter((r) => r.status === 'Late').length;
    const totalExcused = formattedRecords.filter((r) => r.status === 'Excused').length;
    const totalAbsent = formattedRecords.filter((r) => r.status === 'Absent').length;
    const totalRecords = formattedRecords.length;
    const attendanceRate =
      totalRecords > 0 ? Math.round(((totalPresentOnly + totalLate) / totalRecords) * 100) : 0;

    res.json({
      success: true,
      date: effectiveDate,
      summary: {
        totalPresent: totalPresentOnly + totalLate,
        totalOnTime: totalPresentOnly,
        totalLate,
        totalAbsent,
        totalExcused,
        totalRecords,
        attendanceRate,
      },
      records: formattedRecords,
    });
  } catch (err) {
    console.error('Report by date error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- 6. Send Formatted Attendance Report to Telegram (Admin DM and/or Class Groups) ----------
router.post('/send-telegram', async (req, res) => {
  try {
    const {
      messageText,
      targetGrade = null,
      targetShift = null,
      sendToSelf = true,
      sendToGroups = false,
      targetGroupId = null,
    } = req.body || {};

    if (!messageText || !String(messageText).trim()) {
      return res.status(400).json({ success: false, message: 'የሚላከው የሪፖርት ጽሑፍ ያስፈልጋል።' });
    }

    const { sendAttendanceReportToTelegram } = require('../../services/telegramBotService');
    const result = await sendAttendanceReportToTelegram({
      adminUser: req.user,
      messageText: String(messageText).trim(),
      targetGrade,
      targetShift,
      sendToSelf: Boolean(sendToSelf),
      sendToGroups: Boolean(sendToGroups),
      targetGroupId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (err) {
    console.error('Send report to Telegram error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
