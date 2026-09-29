const mongoose = require('mongoose');
const ClassSchedule = require('../../models/education/ClassSchedule');
const ClassSession = require('../../models/education/ClassSession');
const Attendance = require('../../models/education/Attendance');
const Student = require('../../models/Student');
const User = require('../../models/User');
const Certificate = require('../../models/education/Certificate');
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');

// Helper: Ethiopian 3-part name or fallback
const getStudentFullName = (s) => {
  if (!s) return 'ተማሪ';
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ').trim() || 'ተማሪ';
};

// Helper: Format grade in Amharic & English for clear rejection messages
const formatGradeLabel = (g) => {
  if (!g) return 'ያልታወቀ ክፍል';
  const num = g.match(/\d+/);
  if (g.toLowerCase().includes('batch') || g.includes('ዙር')) {
    return num ? `ዙር ${num[0]} / Batch ${num[0]}` : g;
  }
  if (num) return `${num[0]}ኛ ክፍል (Grade ${num[0]})`;
  return g;
};

// Helper: Normalize grade for comparison
const normalizeGrade = (g) => {
  if (!g) return '';
  const str = g.toString().toLowerCase().trim();
  const match = str.match(/\d+/);
  if (match) {
    if (str.includes('batch') || str.includes('ዙር')) {
      return `batch_${match[0]}`;
    }
    return `grade_${match[0]}`;
  }
  return str.replace(/\s+/g, '');
};

// Helper: Check if student grade matches session grade
const isGradeMatch = (studentGrade, sessionGrade) => {
  if (!studentGrade || !sessionGrade) return false;
  return normalizeGrade(studentGrade) === normalizeGrade(sessionGrade);
};

// Helper: Build query for expected active students based on grade, studentType, and shift
const getExpectedStudentsQuery = (sessionOrSchedule) => {
  const grade = sessionOrSchedule.grade;
  const studentType = sessionOrSchedule.studentType || 'regular';
  const shift = sessionOrSchedule.shift || 'weekend';

  const query = {
    $or: [{ grade: grade }, { batch: grade }],
  };

  if (studentType === 'distance') {
    query.studentType = 'distance';
  } else {
    query.studentType = { $ne: 'distance' };
    if (shift && shift !== 'all') {
      query.shift = shift;
    }
  }

  return query;
};

// Helper: Check if user is authorized to take attendance for a session
const isTakerAuthorized = (user, session) => {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'superadmin' || user.isAdmin) return true;
  if (!session || !session.assignedTakers) return false;
  
  const userIdStr = (user._id || user.id).toString();
  return session.assignedTakers.some(t => {
    const id = t._id ? t._id.toString() : t.toString();
    return id === userIdStr;
  });
};

// Helper: Get local date string YYYY-MM-DD
const getLocalDateString = (d = new Date()) => {
  const date = new Date(d);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ============================================================================
// 1. ATTENDANCE TAKER: GET TODAY'S AUTHORIZED SESSIONS
// ============================================================================
exports.getTodayAuthorizedSessions = async (req, res) => {
  try {
    const queryDate = req.query.date || getLocalDateString();
    const targetDateObj = new Date(queryDate);
    const dayOfWeek = targetDateObj.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // 1. Auto-generate sessions from recurring schedules if not already generated for queryDate
    const recurringSchedules = await ClassSchedule.find({
      dayOfWeek: dayOfWeek,
      isActive: true,
    });

    for (const schedule of recurringSchedules) {
      const existingSession = await ClassSession.findOne({
        sessionDate: queryDate,
        scheduleId: schedule._id,
      });

      if (!existingSession) {
        // Calculate expected active student count for this grade and shift
        const expectedCount = await Student.countDocuments(getExpectedStudentsQuery(schedule));

        const shiftLabel = schedule.studentType === 'distance'
          ? 'የርቀት'
          : schedule.shift === 'night'
          ? 'የማታ ፈረቃ'
          : 'የቀን ፈረቃ';

        await ClassSession.create({
          title: schedule.name || `${schedule.grade} (${shiftLabel}) - Session`,
          scheduleId: schedule._id,
          grade: schedule.grade,
          gradeId: schedule.gradeId,
          studentType: schedule.studentType || 'regular',
          shift: schedule.shift || 'weekend',
          course: schedule.course,
          academicYear: schedule.academicYear,
          sessionDate: queryDate,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          lateThresholdMinutes: schedule.lateThresholdMinutes || 15,
          assignedTakers: schedule.assignedTakers || [],
          location: schedule.location || '',
          status: 'scheduled',
          stats: {
            expectedCount: expectedCount,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0,
            excusedCount: 0,
          },
        });
      }
    }

    // 2. Query sessions for the date
    let sessionFilter = { sessionDate: queryDate };
    
    // Non-admin users only see sessions they are assigned to
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.isAdmin;
    if (!isAdmin) {
      sessionFilter.assignedTakers = req.user._id;
    }

    const sessions = await ClassSession.find(sessionFilter)
      .populate('assignedTakers', 'fullName email phone role')
      .populate('course', 'name code')
      .populate('openedBy', 'fullName')
      .populate('closedBy', 'fullName')
      .sort({ startTime: 1 });

    // Refresh live stats for each session
    const enrichedSessions = await Promise.all(
      sessions.map(async (sess) => {
        const sessObj = sess.toObject();
        
        // Count active enrolled students for this class & shift
        const expected = await Student.countDocuments(getExpectedStudentsQuery(sess));

        // Count attendance records by status
        const present = await Attendance.countDocuments({ sessionId: sess._id, status: 'Present' });
        const late = await Attendance.countDocuments({ sessionId: sess._id, status: 'Late' });
        const absent = await Attendance.countDocuments({ sessionId: sess._id, status: 'Absent' });
        const excused = await Attendance.countDocuments({ sessionId: sess._id, status: 'Excused' });

        sessObj.stats = {
          expectedCount: expected,
          presentCount: present,
          lateCount: late,
          absentCount: absent,
          excusedCount: excused,
        };

        return sessObj;
      })
    );

    res.json({
      success: true,
      date: queryDate,
      isAdmin,
      count: enrichedSessions.length,
      sessions: enrichedSessions,
    });
  } catch (err) {
    console.error('getTodayAuthorizedSessions error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================================
// 2. START ATTENDANCE SESSION
// ============================================================================
exports.startSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await ClassSession.findById(id).populate('assignedTakers', 'fullName');
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'Class session not found.' });
    }

    // Authorization check
    if (!isTakerAuthorized(req.user, session)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to take attendance for this session.',
      });
    }

    if (session.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This session has been cancelled and cannot be opened.',
      });
    }

    // Calculate current expected students count
    const expectedCount = await Student.countDocuments({
      $or: [
        { grade: session.grade },
        { batch: session.grade },
      ],
    });

    session.status = 'open';
    session.openedAt = session.openedAt || new Date();
    session.openedBy = req.user._id;
    session.stats.expectedCount = expectedCount;
    await session.save();

    res.json({
      success: true,
      message: `Session for ${session.grade} is now OPEN. Ready for scanning.`,
      session,
    });
  } catch (err) {
    console.error('startSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================================
// 3. SCAN STUDENT IN SESSION (Backend decides class, enrollment & status)
// ============================================================================
exports.scanStudentInSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { qrCode } = req.body;

    if (!qrCode || typeof qrCode !== 'string' || !qrCode.trim()) {
      return res.status(400).json({ success: false, message: 'Valid QR code data is required.' });
    }

    // 1. Verify Session & Status
    const session = await ClassSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    if (session.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: `Session is currently ${session.status.toUpperCase()}. Attendance can only be scanned when the session is OPEN.`,
      });
    }

    // 2. Verify Taker Authorization
    if (!isTakerAuthorized(req.user, session)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to take attendance for this session.',
      });
    }

    // 3. Decode QR Token & Find Student
    const trimmedQr = qrCode.trim();
    let searchId = trimmedQr;

    try {
      const parsed = JSON.parse(trimmedQr);
      if (parsed.studentId) searchId = parsed.studentId;
      else if (parsed.qrCode) searchId = parsed.qrCode;
      else if (parsed.id) searchId = parsed.id;
      else if (parsed.certificateNumber) searchId = parsed.certificateNumber;
    } catch (e) {}

    // Parse URL parameter if URL QR code was scanned
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
      } catch (urlErr) {}
    }

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

    if (certStudentId) queryConditions.push({ _id: certStudentId });
    if (mongoose.Types.ObjectId.isValid(searchId)) queryConditions.push({ _id: searchId });
    if (mongoose.Types.ObjectId.isValid(trimmedQr)) queryConditions.push({ _id: trimmedQr });

    const student = await Student.findOne({ $or: queryConditions });

    if (!student) {
      return res.status(404).json({
        success: false,
        status: 'not_found',
        message: `Student QR code not found (${searchId}). Please verify the student identity.`,
      });
    }

    const studentFullName = getStudentFullName(student);
    const studentGrade = student.grade || student.batch || '';

    // 4. IMPORTANT BUSINESS RULE: Verify Enrolled Class
    if (!isGradeMatch(studentGrade, session.grade)) {
      return res.status(400).json({
        success: false,
        status: 'class_mismatch',
        rejected: true,
        message: `⚠️ Attendance rejected: ${studentFullName} is enrolled in ${formatGradeLabel(studentGrade)}, not ${formatGradeLabel(session.grade)}.`,
        student: {
          id: student._id,
          studentId: student.studentId,
          name: studentFullName,
          enrolledGrade: studentGrade,
          sessionGrade: session.grade,
          photoUrl: student.photoUrl,
        },
      });
    }

    // 4b. Verify Track / StudentType (Regular vs Distance)
    const sessionType = session.studentType || 'regular';
    const studentType = student.studentType || 'regular';
    if (sessionType !== studentType) {
      const isSessionDist = sessionType === 'distance';
      return res.status(400).json({
        success: false,
        status: 'track_mismatch',
        rejected: true,
        message: `⚠️ Attendance rejected: ${studentFullName} is registered in ${isSessionDist ? 'መደበኛ (Regular)' : 'የርቀት (Distance)'} program.`,
        student: {
          id: student._id,
          studentId: student.studentId,
          name: studentFullName,
          enrolledGrade: studentGrade,
          photoUrl: student.photoUrl,
        },
      });
    }

    // 4c. Verify Shift Match (Day/Weekend vs Night) for Regular students
    if (sessionType === 'regular' && session.shift && session.shift !== 'all' && student.shift) {
      const studentShift = (student.shift || 'weekend').toLowerCase();
      const sessionShift = session.shift.toLowerCase();
      if (studentShift !== sessionShift) {
        const isStudentNight = studentShift === 'night';
        const isSessionNight = sessionShift === 'night';
        return res.status(400).json({
          success: false,
          status: 'shift_mismatch',
          rejected: true,
          message: `⚠️ Attendance rejected: ${studentFullName} is enrolled in ${isStudentNight ? 'የማታ ፈረቃ (Night Shift)' : 'የቀን ፈረቃ (Day/Weekend Shift)'}, not ${isSessionNight ? 'የማታ ፈረቃ' : 'የቀን ፈረቃ'}.`,
          student: {
            id: student._id,
            studentId: student.studentId,
            name: studentFullName,
            enrolledGrade: studentGrade,
            enrolledShift: student.shift,
            sessionGrade: session.grade,
            sessionShift: session.shift,
            photoUrl: student.photoUrl,
          },
        });
      }
    }

    // 5. Check for Duplicate Attendance in this session
    const existingAttendance = await Attendance.findOne({
      sessionId: session._id,
      student: student._id,
    });

    if (existingAttendance) {
      return res.status(200).json({
        success: true,
        status: 'duplicate',
        alreadyMarked: true,
        attendanceStatus: existingAttendance.status,
        scannedAt: existingAttendance.scannedAt || existingAttendance.createdAt,
        message: `ℹ️ ${studentFullName} is already marked as ${existingAttendance.status}.`,
        student: {
          id: student._id,
          studentId: student.studentId,
          name: studentFullName,
          grade: studentGrade,
          photoUrl: student.photoUrl,
          phone: student.studentPhone,
        },
      });
    }

    // 6. Calculate Present vs Late
    const now = new Date();
    let calculatedStatus = 'Present';

    if (session.startTime) {
      const [startHour, startMinute] = session.startTime.split(':').map(Number);
      const sessionDateObj = new Date(session.sessionDate);
      
      const sessionStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        startHour || 0,
        startMinute || 0,
        0
      );

      const lateThresholdMs = (session.lateThresholdMinutes || 15) * 60 * 1000;
      const lateCutoffTime = new Date(sessionStart.getTime() + lateThresholdMs);

      if (now > lateCutoffTime) {
        calculatedStatus = 'Late';
      }
    }

    // 7. Save Attendance Record
    const attendanceRecord = await Attendance.create({
      sessionId: session._id,
      student: student._id,
      studentProfileId: student.studentProfileId || null,
      course: session.course || null,
      studentName: studentFullName,
      grade: studentGrade,
      studentType: student.studentType || 'regular',
      shift: student.shift || '',
      teacher: req.user._id,
      teacherName: req.user.fullName || '',
      date: new Date(session.sessionDate),
      checkInTime: now,
      scannedAt: now,
      scanMethod: 'qr_scan',
      status: calculatedStatus,
      recordedBy: req.user._id,
    });

    // 8. Update Live Session Stats
    if (calculatedStatus === 'Present') {
      session.stats.presentCount = (session.stats.presentCount || 0) + 1;
    } else if (calculatedStatus === 'Late') {
      session.stats.lateCount = (session.stats.lateCount || 0) + 1;
    }
    await session.save();

    res.status(201).json({
      success: true,
      status: calculatedStatus.toLowerCase(),
      attendanceStatus: calculatedStatus,
      scannedAt: now,
      message: `✅ ${studentFullName} marked ${calculatedStatus.toUpperCase()} (${formatGradeLabel(studentGrade)})`,
      student: {
        id: student._id,
        studentId: student.studentId,
        name: studentFullName,
        grade: studentGrade,
        photoUrl: student.photoUrl,
        phone: student.studentPhone,
      },
      sessionStats: session.stats,
    });
  } catch (err) {
    console.error('scanStudentInSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================================
// 4. CLOSE SESSION & AUTO-GENERATE ABSENTEES
// ============================================================================
exports.closeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await ClassSession.findById(id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Class session not found.' });
    }

    // Authorization check
    if (!isTakerAuthorized(req.user, session)) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to close this session.',
      });
    }

    if (session.status === 'closed') {
      return res.status(400).json({ success: false, message: 'This session is already closed.' });
    }

    // 1. Find all expected active students in this class and shift
    const expectedStudents = await Student.find(getExpectedStudentsQuery(session));

    // 2. Find all existing attendance records for this session
    const existingRecords = await Attendance.find({ sessionId: session._id });
    const attendedStudentIdMap = new Set(existingRecords.map(r => r.student.toString()));

    // 3. For any expected student without a record, auto-create Absent record
    const absentRecordsToInsert = [];
    const now = new Date();

    for (const student of expectedStudents) {
      if (!attendedStudentIdMap.has(student._id.toString())) {
        absentRecordsToInsert.push({
          sessionId: session._id,
          student: student._id,
          studentProfileId: student.studentProfileId || null,
          course: session.course || null,
          studentName: getStudentFullName(student),
          grade: student.grade || student.batch || session.grade,
          studentType: student.studentType || 'regular',
          shift: student.shift || '',
          teacher: req.user._id,
          teacherName: req.user.fullName || '',
          date: new Date(session.sessionDate),
          checkInTime: now,
          scannedAt: now,
          scanMethod: 'auto_absent_on_close',
          status: 'Absent',
          recordedBy: req.user._id,
        });
      }
    }

    if (absentRecordsToInsert.length > 0) {
      await Attendance.insertMany(absentRecordsToInsert);
    }

    // 4. Update session status and recalculate final stats
    const presentCount = await Attendance.countDocuments({ sessionId: session._id, status: 'Present' });
    const lateCount = await Attendance.countDocuments({ sessionId: session._id, status: 'Late' });
    const absentCount = await Attendance.countDocuments({ sessionId: session._id, status: 'Absent' });
    const excusedCount = await Attendance.countDocuments({ sessionId: session._id, status: 'Excused' });

    session.status = 'closed';
    session.closedAt = now;
    session.closedBy = req.user._id;
    session.stats = {
      expectedCount: expectedStudents.length,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
    };
    await session.save();

    res.json({
      success: true,
      message: `Session closed successfully. ${absentRecordsToInsert.length} students marked Absent.`,
      session,
      summary: {
        totalExpected: expectedStudents.length,
        present: presentCount,
        late: lateCount,
        markedAbsent: absentCount,
      },
    });
  } catch (err) {
    console.error('closeSession error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================================
// 5. GET LIVE SESSION ROSTER & STATUS
// ============================================================================
exports.getSessionLiveRoster = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await ClassSession.findById(id)
      .populate('assignedTakers', 'fullName email phone')
      .populate('openedBy', 'fullName')
      .populate('closedBy', 'fullName');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Find all expected students matching class, track and shift
    const expectedStudents = await Student.find(getExpectedStudentsQuery(session)).sort({ firstName: 1 });

    // Find all attendance records
    const attendanceRecords = await Attendance.find({ sessionId: session._id });
    const attendanceMap = new Map();
    attendanceRecords.forEach(att => {
      attendanceMap.set(att.student.toString(), att);
    });

    const roster = expectedStudents.map(student => {
      const att = attendanceMap.get(student._id.toString());
      return {
        studentId: student._id,
        code: student.studentId,
        name: getStudentFullName(student),
        grade: student.grade || student.batch,
        shift: student.shift,
        photoUrl: student.photoUrl,
        phone: student.studentPhone,
        status: att ? att.status : (session.status === 'closed' ? 'Absent' : 'Not Scanned Yet'),
        scannedAt: att ? att.scannedAt || att.checkInTime : null,
        scanMethod: att ? att.scanMethod : null,
      };
    });

    res.json({
      success: true,
      session,
      roster,
      stats: session.stats,
    });
  } catch (err) {
    console.error('getSessionLiveRoster error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================================
// 6. ADMIN: RECURRING SCHEDULE MANAGEMENT (CRUD)
// ============================================================================
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await ClassSchedule.find()
      .populate('assignedTakers', 'fullName email phone role')
      .populate('course', 'name code')
      .sort({ grade: 1, shift: 1, dayOfWeek: 1, startTime: 1 });

    res.json({ success: true, count: schedules.length, schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const {
      name,
      grade,
      studentType,
      shift,
      course,
      academicYear,
      dayOfWeek,
      startTime,
      endTime,
      lateThresholdMinutes,
      assignedTakers,
      location,
      notes,
    } = req.body;

    if (!grade || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Grade, Day of Week, Start Time, and End Time are required.',
      });
    }

    const sType = studentType || (grade.toLowerCase().includes('batch') || grade.includes('ዙር') ? 'distance' : 'regular');
    const sShift = sType === 'distance' ? '' : (shift || 'weekend');

    const shiftLabel = sType === 'distance' ? 'የርቀት' : sShift === 'night' ? 'የማታ ፈረቃ' : 'የቀን ፈረቃ';

    const schedule = await ClassSchedule.create({
      name: name || `${grade} (${shiftLabel}) - ${getDayName(dayOfWeek)} Timetable`,
      grade,
      studentType: sType,
      shift: sShift,
      course: course || null,
      academicYear: academicYear || '',
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      lateThresholdMinutes: lateThresholdMinutes || 15,
      assignedTakers: assignedTakers || [],
      location: location || '',
      notes: notes || '',
      createdBy: req.user._id,
    });

    const populated = await ClassSchedule.findById(schedule._id)
      .populate('assignedTakers', 'fullName email phone');

    res.status(201).json({ success: true, schedule: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ClassSchedule.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTakers', 'fullName email phone');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    res.json({ success: true, schedule: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    await ClassSchedule.findByIdAndDelete(id);
    res.json({ success: true, message: 'Schedule deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ============================================================================
// 7. ADMIN: SESSION MANAGEMENT (Reschedule, Cancel, Make-Up, Manual Override)
// ============================================================================
exports.getAllSessions = async (req, res) => {
  try {
    const { startDate, endDate, grade, status } = req.query;
    const filter = {};

    if (startDate && endDate) {
      filter.sessionDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      filter.sessionDate = { $gte: startDate };
    } else if (endDate) {
      filter.sessionDate = { $lte: endDate };
    }

    if (grade && grade !== 'all') {
      filter.grade = grade;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    const sessions = await ClassSession.find(filter)
      .populate('assignedTakers', 'fullName email phone')
      .populate('course', 'name')
      .sort({ sessionDate: -1, startTime: 1 });

    res.json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createMakeUpSession = async (req, res) => {
  try {
    const {
      title,
      grade,
      studentType,
      shift,
      course,
      sessionDate,
      startTime,
      endTime,
      lateThresholdMinutes,
      assignedTakers,
      location,
      notes,
    } = req.body;

    if (!grade || !sessionDate || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Grade, Session Date, Start Time, and End Time are required.',
      });
    }

    const sType = studentType || (grade.toLowerCase().includes('batch') || grade.includes('ዙር') ? 'distance' : 'regular');
    const sShift = sType === 'distance' ? '' : (shift || 'weekend');
    const shiftLabel = sType === 'distance' ? 'የርቀት' : sShift === 'night' ? 'የማታ ፈረቃ' : 'የቀን ፈረቃ';

    const sessionPayload = { grade, studentType: sType, shift: sShift };
    const expectedCount = await Student.countDocuments(getExpectedStudentsQuery(sessionPayload));

    const session = await ClassSession.create({
      title: title || `${grade} (${shiftLabel}) - Make-Up Session`,
      scheduleId: null,
      grade,
      studentType: sType,
      shift: sShift,
      course: course || null,
      sessionDate,
      startTime,
      endTime,
      lateThresholdMinutes: lateThresholdMinutes || 15,
      status: 'scheduled',
      isMakeUp: true,
      assignedTakers: assignedTakers || [],
      location: location || '',
      notes: notes || 'Ad-hoc make-up session',
      stats: { expectedCount, presentCount: 0, lateCount: 0, absentCount: 0, excusedCount: 0 },
    });

    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.rescheduleSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime, newEndTime, reason } = req.body;

    const session = await ClassSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.sessionDate = newDate || session.sessionDate;
    if (newStartTime) session.startTime = newStartTime;
    if (newEndTime) session.endTime = newEndTime;
    session.notes = `${session.notes ? session.notes + ' | ' : ''}Rescheduled from original date. Reason: ${reason || 'N/A'}`;
    session.status = 'rescheduled';
    await session.save();

    res.json({ success: true, message: 'Session rescheduled successfully.', session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const session = await ClassSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    session.status = 'cancelled';
    session.cancelledAt = new Date();
    session.cancelledBy = req.user._id;
    session.cancellationReason = reason || 'Cancelled by administrator';
    await session.save();

    res.json({
      success: true,
      message: 'Session cancelled. Students will NOT be penalized with absences.',
      session,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Helper: Day names
function getDayName(dayIndex) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || 'Weekly';
}
