const ClassSession = require('../models/education/ClassSession');
const Attendance = require('../models/education/Attendance');
const Student = require('../models/Student');

// Helper: Ethiopian 3-part name or fallback
const getStudentFullName = (s) => {
  if (!s) return 'ተማሪ';
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ').trim() || 'ተማሪ';
};

// Helper: Get East Africa / Ethiopian Time (UTC+3) representation
const getEthiopianTimeInfo = (d = new Date()) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Africa/Addis_Ababa',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const parts = formatter.formatToParts(d);
  const getPart = (type) => parts.find((p) => p.type === type)?.value;
  const year = getPart('year');
  const month = getPart('month');
  const day = getPart('day');
  const hour = parseInt(getPart('hour') || '0', 10);
  const minute = parseInt(getPart('minute') || '0', 10);
  const second = parseInt(getPart('second') || '0', 10);
  const dateString = `${year}-${month}-${day}`;
  const totalMinutes = hour * 60 + minute;
  return {
    dateString,
    year,
    month,
    day,
    hour,
    minute,
    second,
    totalMinutes,
  };
};

// Helper: Parse HH:MM string to total minutes from midnight
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':').map(Number);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return parts[0] * 60 + parts[1];
  }
  return null;
};

// Helper: Format total minutes from midnight to HH:MM string
const formatMinutesToHHMM = (totalMinutes) => {
  if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) return '';
  const normalized = ((Math.floor(totalMinutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Helper: Determine session time window status (too_early, on_time, late_window, expired, closed)
const getSessionTimeWindowStatus = (session, ethTime = getEthiopianTimeInfo()) => {
  if (!session) return { state: 'invalid', message: 'No session provided' };
  if (session.status === 'closed') return { state: 'closed', message: 'Session is closed' };
  if (session.status === 'cancelled') return { state: 'cancelled', message: 'Session is cancelled' };

  const startMinutes = parseTimeToMinutes(session.startTime);
  const endMinutes = parseTimeToMinutes(session.endTime);
  const earlyWindow = Number(session.earlyCheckInWindowMinutes) >= 0 ? Number(session.earlyCheckInWindowMinutes) : 20;
  const lateThreshold = Number(session.lateThresholdMinutes) >= 0 ? Number(session.lateThresholdMinutes) : 15;

  if (session.sessionDate < ethTime.dateString) {
    return { state: 'expired', message: 'Session date has passed' };
  }
  if (session.sessionDate > ethTime.dateString) {
    return { state: 'future_date', message: `Session scheduled for ${session.sessionDate}` };
  }

  if (startMinutes === null || endMinutes === null) {
    return { state: 'on_time', opensAtStr: session.startTime || '00:00' };
  }

  const earliestCheckInMinutes = startMinutes - earlyWindow;
  const lateCutoffMinutes = startMinutes + lateThreshold;

  if (ethTime.totalMinutes < earliestCheckInMinutes) {
    const minutesUntilOpen = earliestCheckInMinutes - ethTime.totalMinutes;
    const opensAtStr = formatMinutesToHHMM(earliestCheckInMinutes);
    return {
      state: 'too_early',
      earliestCheckInMinutes,
      opensAtStr,
      minutesUntilOpen,
      earlyWindowMinutes: earlyWindow,
      message: `Check-in opens at ${opensAtStr} (${minutesUntilOpen} min before class starts at ${session.startTime})`,
    };
  }

  if (ethTime.totalMinutes >= endMinutes) {
    return {
      state: 'expired',
      message: `Session ended at ${session.endTime}`,
    };
  }

  if (ethTime.totalMinutes <= lateCutoffMinutes) {
    return {
      state: 'on_time',
      opensAtStr: formatMinutesToHHMM(earliestCheckInMinutes),
      message: 'Check-in is open (On-Time)',
    };
  }

  return {
    state: 'late_window',
    opensAtStr: formatMinutesToHHMM(earliestCheckInMinutes),
    message: 'Check-in is open (Late)',
  };
};

// Helper: Build query for expected active students based on grade, studentType, shift, and multi-grade targetGrades
const getExpectedStudentsQuery = (sessionOrSchedule) => {
  const isCombined =
    sessionOrSchedule.isCombinedSession ||
    sessionOrSchedule.sessionType === 'assembly' ||
    sessionOrSchedule.sessionType === 'holiday' ||
    sessionOrSchedule.sessionType === 'combined' ||
    sessionOrSchedule.grade?.toLowerCase() === 'all' ||
    sessionOrSchedule.grade === 'ጠቅላላ ጉባኤ' ||
    (Array.isArray(sessionOrSchedule.targetGrades) && sessionOrSchedule.targetGrades.length > 0);

  const targetGrades = Array.isArray(sessionOrSchedule.targetGrades) ? sessionOrSchedule.targetGrades : [];
  const targetTypes = Array.isArray(sessionOrSchedule.targetStudentTypes) ? sessionOrSchedule.targetStudentTypes : [];
  const targetShifts = Array.isArray(sessionOrSchedule.targetShifts) ? sessionOrSchedule.targetShifts : [];

  let query = {};

  // 1. Grade filter
  if (isCombined) {
    if (targetGrades.length > 0 && !targetGrades.some((g) => g.toLowerCase() === 'all')) {
      const orConditions = [];
      targetGrades.forEach((g) => {
        orConditions.push({ grade: g }, { batch: g });
      });
      query.$or = orConditions;
    }
  } else if (sessionOrSchedule.grade && sessionOrSchedule.grade.toLowerCase() !== 'all') {
    query.$or = [{ grade: sessionOrSchedule.grade }, { batch: sessionOrSchedule.grade }];
  }

  // 2. Student Type filter
  if (targetTypes.length > 0) {
    const hasRegular = targetTypes.some((t) => t.toLowerCase() === 'regular');
    const hasDistance = targetTypes.some((t) => t.toLowerCase() === 'distance');
    const hasAll = targetTypes.some((t) => t.toLowerCase() === 'all');

    if (!hasAll && !(hasRegular && hasDistance)) {
      if (hasDistance) query.studentType = 'distance';
      else if (hasRegular) query.studentType = { $ne: 'distance' };
    }
  } else {
    const sType = sessionOrSchedule.studentType || 'regular';
    if (sType === 'distance') {
      query.studentType = 'distance';
    } else if (sType !== 'all') {
      query.studentType = { $ne: 'distance' };
    }
  }

  // 3. Shift filter
  if (targetShifts.length > 0) {
    const hasAllShifts = targetShifts.some((s) => s.toLowerCase() === 'all');
    const hasWeekend = targetShifts.some((s) => s.toLowerCase() === 'weekend');
    const hasNight = targetShifts.some((s) => s.toLowerCase() === 'night');

    if (!hasAllShifts && !(hasWeekend && hasNight)) {
      query.shift = { $in: targetShifts };
    }
  } else if (sessionOrSchedule.shift && sessionOrSchedule.shift !== 'all') {
    query.shift = sessionOrSchedule.shift;
  }

  return query;
};

// Close a single session and mark remaining unscanned students as Absent
const autoCloseSingleSession = async (session) => {
  if (!session || session.status === 'closed' || session.status === 'cancelled') {
    return session;
  }

  try {
    const expectedStudents = await Student.find(getExpectedStudentsQuery(session));
    const existingRecords = await Attendance.find({ sessionId: session._id });
    const attendedStudentIdSet = new Set(existingRecords.map((r) => r.student.toString()));

    const now = new Date();
    const absentRecords = [];

    for (const student of expectedStudents) {
      if (!attendedStudentIdSet.has(student._id.toString())) {
        absentRecords.push({
          sessionId: session._id,
          student: student._id,
          studentProfileId: student.studentProfileId || null,
          course: session.course || null,
          studentName: getStudentFullName(student),
          grade: student.grade || student.batch || session.grade,
          studentType: student.studentType || 'regular',
          shift: student.shift || '',
          teacher: session.openedBy || session.assignedTakers?.[0] || null,
          teacherName: 'Auto System',
          date: new Date(session.sessionDate),
          checkInTime: now,
          scannedAt: now,
          scanMethod: 'auto_absent_on_close',
          status: 'Absent',
        });
      }
    }

    if (absentRecords.length > 0) {
      await Attendance.insertMany(absentRecords, { ordered: false }).catch(() => {});
    }

    const presentCount = await Attendance.countDocuments({ sessionId: session._id, status: 'Present' });
    const lateCount = await Attendance.countDocuments({ sessionId: session._id, status: 'Late' });
    const absentCount = await Attendance.countDocuments({ sessionId: session._id, status: 'Absent' });
    const excusedCount = await Attendance.countDocuments({ sessionId: session._id, status: 'Excused' });

    session.status = 'closed';
    session.closedAt = now;
    session.stats = {
      expectedCount: expectedStudents.length,
      presentCount,
      lateCount,
      absentCount,
      excusedCount,
    };
    await session.save();
    console.log(`⏱️ Auto-closed expired session: ${session.title || session.grade} (${session.sessionDate} ${session.startTime}-${session.endTime})`);
    return session;
  } catch (err) {
    console.error(`Error auto-closing session ${session._id}:`, err);
    return session;
  }
};

// Check all sessions and close any whose end time has passed
const autoCloseExpiredSessions = async () => {
  try {
    const ethTime = getEthiopianTimeInfo();

    // Query all sessions that are currently scheduled or open up to today's Ethiopian date
    const openOrScheduledSessions = await ClassSession.find({
      sessionDate: { $lte: ethTime.dateString },
      status: { $in: ['open', 'scheduled'] },
    });

    for (const session of openOrScheduledSessions) {
      const isPastDay = session.sessionDate < ethTime.dateString;
      const endMinutes = parseTimeToMinutes(session.endTime);

      const isExpired =
        isPastDay ||
        (session.sessionDate === ethTime.dateString && endMinutes !== null && ethTime.totalMinutes >= endMinutes);

      if (isExpired) {
        await autoCloseSingleSession(session);
      }
    }
  } catch (err) {
    console.warn('⚠️ autoCloseExpiredSessions warning:', err.message);
  }
};

// Background worker timer running every 30 seconds
let workerInterval = null;
const startSessionAutoCloseWorker = () => {
  if (workerInterval) return;
  // Run initial check after 5 seconds
  setTimeout(() => {
    autoCloseExpiredSessions().catch(() => {});
  }, 5000);

  // Run periodic check every 30 seconds
  workerInterval = setInterval(() => {
    autoCloseExpiredSessions().catch(() => {});
  }, 30000);

  console.log('⏰ Attendance Session Auto-Close Background Worker initialized (running every 30s)');
};

module.exports = {
  getEthiopianTimeInfo,
  parseTimeToMinutes,
  formatMinutesToHHMM,
  getSessionTimeWindowStatus,
  getExpectedStudentsQuery,
  getStudentFullName,
  autoCloseSingleSession,
  autoCloseExpiredSessions,
  startSessionAutoCloseWorker,
};
