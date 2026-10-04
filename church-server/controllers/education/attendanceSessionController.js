const mongoose = require('mongoose');
const ClassSchedule = require('../../models/education/ClassSchedule');
const ClassSession = require('../../models/education/ClassSession');
const Attendance = require('../../models/education/Attendance');
const Student = require('../../models/Student');
const User = require('../../models/User');
const Certificate = require('../../models/education/Certificate');
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const {
  getEthiopianTimeInfo,
  parseTimeToMinutes,
  formatMinutesToHHMM,
  getSessionTimeWindowStatus,
  normalizeShift,
  formatShiftLabel,
  isShiftAllowed,
  getExpectedStudentsQuery,
  getStudentFullName,
  autoCloseSingleSession,
  autoCloseExpiredSessions,
} = require('../../services/sessionAutoCloseService');

// Helper: Format grade in Amharic for clear and simple feedback
const formatGradeLabel = (g) => {
  if (!g) return 'ያልታወቀ ክፍል';
  const num = g.match(/\d+/);
  if (g.toLowerCase().includes('batch') || g.includes('ዙር')) {
    return num ? `ዙር ${num[0]}` : g;
  }
  if (num) return `${num[0]}ኛ ክፍል`;
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
  if (sessionGrade.toLowerCase() === 'all' || sessionGrade.toLowerCase() === 'ጥምር' || sessionGrade.toLowerCase() === 'combined' || sessionGrade === 'ጠቅላላ ጉባኤ') {
    return true;
  }
  return normalizeGrade(studentGrade) === normalizeGrade(sessionGrade);
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
    // 0. Auto-close any expired sessions first so status is fresh
    await autoCloseExpiredSessions();

    const ethTime = getEthiopianTimeInfo();
    const queryDate = req.query.date || ethTime.dateString;
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
        // Calculate expected active student count for this grade/shift/combined targets
        const expectedCount = await Student.countDocuments(getExpectedStudentsQuery(schedule));

        const shiftLabel = schedule.studentType === 'distance'
          ? 'የርቀት'
          : schedule.shift === 'night'
          ? 'የማታ ፈረቃ'
          : 'የቀን ፈረቃ';

        const isComb = schedule.isCombinedSession ||
          schedule.sessionType === 'assembly' ||
          schedule.sessionType === 'combined' ||
          schedule.sessionType === 'holiday';

        let defaultTitle = schedule.name;
        if (!defaultTitle) {
          if (schedule.sessionType === 'assembly') defaultTitle = 'ጠቅላላ ጉባኤ (All-School Assembly) - Session';
          else if (schedule.sessionType === 'holiday') defaultTitle = 'የበዓል መርሃ-ግብር (Spiritual Holiday) - Session';
          else if (isComb && schedule.targetGrades?.length > 0) defaultTitle = `ጥምር ክፍሎች (${schedule.targetGrades.join(', ')}) - Session`;
          else defaultTitle = `${schedule.grade} (${shiftLabel}) - Session`;
        }

        await ClassSession.create({
          title: defaultTitle,
          scheduleId: schedule._id,
          grade: schedule.grade,
          gradeId: schedule.gradeId,
          studentType: schedule.studentType || 'regular',
          shift: schedule.shift || 'weekend',
          isCombinedSession: isComb,
          sessionType: schedule.sessionType || 'standard',
          targetGrades: schedule.targetGrades || [],
          targetStudentTypes: schedule.targetStudentTypes || [],
          targetShifts: schedule.targetShifts || [],
          course: schedule.course,
          academicYear: schedule.academicYear,
          sessionDate: queryDate,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          lateThresholdMinutes: schedule.lateThresholdMinutes || 15,
          earlyCheckInWindowMinutes: schedule.earlyCheckInWindowMinutes || 20,
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

    // Refresh live stats and time window status for each session
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

        // Attach dynamic time window state (too_early, on_time, late_window, expired, closed)
        sessObj.timeWindow = getSessionTimeWindowStatus(sess, ethTime);

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

    const ethTime = getEthiopianTimeInfo();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.isAdmin;
    const timeWindow = getSessionTimeWindowStatus(session, ethTime);

    if (timeWindow.state === 'expired' || timeWindow.state === 'closed') {
      await autoCloseSingleSession(session);
      return res.status(400).json({
        success: false,
        status: 'session_closed',
        message: `⚠️ ይህ ክፍለ-ጊዜ የተመደበው ሰዓት (${session.startTime} - ${session.endTime}) ስላለቀ መክፈት አይቻልም።`,
      });
    }

    if (timeWindow.state === 'too_early' && !isAdmin && !req.body.adminOverride) {
      return res.status(400).json({
        success: false,
        status: 'too_early',
        message: `⚠️ ክፍለ-ጊዜው ገና አልተከፈተም። መቃኘት የሚቻለው በ${timeWindow.opensAtStr} (ከክፍለ-ጊዜው 20 ደቂቃ በፊት) ጀምሮ ነው።`,
        opensAt: timeWindow.opensAtStr,
        minutesUntilOpen: timeWindow.minutesUntilOpen,
      });
    }

    // Calculate current expected students count
    const expectedCount = await Student.countDocuments(getExpectedStudentsQuery(session));

    session.status = 'open';
    session.openedAt = session.openedAt || new Date();
    session.openedBy = req.user._id;
    session.stats.expectedCount = expectedCount;
    await session.save();

    res.json({
      success: true,
      message: `✅ ለ${session.title || session.grade} የተዘጋጀው ክፍለ-ጊዜ ተከፍቷል፤ መቃኘት ይችላሉ።`,
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
      return res.status(400).json({ success: false, message: 'ትክክለኛ የQR ኮድ አልቀረበም።' });
    }

    // 1. Verify Session & Status
    const session = await ClassSession.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'ክፍለ-ጊዜው አልተገኘም።' });
    }

    const ethTime = getEthiopianTimeInfo();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.isAdmin;
    const timeWindow = getSessionTimeWindowStatus(session, ethTime);

    // 1a. Check if session has expired past its scheduled endTime
    if (timeWindow.state === 'expired' || timeWindow.state === 'closed') {
      await autoCloseSingleSession(session);
      return res.status(400).json({
        success: false,
        status: 'session_closed',
        message: `⚠️ ይህ ክፍለ-ጊዜ ተዘግቷል። የተመደበው ሰዓት (${session.startTime || ''} - ${session.endTime || ''}) አልቋል።`,
      });
    }

    // 1b. Check if taker is scanning too early (> 20 min before start time)
    if (timeWindow.state === 'too_early' && !isAdmin && !req.body.adminOverride) {
      return res.status(400).json({
        success: false,
        status: 'too_early',
        message: `⚠️ ተገኝነት ገና አልተከፈተም። መቃኘት የሚቻለው በ${timeWindow.opensAtStr} (ከክፍለ-ጊዜው 20 ደቂቃ በፊት) ጀምሮ ነው።`,
        opensAt: timeWindow.opensAtStr,
        minutesUntilOpen: timeWindow.minutesUntilOpen,
      });
    }

    if (session.status === 'scheduled') {
      session.status = 'open';
      if (!session.openedAt) {
        session.openedAt = new Date();
      }
      await session.save();
    } else if (session.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: `⚠️ ይህ ክፍለ-ጊዜ ክፍት አይደለም።`,
      });
    }

    // 2. Verify Taker Authorization
    if (!isTakerAuthorized(req.user, session)) {
      return res.status(403).json({
        success: false,
        message: 'ተገኝነት የመመዝገብ ፈቃድ የለዎትም።',
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
        message: `⚠️ የተማሪው መረጃ አልተገኘም (${searchId})። እባክዎ መታወቂያውን ያረጋግጡ።`,
      });
    }

    const studentFullName = getStudentFullName(student);
    const studentGrade = student.grade || student.batch || '';

    // 4. IMPORTANT BUSINESS RULE: Verify Enrolled Class (Single vs Combined Session)
    const isCombined = session.isCombinedSession ||
      session.sessionType === 'assembly' ||
      session.sessionType === 'holiday' ||
      session.sessionType === 'combined' ||
      session.grade?.toLowerCase() === 'all' ||
      session.grade === 'ጠቅላላ ጉባኤ' ||
      (Array.isArray(session.targetGrades) && session.targetGrades.length > 0);

    const targetGrades = Array.isArray(session.targetGrades) ? session.targetGrades : [];
    const targetTypes = Array.isArray(session.targetStudentTypes) ? session.targetStudentTypes : [];
    const targetShifts = Array.isArray(session.targetShifts) ? session.targetShifts : [];

    if (isCombined) {
      if (targetGrades.length > 0 && !targetGrades.some(g => g.toLowerCase() === 'all')) {
        const matchesAny = targetGrades.some(g => isGradeMatch(studentGrade, g));
        if (!matchesAny) {
          const allowedLabels = targetGrades.map(formatGradeLabel).join('፣ ');
          return res.status(400).json({
            success: false,
            status: 'class_mismatch',
            rejected: true,
            message: `⚠️ ተገኝነት ውድቅ ተደርጓል፦ ${studentFullName} የ${formatGradeLabel(studentGrade)} ተማሪ ሲሆን ክፍለ-ጊዜው ለ${allowedLabels} የተዘጋጀ ነው።`,
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
      }
    } else if (!isGradeMatch(studentGrade, session.grade)) {
      return res.status(400).json({
        success: false,
        status: 'class_mismatch',
        rejected: true,
        message: `⚠️ ተገኝነት ውድቅ ተደርጓል፦ ${studentFullName} የ${formatGradeLabel(studentGrade)} ተማሪ ነው (ክፍለ-ጊዜው ለ${formatGradeLabel(session.grade)} ነው)።`,
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
    const studentType = (student.studentType || 'regular').toLowerCase();
    if (targetTypes.length > 0) {
      const allowsAll = targetTypes.some(t => t.toLowerCase() === 'all');
      const allowsType = allowsAll || targetTypes.some(t => t.toLowerCase() === studentType);
      if (!allowsType) {
        return res.status(400).json({
          success: false,
          status: 'track_mismatch',
          rejected: true,
          message: `⚠️ ተገኝነት ውድቅ ተደርጓል፦ ${studentFullName} የ${studentType === 'distance' ? 'የርቀት' : 'መደበኛ'} ትምህርት ተማሪ ነው።`,
          student: {
            id: student._id,
            studentId: student.studentId,
            name: studentFullName,
            enrolledGrade: studentGrade,
            photoUrl: student.photoUrl,
          },
        });
      }
    } else if (!isCombined) {
      const sessionType = (session.studentType || 'regular').toLowerCase();
      if (sessionType !== 'all' && sessionType !== studentType) {
        return res.status(400).json({
          success: false,
          status: 'track_mismatch',
          rejected: true,
          message: `⚠️ ተገኝነት ውድቅ ተደርጓል፦ ${studentFullName} የ${studentType === 'distance' ? 'የርቀት' : 'መደበኛ'} ትምህርት ተማሪ ነው።`,
          student: {
            id: student._id,
            studentId: student.studentId,
            name: studentFullName,
            enrolledGrade: studentGrade,
            photoUrl: student.photoUrl,
          },
        });
      }
    }

    // 4c. Verify Shift Match (Day/Weekend vs Night) for Regular students
    if (studentType === 'regular') {
      const isEligible = isShiftAllowed(student.shift, session.shift, targetShifts);

      if (!isEligible) {
        const studentShiftLabel = formatShiftLabel(student.shift);
        const sessionShiftLabel = targetShifts.length > 0
          ? targetShifts.map(formatShiftLabel).join('፣ ')
          : formatShiftLabel(session.shift);

        return res.status(400).json({
          success: false,
          status: 'shift_mismatch',
          rejected: true,
          message: `⚠️ ተገኝነት ውድቅ ተደርጓል፦ ${studentFullName} የ${studentShiftLabel} ተማሪ ነው (ክፍለ-ጊዜው ለ${sessionShiftLabel} ነው)።`,
          student: {
            id: student._id,
            studentId: student.studentId,
            name: studentFullName,
            enrolledGrade: studentGrade,
            enrolledShift: student.shift || 'weekend',
            sessionGrade: session.grade,
            sessionShift: session.shift || 'weekend',
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
      const statusLabel = existingAttendance.status === 'Late' ? 'ዘግይቷል' : existingAttendance.status === 'Excused' ? 'ፈቃድ' : 'ተገኝቷል';
      return res.status(200).json({
        success: true,
        status: 'duplicate',
        alreadyMarked: true,
        attendanceStatus: existingAttendance.status,
        scannedAt: existingAttendance.scannedAt || existingAttendance.createdAt,
        message: `ℹ️ ${studentFullName} ቀደም ሲል ተመዝግቧል (${statusLabel})።`,
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

    // 6. Calculate Present vs Late using accurate Ethiopian / East Africa Time
    const now = new Date();
    const startMinutes = parseTimeToMinutes(session.startTime);
    const lateThresholdMinutes = Number(session.lateThresholdMinutes) >= 0 ? Number(session.lateThresholdMinutes) : 15;

    let calculatedStatus = 'Present';

    if (session.sessionDate === ethTime.dateString && startMinutes !== null) {
      const lateCutoffMinutes = startMinutes + lateThresholdMinutes;
      if (ethTime.totalMinutes > lateCutoffMinutes) {
        calculatedStatus = 'Late';
      }
    } else if (session.sessionDate < ethTime.dateString) {
      calculatedStatus = 'Late';
    }

    // 7. Save Attendance Record (Gracefully handles duplicate / concurrency)
    let attendanceRecord;
    try {
      attendanceRecord = await Attendance.create({
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
    } catch (createErr) {
      if (createErr.code === 11000) {
        // Find existing attendance if duplicate
        const existing = await Attendance.findOne({ sessionId: session._id, student: student._id });
        if (existing) {
          const statusLabel = existing.status === 'Late' ? 'ዘግይቷል' : existing.status === 'Excused' ? 'ፈቃድ' : 'ተገኝቷል';
          return res.status(200).json({
            success: true,
            status: 'duplicate',
            alreadyMarked: true,
            attendanceStatus: existing.status,
            scannedAt: existing.scannedAt || existing.createdAt,
            message: `ℹ️ ${studentFullName} ቀደም ሲል ተመዝግቧል (${statusLabel})።`,
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
        }
      }
      throw createErr;
    }

    // 8. Update Live Session Stats
    if (calculatedStatus === 'Present') {
      session.stats.presentCount = (session.stats.presentCount || 0) + 1;
    } else if (calculatedStatus === 'Late') {
      session.stats.lateCount = (session.stats.lateCount || 0) + 1;
    }
    await session.save();

    const finalStatusText = calculatedStatus === 'Late' ? 'ዘግይቶ ተመዝግቧል' : 'ተመዝግቧል';
    res.status(201).json({
      success: true,
      status: calculatedStatus.toLowerCase(),
      attendanceStatus: calculatedStatus,
      scannedAt: now,
      message: `✅ ${studentFullName} (${formatGradeLabel(studentGrade)}) ${finalStatusText}`,
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
      return res.status(404).json({ success: false, message: 'ክፍለ-ጊዜው አልተገኘም።' });
    }

    // Authorization check
    if (!isTakerAuthorized(req.user, session)) {
      return res.status(403).json({
        success: false,
        message: 'ይህን ክፍለ-ጊዜ የመዝጋት ፈቃድ የለዎትም።',
      });
    }

    if (session.status === 'closed') {
      return res.status(400).json({ success: false, message: 'ይህ ክፍለ-ጊዜ ቀደም ሲል ተዘግቷል።' });
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
      message: `✅ ክፍለ-ጊዜው ተዘግቷል። ${absentRecordsToInsert.length} ያልተገኙ ተማሪዎች ቀሪ ተደርገዋል።`,
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
      isCombinedSession,
      sessionType,
      targetGrades,
      targetStudentTypes,
      targetShifts,
      course,
      academicYear,
      dayOfWeek,
      startTime,
      endTime,
      lateThresholdMinutes,
      earlyCheckInWindowMinutes,
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
    const isComb = isCombinedSession || sessionType === 'assembly' || sessionType === 'holiday' || sessionType === 'combined';

    const shiftLabel = sType === 'distance' ? 'የርቀት' : sShift === 'night' ? 'የማታ ፈረቃ' : 'የቀን ፈረቃ';

    let defaultName = name;
    if (!defaultName) {
      if (sessionType === 'assembly') defaultName = `ጠቅላላ ጉባኤ (All-School Assembly) - ${getDayName(dayOfWeek)} Timetable`;
      else if (sessionType === 'holiday') defaultName = `የበዓል መርሃ-ግብር (Spiritual Holiday) - ${getDayName(dayOfWeek)} Timetable`;
      else if (isComb && Array.isArray(targetGrades) && targetGrades.length > 0) defaultName = `ጥምር ክፍሎች (${targetGrades.join(', ')}) - ${getDayName(dayOfWeek)} Timetable`;
      else defaultName = `${grade} (${shiftLabel}) - ${getDayName(dayOfWeek)} Timetable`;
    }

    const schedule = await ClassSchedule.create({
      name: defaultName,
      grade,
      studentType: sType,
      shift: sShift,
      isCombinedSession: isComb,
      sessionType: sessionType || 'standard',
      targetGrades: Array.isArray(targetGrades) ? targetGrades : [],
      targetStudentTypes: Array.isArray(targetStudentTypes) ? targetStudentTypes : [],
      targetShifts: Array.isArray(targetShifts) ? targetShifts : [],
      course: course || null,
      academicYear: academicYear || '',
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      lateThresholdMinutes: lateThresholdMinutes || 15,
      earlyCheckInWindowMinutes: earlyCheckInWindowMinutes || 20,
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
    const isComb = req.body.isCombinedSession || req.body.sessionType === 'assembly' || req.body.sessionType === 'holiday' || req.body.sessionType === 'combined';
    const payload = {
      ...req.body,
      isCombinedSession: isComb,
    };

    const updated = await ClassSchedule.findByIdAndUpdate(
      id,
      payload,
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
    await autoCloseExpiredSessions();

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
      isCombinedSession,
      sessionType,
      targetGrades,
      targetStudentTypes,
      targetShifts,
      course,
      sessionDate,
      startTime,
      endTime,
      lateThresholdMinutes,
      earlyCheckInWindowMinutes,
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
    const isComb = isCombinedSession || sessionType === 'assembly' || sessionType === 'holiday' || sessionType === 'combined';

    const sessionPayload = {
      grade,
      studentType: sType,
      shift: sShift,
      isCombinedSession: isComb,
      sessionType: sessionType || 'standard',
      targetGrades: Array.isArray(targetGrades) ? targetGrades : [],
      targetStudentTypes: Array.isArray(targetStudentTypes) ? targetStudentTypes : [],
      targetShifts: Array.isArray(targetShifts) ? targetShifts : [],
    };
    const expectedCount = await Student.countDocuments(getExpectedStudentsQuery(sessionPayload));

    let defaultTitle = title;
    if (!defaultTitle) {
      if (sessionType === 'assembly') defaultTitle = 'ጠቅላላ ጉባኤ (All-School Assembly) - Session';
      else if (sessionType === 'holiday') defaultTitle = 'የበዓል መርሃ-ግብር (Spiritual Holiday) - Session';
      else if (isComb && Array.isArray(targetGrades) && targetGrades.length > 0) defaultTitle = `ጥምር ክፍሎች (${targetGrades.join(', ')}) - Session`;
      else defaultTitle = `${grade} (${shiftLabel}) - Make-Up Session`;
    }

    const session = await ClassSession.create({
      title: defaultTitle,
      scheduleId: null,
      grade,
      studentType: sType,
      shift: sShift,
      isCombinedSession: isComb,
      sessionType: sessionType || 'standard',
      targetGrades: Array.isArray(targetGrades) ? targetGrades : [],
      targetStudentTypes: Array.isArray(targetStudentTypes) ? targetStudentTypes : [],
      targetShifts: Array.isArray(targetShifts) ? targetShifts : [],
      course: course || null,
      sessionDate,
      startTime,
      endTime,
      lateThresholdMinutes: lateThresholdMinutes || 15,
      earlyCheckInWindowMinutes: earlyCheckInWindowMinutes || 20,
      status: 'scheduled',
      isMakeUp: true,
      assignedTakers: assignedTakers || [],
      location: location || '',
      notes: notes || 'Ad-hoc make-up / special session',
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
