// church-server/routes/education/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const Attendance = require('../../models/education/Attendance');
const Student = require('../../models/Student');
const Course = require('../../models/education/Course');

const getStudentFullName = (s) => {
  if (!s) return 'ተማሪ';
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ').trim() || 'ተማሪ';
};

// All routes require authentication
router.use(protect);

// ---------- Scan QR and record attendance ----------
router.post('/scan', authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { qrCode, courseId, status: forcedStatus } = req.body;
    if (!qrCode || typeof qrCode !== 'string') {
      return res.status(400).json({ success: false, message: 'QR code data required' });
    }

    const trimmedQr = qrCode.trim();
    let searchId = trimmedQr;
    try {
      const parsed = JSON.parse(trimmedQr);
      if (parsed.studentId) searchId = parsed.studentId;
      else if (parsed.qrCode) searchId = parsed.qrCode;
      else if (parsed.id) searchId = parsed.id;
    } catch (e) {
      // not JSON, use raw trimmed string
    }

    const mongoose = require('mongoose');
    const queryConditions = [
      { qrCode: trimmedQr },
      { studentId: searchId },
      { studentId: trimmedQr },
      { registrationNumber: searchId },
      { registrationNumber: trimmedQr },
    ];

    if (mongoose.Types.ObjectId.isValid(searchId)) {
      queryConditions.push({ _id: searchId });
    }
    if (mongoose.Types.ObjectId.isValid(trimmedQr)) {
      queryConditions.push({ _id: trimmedQr });
    }

    const student = await Student.findOne({ $or: queryConditions });
    if (!student) {
      return res.status(404).json({ success: false, message: 'የተማሪው የQR መለያ አልተገኘም። እባክዎ እንደገና ይሞክሩ።' });
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
    const { studentId, courseId, status: forcedStatus, date: customDate } = req.body;
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

    const alreadyMarked = await Attendance.findOne({
      student: student._id,
      date: { $gte: attendanceDate, $lt: nextDay },
      ...(courseId ? { course: courseId } : {}),
    });
    if (alreadyMarked) {
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
        status: forcedStatus || 'Present',
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
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (courseId) query.course = courseId;
    if (grade) query.grade = grade;
    if (status) query.status = status;
    if (teacher) query.teacher = teacher;
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

    const summary = {
      total: attendances.length,
      present: attendances.filter(a => a.status === 'Present').length,
      absent: attendances.filter(a => a.status === 'Absent').length,
      late: attendances.filter(a => a.status === 'Late').length,
      excused: attendances.filter(a => a.status === 'Excused').length,
      regular: attendances.filter(a => (a.studentType || a.student?.studentType) === 'regular').length,
      distance: attendances.filter(a => (a.studentType || a.student?.studentType) === 'distance').length,
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

    const query = { student: studentId };
    if (courseId) query.course = courseId;
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
    const query = { status: 'approved' };

    if (grade) {
      query.$or = [{ grade: grade }, { batch: grade }];
    }
    if (studentType) {
      query.studentType = studentType;
    }
    if (shift) {
      query.shift = shift;
    }

    const students = await Student.find(query)
      .select('firstName middleName lastName studentId grade batch studentType shift phone qrCode photo')
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
        grade: s.grade || s.batch || '',
        studentType: s.studentType || 'regular',
        shift: s.shift || '',
        phone: s.phone || '',
        photo: s.photo || '',
        attendanceId: att ? att._id : null,
        status: att ? att.status : null,
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

// ---------- Bulk attendance (Supports roster submission and itemized statuses) ----------
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

