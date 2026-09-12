const mongoose = require('mongoose');
const Attendance = require('../models/education/Attendance');
const GradeRecord = require('../models/education/GradeRecord');
const Student = require('../models/Student');
const Course = require('../models/education/Course');

const getStudentFullName = (s) => {
  if (!s) return 'ተማሪ';
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ').trim() || 'ተማሪ';
};

/**
 * 🎓 GET /api/analytics/student/me
 * Student Analytics - Self-service attendance & performance tracking
 */
exports.getStudentAnalytics = async (req, res) => {
  try {
    let student = await Student.findOne({ userId: req.user._id });
    if (!student && req.query.studentId && ['admin', 'superadmin', 'teacher'].includes(req.user.role)) {
      student = await Student.findById(req.query.studentId);
    }
    if (!student) {
      return res.status(404).json({ success: false, message: 'ተማሪው አልተገኘም' });
    }

    // 1. Fetch all attendance records
    const attendances = await Attendance.find({ student: student._id })
      .populate('course', 'name code')
      .sort({ date: -1 });

    const totalAttendanceCount = attendances.length;
    const presentCount = attendances.filter(a => a.status === 'Present').length;
    const lateCount = attendances.filter(a => a.status === 'Late').length;
    const absentCount = attendances.filter(a => a.status === 'Absent').length;
    const excusedCount = attendances.filter(a => a.status === 'Excused').length;

    const overallAttendanceRate = totalAttendanceCount > 0
      ? Number((((presentCount + lateCount) / totalAttendanceCount) * 100).toFixed(1))
      : 100;

    // 2. Course-wise attendance breakdown
    const courseMap = {};
    attendances.forEach(a => {
      const cId = a.course?._id?.toString() || 'other';
      const cName = a.courseName || a.course?.name || 'መደበኛ ሰንበት ትምህርት';
      if (!courseMap[cId]) {
        courseMap[cId] = {
          courseId: cId,
          courseName: cName,
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
          excused: 0,
        };
      }
      courseMap[cId].total += 1;
      if (a.status === 'Present') courseMap[cId].present += 1;
      else if (a.status === 'Late') courseMap[cId].late += 1;
      else if (a.status === 'Absent') courseMap[cId].absent += 1;
      else if (a.status === 'Excused') courseMap[cId].excused += 1;
    });

    const courseBreakdown = Object.values(courseMap).map(c => {
      const rate = c.total > 0 ? Number((((c.present + c.late) / c.total) * 100).toFixed(1)) : 100;
      return { ...c, rate, isAtRisk: rate < 75 };
    });

    // 3. Fetch academic grades
    const gradeRecords = await GradeRecord.find({ student: student._id })
      .populate('course', 'name code')
      .sort({ createdAt: -1 });

    const totalScoreSum = gradeRecords.reduce((acc, g) => acc + (g.totalScore || 0), 0);
    const averageScore = gradeRecords.length > 0 ? Number((totalScoreSum / gradeRecords.length).toFixed(1)) : 0;

    // At-risk warnings
    const atRiskAlerts = courseBreakdown.filter(c => c.isAtRisk).map(c => ({
      courseName: c.courseName,
      rate: c.rate,
      message: `በ${c.courseName} የነበረዎት መገኘት ${c.rate}% ነው። ከ 75% በታች በመሆኑ እባክዎ በትምህርቱ በአካል ይገኙ!`,
    }));

    res.json({
      success: true,
      student: {
        id: student._id,
        studentId: student.studentId,
        fullName: getStudentFullName(student),
        grade: student.grade || student.batch,
        shift: student.shift,
      },
      summary: {
        totalAttendanceCount,
        presentCount,
        lateCount,
        absentCount,
        excusedCount,
        overallAttendanceRate,
        averageScore,
        totalCoursesCount: courseBreakdown.length,
      },
      courseBreakdown,
      gradeRecords: gradeRecords.map(g => ({
        courseName: g.course?.name || 'ትምህርት',
        assignmentScore: g.assignmentScore,
        quizScore: g.quizScore,
        midExamScore: g.midExamScore,
        finalExamScore: g.finalExamScore,
        attendanceScore: g.attendanceScore,
        totalScore: g.totalScore,
        passFail: g.passFail,
        letterGrade: g.letterGrade,
      })),
      atRiskAlerts,
      recentAttendanceLog: attendances.slice(0, 10).map(a => ({
        date: a.date,
        courseName: a.courseName || a.course?.name || 'ትምህርት',
        status: a.status,
        checkInTime: a.checkInTime,
      })),
    });
  } catch (err) {
    console.error('Student analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 👨‍🏫 GET /api/analytics/teacher/courses
 * Teacher Analytics - Course attendance, class performance & at-risk student tracking
 */
exports.getTeacherAnalytics = async (req, res) => {
  try {
    const isTeacher = req.user.role === 'teacher';
    const courseQuery = isTeacher ? { teacher: req.user._id } : {};

    const teacherCourses = await Course.find(courseQuery).select('_id name code grade shift');
    const courseIds = teacherCourses.map(c => c._id);

    const attendanceQuery = isTeacher ? { course: { $in: courseIds } } : {};
    const attendances = await Attendance.find(attendanceQuery)
      .populate('student', 'firstName middleName lastName studentId grade shift studentPhone')
      .populate('course', 'name grade shift');

    const gradeRecordQuery = isTeacher ? { course: { $in: courseIds } } : {};
    const gradeRecords = await GradeRecord.find(gradeRecordQuery)
      .populate('student', 'firstName middleName lastName studentId grade shift studentPhone')
      .populate('course', 'name');

    // Aggregate by student
    const studentStatsMap = {};

    attendances.forEach(a => {
      if (!a.student) return;
      const sId = a.student._id.toString();
      if (!studentStatsMap[sId]) {
        studentStatsMap[sId] = {
          studentId: sId,
          customStudentId: a.student.studentId || '',
          fullName: getStudentFullName(a.student),
          grade: a.student.grade || a.grade || '',
          shift: a.student.shift || a.shift || '',
          phone: a.student.studentPhone || '',
          total: 0,
          present: 0,
          late: 0,
          absent: 0,
          scores: [],
        };
      }
      studentStatsMap[sId].total += 1;
      if (a.status === 'Present') studentStatsMap[sId].present += 1;
      if (a.status === 'Late') studentStatsMap[sId].late += 1;
      if (a.status === 'Absent') studentStatsMap[sId].absent += 1;
    });

    gradeRecords.forEach(g => {
      if (!g.student) return;
      const sId = g.student._id.toString();
      if (studentStatsMap[sId]) {
        studentStatsMap[sId].scores.push(g.totalScore || 0);
      }
    });

    const allStudentsList = Object.values(studentStatsMap).map(s => {
      const attendanceRate = s.total > 0 ? Number((((s.present + s.late) / s.total) * 100).toFixed(1)) : 100;
      const avgScore = s.scores.length > 0
        ? Number((s.scores.reduce((a, b) => a + b, 0) / s.scores.length).toFixed(1))
        : 0;

      const isAtRisk = attendanceRate < 75 || (s.scores.length > 0 && avgScore < 50);
      return {
        ...s,
        attendanceRate,
        avgScore,
        isAtRisk,
      };
    });

    const atRiskStudents = allStudentsList.filter(s => s.isAtRisk);

    // Course summary breakdown
    const courseStats = teacherCourses.map(c => {
      const courseAtt = attendances.filter(a => a.course?._id?.toString() === c._id.toString());
      const totalAtt = courseAtt.length;
      const presentCount = courseAtt.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const rate = totalAtt > 0 ? Number(((presentCount / totalAtt) * 100).toFixed(1)) : 0;

      return {
        courseId: c._id,
        courseName: c.name,
        grade: c.grade,
        shift: c.shift,
        totalRecordings: totalAtt,
        attendanceRate: rate,
      };
    });

    res.json({
      success: true,
      summary: {
        totalCourses: teacherCourses.length,
        totalActiveStudents: allStudentsList.length,
        atRiskCount: atRiskStudents.length,
        overallClassAttendanceRate: allStudentsList.length > 0
          ? Number((allStudentsList.reduce((acc, s) => acc + s.attendanceRate, 0) / allStudentsList.length).toFixed(1))
          : 0,
      },
      courseStats,
      atRiskStudents,
      correlationData: allStudentsList.map(s => ({
        studentName: s.fullName,
        grade: s.grade,
        shift: s.shift,
        attendanceRate: s.attendanceRate,
        avgScore: s.avgScore,
      })),
    });
  } catch (err) {
    console.error('Teacher analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 🛡️ GET /api/analytics/admin/overview
 * Admin Analytics - School-wide attendance, shift breakdown (Weekend vs Night), grade rankings
 */
exports.getAdminAnalytics = async (req, res) => {
  try {
    const totalStudentsCount = await Student.countDocuments({});
    const totalAttendancesCount = await Attendance.countDocuments({});

    // 1. Shift Breakdown: Weekend vs Night
    const shiftAggregation = await Attendance.aggregate([
      {
        $group: {
          _id: { $toLower: { $ifNull: ['$shift', 'weekend'] } },
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0]
            }
          },
          absent: {
            $sum: {
              $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const shiftBreakdown = {
      weekend: { total: 0, present: 0, absent: 0, rate: 0 },
      night: { total: 0, present: 0, absent: 0, rate: 0 },
    };

    shiftAggregation.forEach(s => {
      const key = s._id === 'night' ? 'night' : 'weekend';
      shiftBreakdown[key].total += s.total;
      shiftBreakdown[key].present += s.present;
      shiftBreakdown[key].absent += s.absent;
    });

    if (shiftBreakdown.weekend.total > 0) {
      shiftBreakdown.weekend.rate = Number(((shiftBreakdown.weekend.present / shiftBreakdown.weekend.total) * 100).toFixed(1));
    }
    if (shiftBreakdown.night.total > 0) {
      shiftBreakdown.night.rate = Number(((shiftBreakdown.night.present / shiftBreakdown.night.total) * 100).toFixed(1));
    }

    // 2. Grade 7 to 12 Breakdown
    const gradeAggregation = await Attendance.aggregate([
      {
        $group: {
          _id: '$grade',
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const gradeBreakdown = gradeAggregation.map(g => ({
      grade: g._id || 'ያልተገለጸ',
      totalLogs: g.total,
      presentLogs: g.present,
      rate: g.total > 0 ? Number(((g.present / g.total) * 100).toFixed(1)) : 0,
    }));

    // 3. Overall School Attendance Rate
    const totalPresentLogs = (shiftBreakdown.weekend.present + shiftBreakdown.night.present);
    const overallSchoolRate = totalAttendancesCount > 0
      ? Number(((totalPresentLogs / totalAttendancesCount) * 100).toFixed(1))
      : 100;

    // 4. Low attendance students count (< 75% attendance)
    const lowAttendanceAgg = await Attendance.aggregate([
      {
        $group: {
          _id: '$student',
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          rate: { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
        }
      },
      { $match: { rate: { $lt: 75 } } }
    ]);

    const atRiskCount = lowAttendanceAgg.length;

    res.json({
      success: true,
      summary: {
        totalStudentsCount,
        totalAttendancesCount,
        overallSchoolRate,
        atRiskCount,
      },
      shiftBreakdown,
      gradeBreakdown,
    });
  } catch (err) {
    console.error('Admin analytics error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
