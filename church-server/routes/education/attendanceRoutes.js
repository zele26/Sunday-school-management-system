// church-server/routes/education/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { protect, authorize } = require('../../middleware/auth');
const Attendance = require('../../models/education/Attendance');
const Student = require('../../models/Student');
const User = require('../../models/User');
const StudentProfile = require('../../models/education/StudentProfile');
const Course = require('../../models/education/Course');

const getStudentFullName = (s) => {
  if (!s) return 'ተማሪ';
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ').trim() || 'ተማሪ';
};

const formatGradeAmharic = (g) => {
  if (!g) return '';
  const num = g.match(/\d+/);
  if (g.toLowerCase().includes('batch') || g.includes('ዙር')) return num ? `ዙር ${num[0]} (የርቀት)` : g;
  if (num) return `${num[0]}ኛ ክፍል`;
  return g;
};

const isStudentEligibleForCourse = (student, course) => {
  if (!course) return { eligible: true };

  const studentType = (student.studentType || 'regular').toString().trim().toLowerCase();
  const courseStudentType = (course.studentType || 'regular').toString().trim().toLowerCase();
  if (courseStudentType && studentType && courseStudentType !== studentType) {
    return {
      eligible: false,
      reason: `⚠️ ይህ ተማሪ ለዚህ የትምህርት ዘርፍ አልተመደበም። የተማሪው ዘርፍ፦ ${studentType === 'distance' ? 'የርቀት' : 'መደበኛ'} | የኮርሱ ዘርፍ፦ ${courseStudentType === 'distance' ? 'የርቀት' : 'መደበኛ'}`
    };
  }

  if (course.grade) {
    const studentGrade = (student.grade || student.batch || '').toString().trim().toLowerCase();
    const courseGrade = course.grade.toString().trim().toLowerCase();

    if (!studentGrade) return { eligible: true };

    const norm = (str) => {
      const m = str.match(/\d+/);
      if (m) return (str.includes('batch') || str.includes('ዙር')) ? `batch_${m[0]}` : `grade_${m[0]}`;
      return str.replace(/\s+/g, '');
    };

    if (norm(studentGrade) !== norm(courseGrade)) {
      return {
        eligible: false,
        reason: `⚠️ ይህ ተማሪ ለተመረጠው ኮርስ (${course.name}) አልተመደበም። የተማሪው ክፍል፦ ${formatGradeAmharic(student.grade || student.batch)} | የኮርሱ ክፍል፦ ${formatGradeAmharic(course.grade)}`
      };
    }
  }

  return { eligible: true };
};

// All routes require authentication
router.use(protect);

// ============================================================================
// NEW: CLASS SESSION & TIMETABLE-BASED ATTENDANCE ROUTES
// ============================================================================
const sessionCtrl = require('../../controllers/education/attendanceSessionController');

// 1. Taker Sessions & QR Workflow
router.get('/sessions/today', sessionCtrl.getTodayAuthorizedSessions);
router.post('/sessions/:id/start', sessionCtrl.startSession);
router.post('/sessions/:id/scan', sessionCtrl.scanStudentInSession);
router.post('/sessions/:id/close', sessionCtrl.closeSession);
router.get('/sessions/:id/live-roster', sessionCtrl.getSessionLiveRoster);

// 2. Admin Sessions Management
router.get('/sessions', authorize('admin', 'superadmin'), sessionCtrl.getAllSessions);
router.post('/sessions/makeup', authorize('admin', 'superadmin'), sessionCtrl.createMakeUpSession);
router.patch('/sessions/:id/reschedule', authorize('admin', 'superadmin'), sessionCtrl.rescheduleSession);
router.patch('/sessions/:id/cancel', authorize('admin', 'superadmin'), sessionCtrl.cancelSession);

// 3. Admin Timetable & Recurring Schedule Management
router.get('/schedules', sessionCtrl.getSchedules);
router.post('/schedules', authorize('admin', 'superadmin'), sessionCtrl.createSchedule);
router.put('/schedules/:id', authorize('admin', 'superadmin'), sessionCtrl.updateSchedule);
router.delete('/schedules/:id', authorize('admin', 'superadmin'), sessionCtrl.deleteSchedule);

// ---------- Legacy Scan QR and record attendance ----------
router.post('/scan', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { qrCode, courseId, status: forcedStatus } = req.body;
    if (!qrCode || typeof qrCode !== 'string') {
      return res.status(400).json({ success: false, message: 'QR code data required' });
    }

    const trimmedQr = qrCode.trim();
    let searchId = trimmedQr;

    // 1. Try parsing JSON if encoded
    try {
      const parsed = JSON.parse(trimmedQr);
      if (parsed.studentId) searchId = parsed.studentId;
      else if (parsed.qrCode) searchId = parsed.qrCode;
      else if (parsed.id) searchId = parsed.id;
      else if (parsed.certificateNumber) searchId = parsed.certificateNumber;
    } catch (e) {
      // not JSON
    }

    // 2. Try parsing URL if encoded as a full URL (from Web or Telegram QR badge)
    if (trimmedQr.includes('http://') || trimmedQr.includes('https://') || trimmedQr.includes('verify') || trimmedQr.includes('certificates')) {
      try {
        const urlStr = trimmedQr.startsWith('http') ? trimmedQr : `http://localhost/${trimmedQr.replace(/^\/+/, '')}`;
        const urlObj = new URL(urlStr);
        const queryId = urlObj.searchParams.get('id') ||
          urlObj.searchParams.get('studentId') ||
          urlObj.searchParams.get('certificateNumber') ||
          urlObj.searchParams.get('certNumber');

        if (queryId) {
          searchId = queryId.trim();
        } else {
          const pathParts = urlObj.pathname.split('/').filter(Boolean);
          if (pathParts.length > 0) {
            searchId = pathParts[pathParts.length - 1].trim();
          }
        }
      } catch (urlErr) {
        const paramMatch = trimmedQr.match(/[?&](?:id|studentId|certificateNumber|certNumber)=([^&]+)/i);
        if (paramMatch) {
          searchId = decodeURIComponent(paramMatch[1]).trim();
        }
      }
    }

    const mongoose = require('mongoose');
    const Certificate = require('../../models/education/Certificate');

    // 3. If a certificate number is scanned, check if it maps to a student
    let certStudentId = null;
    try {
      const matchedCert = await Certificate.findOne({
        $or: [
          { certificateNumber: searchId.toUpperCase() },
          { certificateNumber: searchId },
          { certNumber: searchId.toUpperCase() },
          { certNumber: searchId },
        ]
      }).select('studentId');
      if (matchedCert && matchedCert.studentId) {
        certStudentId = matchedCert.studentId;
      }
    } catch (certErr) {}

    const queryConditions = [
      { qrCode: trimmedQr },
      { qrCode: searchId },
      { studentId: searchId },
      { studentId: searchId.toUpperCase() },
      { studentId: trimmedQr },
      { studentId: trimmedQr.toUpperCase() },
      { registrationNumber: searchId },
      { registrationNumber: searchId.toUpperCase() },
      { registrationNumber: trimmedQr },
    ];

    if (certStudentId) {
      queryConditions.push({ _id: certStudentId });
    }

    if (mongoose.Types.ObjectId.isValid(searchId)) {
      queryConditions.push({ _id: searchId });
    }
    if (mongoose.Types.ObjectId.isValid(trimmedQr)) {
      queryConditions.push({ _id: trimmedQr });
    }

    const student = await Student.findOne({ $or: queryConditions });
    if (!student) {
      return res.status(404).json({ success: false, message: `የተማሪው የQR መለያ (${searchId}) አልተገኘም። እባክዎ እንደገና ይሞክሩ።` });
    }

    let courseName = '';
    let teacher = null;
    let teacherName = '';
    if (courseId) {
      const course = await Course.findById(courseId).populate('teacher', 'fullName');
      if (course) {
        // Validate if student is eligible for this course
        const eligibility = isStudentEligibleForCourse(student, course);
        if (!eligibility.eligible) {
          return res.status(400).json({
            success: false,
            notAssigned: true,
            message: eligibility.reason,
            student: {
              id: student._id,
              name: getStudentFullName(student),
              grade: student.grade || student.batch || '',
              studentType: student.studentType || 'regular',
              shift: student.shift || '',
              studentId: student.studentId || '',
            },
          });
        }

        courseName = course.name;
        if (course.teacher) {
          teacher = course.teacher._id;
          teacherName = course.teacher.fullName;
        }
      }
    } else {
      // General Attendance (Course is optional) - Validate Grade, Study Mode & Shift
      const targetGrade = req.body.grade;
      const targetType = req.body.studentType;
      const targetShift = req.body.shift;

      // 1. Validate Grade if specified
      if (targetGrade) {
        const sGrade = (student.grade || student.batch || '').toString().trim().toLowerCase();
        const norm = (str) => {
          const m = str.match(/\d+/);
          if (m) return (str.includes('batch') || str.includes('ዙር')) ? `batch_${m[0]}` : `grade_${m[0]}`;
          return str.replace(/\s+/g, '');
        };
        if (sGrade && norm(sGrade) !== norm(targetGrade.toLowerCase())) {
          return res.status(400).json({
            success: false,
            notAssigned: true,
            message: `⚠️ ይህ ተማሪ ለተመረጠው ክፍል አልተመደበም። የተማሪው ክፍል፦ ${formatGradeAmharic(student.grade || student.batch)} | የተመረጠው ክፍል፦ ${formatGradeAmharic(targetGrade)}`,
            student: {
              id: student._id,
              name: getStudentFullName(student),
              grade: student.grade || student.batch || '',
              studentType: student.studentType || 'regular',
              shift: student.shift || '',
              studentId: student.studentId || '',
            },
          });
        }
      }

      // 2. Validate Student Type (Regular vs Distance) if specified
      if (targetType && student.studentType && student.studentType.toLowerCase() !== targetType.toLowerCase()) {
        const isTargetDist = targetType.toLowerCase() === 'distance';
        const isStudentDist = student.studentType.toLowerCase() === 'distance';
        return res.status(400).json({
          success: false,
          notAssigned: true,
          message: `⚠️ የተማሪው የምዝገባ ዘርፍ (${isStudentDist ? 'የርቀት' : 'መደበኛ'}) ከተመረጠው (${isTargetDist ? 'የርቀት' : 'መደበኛ'}) ጋር አይዛመድም።`,
          student: {
            id: student._id,
            name: getStudentFullName(student),
            grade: student.grade || student.batch || '',
            studentType: student.studentType || 'regular',
            shift: student.shift || '',
            studentId: student.studentId || '',
          },
        });
      }

      // 3. Validate Shift (Day/Weekend vs Night) if specified and regular
      if (targetShift && targetType !== 'distance' && student.shift && student.shift.toLowerCase() !== targetShift.toLowerCase()) {
        const isTargetNight = targetShift.toLowerCase() === 'night';
        const isStudentNight = student.shift.toLowerCase() === 'night';
        return res.status(400).json({
          success: false,
          notAssigned: true,
          message: `⚠️ የተማሪው ፈረቃ (${isStudentNight ? 'ማታ' : 'ቀን'}) ከተመረጠው ፈረቃ (${isTargetNight ? 'ማታ' : 'ቀን'}) ጋር አይዛመድም።`,
          student: {
            id: student._id,
            name: getStudentFullName(student),
            grade: student.grade || student.batch || '',
            studentType: student.studentType || 'regular',
            shift: student.shift || '',
            studentId: student.studentId || '',
          },
        });
      }
    }

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
        message: 'ለዛሬ ቀደም ሲል ተመዝግቧል (Already Checked)',
        student: {
          id: student._id,
          name: getStudentFullName(student),
          grade: student.grade || student.batch || '',
          studentType: student.studentType || 'regular',
          shift: student.shift || '',
          studentId: student.studentId || '',
        },
        alreadyRecorded: true,
      });
    }

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

    try {
      await Attendance.create({
        student: student._id,
        studentName: getStudentFullName(student),
        grade: student.grade || student.batch || '',
        studentType: student.studentType || 'regular',
        shift: student.shift || '',
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
    } catch (createErr) {
      if (createErr.code === 11000) {
        return res.json({
          success: true,
          message: 'ለዛሬ ቀደም ሲል ተመዝግቧል (Already Checked)',
          student: {
            id: student._id,
            name: getStudentFullName(student),
            grade: student.grade || student.batch || '',
            studentType: student.studentType || 'regular',
            shift: student.shift || '',
            studentId: student.studentId || '',
          },
          alreadyRecorded: true,
        });
      }
      throw createErr;
    }

    res.json({
      success: true,
      message: 'ተገኝነት በተሳካ ሁኔታ ተመዝግቧል!',
      student: {
        id: student._id,
        name: getStudentFullName(student),
        grade: student.grade || student.batch || '',
        studentType: student.studentType || 'regular',
        shift: student.shift || '',
        studentId: student.studentId || '',
      },
    });
  } catch (err) {
    console.error('Attendance scan error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Manual attendance ----------
router.post('/manual', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId, courseId, status: forcedStatus, excuseReason, note, date: customDate } = req.body;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const attendanceDate = customDate ? new Date(customDate) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const targetStatus = forcedStatus || 'Present';
    const targetReason = excuseReason || note || '';

    const alreadyMarked = await Attendance.findOne({
      student: student._id,
      date: { $gte: attendanceDate, $lt: nextDay },
      ...(courseId ? { course: courseId } : {}),
    });

    if (alreadyMarked) {
      alreadyMarked.status = targetStatus;
      if (targetReason) {
        alreadyMarked.excuseReason = targetReason;
        alreadyMarked.note = targetReason;
      }
      alreadyMarked.updatedBy = req.user._id;
      await alreadyMarked.save();

      return res.json({
        success: true,
        message: `የተማሪው ተገኝነት ተቀይሯል፦ ${targetStatus}`,
        student: {
          id: student._id,
          name: getStudentFullName(student),
          grade: student.grade || student.batch || '',
          studentType: student.studentType || 'regular',
          shift: student.shift || '',
          studentId: student.studentId || '',
        },
        status: targetStatus,
        updated: true,
      });
    }

    let courseName = '';
    let teacher = null;
    let teacherName = '';
    if (courseId) {
      const course = await Course.findById(courseId).populate('teacher', 'fullName');
      if (course) {
        // Validate if student is eligible for this course
        const eligibility = isStudentEligibleForCourse(student, course);
        if (!eligibility.eligible) {
          return res.status(400).json({
            success: false,
            notAssigned: true,
            message: eligibility.reason,
            student: {
              id: student._id,
              name: getStudentFullName(student),
              grade: student.grade || student.batch || '',
              studentType: student.studentType || 'regular',
              shift: student.shift || '',
              studentId: student.studentId || '',
            },
          });
        }

        courseName = course.name;
        if (course.teacher) {
          teacher = course.teacher._id;
          teacherName = course.teacher.fullName;
        }
      }
    } else if (req.body.grade) {
      const targetGrade = req.body.grade;
      const sGrade = (student.grade || student.batch || '').toString().trim().toLowerCase();
      const norm = (str) => {
        const m = str.match(/\d+/);
        if (m) return (str.includes('batch') || str.includes('ዙር')) ? `batch_${m[0]}` : `grade_${m[0]}`;
        return str.replace(/\s+/g, '');
      };
      if (sGrade && norm(sGrade) !== norm(targetGrade.toLowerCase())) {
        return res.status(400).json({
          success: false,
          notAssigned: true,
          message: `⚠️ ይህ ተማሪ ለተመረጠው ክፍል አልተመደበም። የተማሪው ክፍል፦ ${formatGradeAmharic(student.grade || student.batch)} | የተመረጠው ክፍል፦ ${formatGradeAmharic(targetGrade)}`,
          student: {
            id: student._id,
            name: getStudentFullName(student),
            grade: student.grade || student.batch || '',
            studentType: student.studentType || 'regular',
            shift: student.shift || '',
            studentId: student.studentId || '',
          },
        });
      }
    }

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

    try {
      await Attendance.create({
        student: student._id,
        studentName: getStudentFullName(student),
        grade: student.grade || student.batch || '',
        studentType: student.studentType || 'regular',
        shift: student.shift || '',
        course: courseId || null,
        courseName,
        teacher,
        teacherName,
        date: attendanceDate,
        checkInTime: customDate ? new Date(customDate) : new Date(),
        status: targetStatus,
        excuseReason: targetReason,
        note: targetReason,
        recordedBy: req.user._id,
        academicYear,
        semester,
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        return res.json({
          success: true,
          message: 'ለዚህ ቀን ቀደም ሲል ተመዝግቧል',
          student: {
            id: student._id,
            name: getStudentFullName(student),
            grade: student.grade || student.batch || '',
            studentType: student.studentType || 'regular',
            shift: student.shift || '',
            studentId: student.studentId || '',
          },
          alreadyRecorded: true,
        });
      }
      throw createErr;
    }

    res.json({
      success: true,
      message: 'ተገኝነት በተሳካ ሁኔታ ተመዝግቧል!',
      student: {
        id: student._id,
        name: getStudentFullName(student),
        grade: student.grade || student.batch || '',
        studentType: student.studentType || 'regular',
        shift: student.shift || '',
        studentId: student.studentId || '',
      },
    });
  } catch (err) {
    console.error('Manual attendance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Attendance report ----------
router.get('/report', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { startDate, endDate, courseId, grade, status, teacher, studentId, studentType, shift } = req.query;
    const query = {};

    if (startDate && endDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      query.date = { $gte: s, $lte: e };
    } else if (startDate) {
      const s = new Date(startDate);
      s.setHours(0, 0, 0, 0);
      query.date = { $gte: s };
    } else if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      query.date = { $lte: e };
    }

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) query.course = courseId;
    if (grade) {
      const m = grade.match(/\d+/);
      if (m) {
        query.grade = { $regex: new RegExp(`(${m[0]}|${grade})`, 'i') };
      } else {
        query.grade = { $regex: new RegExp(grade, 'i') };
      }
    }
    if (status) query.status = status;
    if (teacher && mongoose.Types.ObjectId.isValid(teacher)) query.teacher = teacher;
    if (studentId) query.student = studentId;
    if (studentType) {
      query.$or = [
        { studentType: studentType },
        { studentType: studentType.toLowerCase() }
      ];
    }
    if (shift) query.shift = shift;

    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
      const courseIds = teacherCourses.map(c => c._id);
      query.course = { $in: courseIds };
    }

    const attendances = await Attendance.find(query)
      .populate('student', 'firstName middleName lastName grade studentId shift studentType phone')
      .populate('course', 'name')
      .populate('teacher', 'fullName')
      .populate('recordedBy', 'fullName')
      .sort({ date: -1, checkInTime: -1 });

    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'Present').length;
    const late = attendances.filter(a => a.status === 'Late').length;
    const absent = attendances.filter(a => a.status === 'Absent').length;
    const excused = attendances.filter(a => a.status === 'Excused').length;
    const regular = attendances.filter(a => (a.studentType || a.student?.studentType) === 'regular').length;
    const distance = attendances.filter(a => (a.studentType || a.student?.studentType) === 'distance').length;
    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    const onTimeRate = total > 0 ? Math.round((present / total) * 100) : 0;

    // Grade / Class breakdown
    const byGrade = {};
    attendances.forEach((a) => {
      const g = a.grade || a.student?.grade || 'አጠቃላይ';
      if (!byGrade[g]) {
        byGrade[g] = { total: 0, present: 0, late: 0, absent: 0, excused: 0 };
      }
      byGrade[g].total++;
      if (a.status === 'Present') byGrade[g].present++;
      else if (a.status === 'Late') byGrade[g].late++;
      else if (a.status === 'Absent') byGrade[g].absent++;
      else if (a.status === 'Excused') byGrade[g].excused++;
    });

    const summary = {
      total,
      present,
      absent,
      late,
      excused,
      regular,
      distance,
      attendanceRate,
      onTimeRate,
      byGrade,
    };

    res.json({
      success: true,
      summary,
      attendances,
    });
  } catch (err) {
    console.error('Attendance report error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Get attendance by student ID ----------
router.get('/student/:studentId', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { courseId, startDate, endDate } = req.query;

    let targetStudentIds = [];
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      targetStudentIds.push(new mongoose.Types.ObjectId(studentId));
    }
    const studentUser = await User.findOne({
      $or: [
        { studentId: studentId },
        ...(mongoose.Types.ObjectId.isValid(studentId) ? [{ _id: new mongoose.Types.ObjectId(studentId) }] : [])
      ]
    });
    if (studentUser) {
      targetStudentIds.push(studentUser._id);
    }
    const profile = await StudentProfile.findOne({ studentId: studentId });
    if (profile) {
      if (profile.userId) targetStudentIds.push(profile.userId);
      if (profile._id) targetStudentIds.push(profile._id);
    }

    const validObjectIds = targetStudentIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    const query = validObjectIds.length > 0
      ? {
          $or: [
            { student: { $in: validObjectIds } },
            { studentProfileId: { $in: validObjectIds } },
          ]
        }
      : { studentName: studentId };

    if (courseId && mongoose.Types.ObjectId.isValid(courseId)) query.course = courseId;
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const attendances = await Attendance.find(query)
      .populate('course', 'name')
      .populate('teacher', 'fullName')
      .sort({ date: -1 });

    const stats = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'Present').length,
      absent: attendances.filter(a => a.status === 'Absent').length,
      late: attendances.filter(a => a.status === 'Late').length,
      excused: attendances.filter(a => a.status === 'Excused').length,
      attendanceRate: attendances.length > 0 
        ? ((attendances.filter(a => a.status === 'Present' || a.status === 'Late').length / attendances.length) * 100).toFixed(2)
        : 0,
    };

    res.json({
      success: true,
      stats,
      attendances,
    });
  } catch (err) {
    console.error('Student attendance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Get today's attendance summary ----------
router.get('/today', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = {
      date: { $gte: today, $lt: tomorrow }
    };

    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ teacher: req.user._id }).select('_id');
      const courseIds = teacherCourses.map(c => c._id);
      query.course = { $in: courseIds };
    }

    const attendances = await Attendance.find(query)
      .populate('student', 'firstName middleName lastName grade')
      .populate('course', 'name');

    const grouped = {};
    attendances.forEach(att => {
      const courseId = att.course?._id || 'uncategorized';
      if (!grouped[courseId]) {
        grouped[courseId] = {
          courseName: att.course?.name || 'Uncategorized',
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
        };
      }
      grouped[courseId].total++;
      grouped[courseId][att.status?.toLowerCase() || 'absent']++;
    });

    res.json({
      success: true,
      total: attendances.length,
      byCourse: Object.values(grouped),
      attendances,
    });
  } catch (err) {
    console.error('Today attendance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Update attendance status ----------
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status || !['Present', 'Absent', 'Late', 'Excused'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status (Present, Absent, Late, Excused) is required'
      });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { 
        status,
        ...(note && { note }),
        updatedBy: req.user._id,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('student', 'firstName middleName lastName grade')
     .populate('course', 'name');

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    res.json({ success: true, message: 'Attendance updated successfully', attendance });
  } catch (err) {
    console.error('Update attendance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Delete attendance record ----------
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findByIdAndDelete(id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.json({ success: true, message: 'Attendance record deleted successfully' });
  } catch (err) {
    console.error('Delete attendance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Class Roster with attendance status for a date ----------
router.get('/roster', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { grade, courseId, date, studentType, shift } = req.query;
    const query = {};

    if (grade && grade.trim()) {
      const num = grade.match(/\d+/);
      if (num) {
        query.$or = [
          { grade: { $regex: new RegExp(`(${num[0]}|${grade})`, 'i') } },
          { batch: { $regex: new RegExp(`(${num[0]}|${grade})`, 'i') } },
        ];
      } else {
        query.$or = [
          { grade: { $regex: new RegExp(grade, 'i') } },
          { batch: { $regex: new RegExp(grade, 'i') } },
        ];
      }
    }
    if (studentType && studentType.trim()) {
      query.studentType = { $regex: new RegExp(`^${studentType.trim()}$`, 'i') };
    }
    if (shift && shift.trim()) {
      query.shift = { $regex: new RegExp(shift.trim(), 'i') };
    }

    const students = await Student.find(query)
      .select('firstName middleName lastName christianName studentId grade batch studentType shift phone qrCode photo photoUrl')
      .sort({ firstName: 1, lastName: 1 });

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const attendances = await Attendance.find({
      student: { $in: students.map(s => s._id) },
      date: { $gte: attendanceDate, $lt: nextDay },
      ...(courseId ? { course: courseId } : {}),
    });

    const attendanceMap = new Map();
    attendances.forEach(att => {
      attendanceMap.set(att.student.toString(), att);
    });

    const roster = students.map(s => {
      const att = attendanceMap.get(s._id.toString());
      return {
        _id: s._id,
        studentId: s.studentId,
        fullName: `${s.firstName || ''} ${s.middleName || ''} ${s.lastName || ''}`.trim(),
        firstName: s.firstName,
        lastName: s.lastName,
        christianName: s.christianName || '',
        photoUrl: s.photoUrl || s.photo || '',
        grade: s.grade || s.batch || '',
        studentType: s.studentType || 'regular',
        shift: s.shift || '',
        phone: s.phone || '',
        photo: s.photo || '',
        attendanceId: att ? att._id : null,
        status: att ? att.status : null,
        excuseReason: att ? (att.excuseReason || att.note || '') : '',
        note: att ? (att.note || att.excuseReason || '') : '',
        checkInTime: att ? att.checkInTime : null,
      };
    });

    res.json({
      success: true,
      totalStudents: students.length,
      markedCount: attendances.length,
      roster,
    });
  } catch (err) {
    console.error('Roster fetch error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Finalize Attendance / Mark Unscanned as Absent ----------
router.post(['/mark-unscanned-absent', '/finalize-session'], authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { grade, courseId, date, studentType, shift, defaultStatus = 'Absent' } = req.body;
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

    let effectiveGrade = grade ? grade.trim() : '';
    let effectiveStudentType = studentType ? studentType.trim() : '';
    let effectiveShift = shift ? shift.trim() : '';

    if (courseId && (!effectiveGrade || !effectiveStudentType)) {
      const courseObj = await Course.findById(courseId);
      if (courseObj) {
        if (!effectiveGrade && courseObj.grade) effectiveGrade = courseObj.grade;
        if (!effectiveStudentType && courseObj.studentType) effectiveStudentType = courseObj.studentType;
        if (!effectiveShift && courseObj.shift) effectiveShift = courseObj.shift;
      }
    }

    // 🛡️ CRITICAL SAFETY GUARDRAIL: Require grade, studentType, and shift (if regular)
    // to prevent marking students from other classes who had no school today as absent!
    if (!effectiveStudentType) {
      return res.status(400).json({
        success: false,
        message: 'እባክዎ የምዝገባ ዓይነት (መደበኛ ወይም የርቀት) ይምረጡ። ያለ ዘርፍ ምርጫ በጅምላ "አልተገኘም" ማድረግ አይፈቀድም።',
      });
    }

    if (!effectiveGrade) {
      return res.status(400).json({
        success: false,
        message: 'እባክዎ የተወሰነ ክፍል (Class / Grade / Batch) ይምረጡ። ያለ ክፍል ምርጫ ሌሎች ትምህርት የሌላቸውን ተማሪዎች በስህተት "አልተገኘም" እንዳይባሉ ይጠብቃል።',
      });
    }

    if (effectiveStudentType.toLowerCase() === 'regular' && !effectiveShift) {
      return res.status(400).json({
        success: false,
        message: 'ለመደበኛ ተማሪዎች እባክዎ የመማሪያ ፈረቃ (ቀን ወይም ማታ) ይምረጡ።',
      });
    }

    // Build strict query for enrolled students in this specific class & shift only
    const studentQuery = {};
    const num = effectiveGrade.match(/\d+/);
    if (num) {
      studentQuery.$or = [
        { grade: { $regex: new RegExp(`(${num[0]}|${effectiveGrade})`, 'i') } },
        { batch: { $regex: new RegExp(`(${num[0]}|${effectiveGrade})`, 'i') } },
      ];
    } else {
      studentQuery.$or = [
        { grade: { $regex: new RegExp(effectiveGrade, 'i') } },
        { batch: { $regex: new RegExp(effectiveGrade, 'i') } },
      ];
    }

    studentQuery.studentType = { $regex: new RegExp(`^${effectiveStudentType}$`, 'i') };

    if (effectiveStudentType.toLowerCase() === 'regular' && effectiveShift) {
      studentQuery.shift = { $regex: new RegExp(`^${effectiveShift}$`, 'i') };
    }

    const students = await Student.find(studentQuery);
    if (!students || students.length === 0) {
      return res.status(404).json({ success: false, message: 'ምንም ተማሪዎች አልተገኙም (No students found matching this criteria)' });
    }

    // Find already recorded students for today (Present, Late, Excused, Absent)
    const existingRecords = await Attendance.find({
      student: { $in: students.map(s => s._id) },
      date: { $gte: attendanceDate, $lt: nextDay },
      ...(courseId ? { course: courseId } : {}),
    });

    const recordedStudentIds = new Set(existingRecords.map(r => r.student.toString()));
    const unscannedStudents = students.filter(s => !recordedStudentIds.has(s._id.toString()));

    if (unscannedStudents.length === 0) {
      return res.json({
        success: true,
        message: `ሁሉም (${students.length}) ተማሪዎች አስቀድመው ተመዝግበዋል። ምንም አዲስ ያልተገኘ ተማሪ የለም።`,
        totalStudents: students.length,
        alreadyRecordedCount: existingRecords.length,
        markedAbsentCount: 0,
      });
    }

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

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();
    const academicYear = month >= 5 && month <= 11 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
    const semester = month >= 5 && month <= 11 ? 'First' : 'Second';

    const newRecords = [];
    for (const student of unscannedStudents) {
      newRecords.push({
        student: student._id,
        studentName: getStudentFullName(student),
        grade: student.grade || student.batch || '',
        studentType: student.studentType || 'regular',
        shift: student.shift || '',
        course: courseId || null,
        courseName,
        teacher,
        teacherName,
        date: attendanceDate,
        checkInTime: new Date(),
        status: defaultStatus || 'Absent',
        recordedBy: req.user._id,
        academicYear,
        semester,
      });
    }

    if (newRecords.length > 0) {
      await Attendance.insertMany(newRecords, { ordered: false });
    }

    res.json({
      success: true,
      message: unscannedStudents.length > 0
        ? `ክፍለ ጊዜው ተጠናቋል፦ ${unscannedStudents.length} ያልተገኙ ተማሪዎች 'አልተገኘም' (Absent) ተብለው ተመዝግበዋል።`
        : 'ሁሉም ተማሪዎች አስቀድመው ተመዝግበዋል። ምንም አዲስ ያልተገኘ ተማሪ የለም።',
      totalStudents: students.length,
      alreadyRecordedCount: existingRecords.length,
      markedAbsentCount: unscannedStudents.length,
    });
  } catch (err) {
    console.error('Finalize session error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Bulk attendance (Supports roster submission and itemized statuses & notes) ----------
router.post('/bulk', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { studentIds, records, courseId, status, date } = req.body;

    const items = records && Array.isArray(records) && records.length > 0
      ? records
      : (studentIds || []).map(id => ({ studentId: id, status: status || 'Present' }));

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Student records or IDs array is required' });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(attendanceDate);
    nextDay.setDate(nextDay.getDate() + 1);

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

    const results = [];
    const errors = [];

    for (const item of items) {
      const targetId = item.studentId || item.id || item._id;
      const targetStatus = item.status || status || 'Present';
      const targetReason = item.excuseReason || item.note || '';

      try {
        const student = await Student.findById(targetId);
        if (!student) {
          errors.push({ studentId: targetId, error: 'Student not found' });
          continue;
        }

        const existing = await Attendance.findOne({
          student: student._id,
          date: { $gte: attendanceDate, $lt: nextDay },
          ...(courseId ? { course: courseId } : {}),
        });

        if (existing) {
          existing.status = targetStatus;
          if (targetReason) {
            existing.excuseReason = targetReason;
            existing.note = targetReason;
          }
          existing.updatedBy = req.user._id;
          await existing.save();
          results.push({
            studentId: student._id,
            studentName: getStudentFullName(student),
            status: targetStatus,
            action: 'updated',
          });
        } else {
          await Attendance.create({
            student: student._id,
            studentName: getStudentFullName(student),
            grade: student.grade || student.batch || '',
            studentType: student.studentType || 'regular',
            shift: student.shift || '',
            course: courseId || null,
            courseName,
            teacher,
            teacherName,
            date: attendanceDate,
            checkInTime: new Date(),
            status: targetStatus,
            excuseReason: targetReason,
            note: targetReason,
            recordedBy: req.user._id,
          });
          results.push({
            studentId: student._id,
            studentName: getStudentFullName(student),
            status: targetStatus,
            action: 'created',
          });
        }
      } catch (err) {
        errors.push({ studentId: targetId, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `ተገኝነት ተመዝግቧል፦ ${results.length} ተማሪዎች በተሳካ ሁኔታ ተመዝግበዋል።`,
      results,
      errors,
    });
  } catch (err) {
    console.error('Bulk attendance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

