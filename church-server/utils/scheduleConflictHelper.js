// church-server/utils/scheduleConflictHelper.js
const EducationCourse = require('../models/education/Course');
const Teacher = require('../models/Teacher');

// Map English and Amharic day names to canonical tokens
const DAY_NORMALIZATION_MAP = {
  sunday: 'SUNDAY',
  'እሑድ': 'SUNDAY',
  'እሁድ': 'SUNDAY',
  saturday: 'SATURDAY',
  'ቅዳሜ': 'SATURDAY',
  monday: 'MONDAY',
  'ሰኞ': 'MONDAY',
  tuesday: 'TUESDAY',
  'ማክሰኞ': 'TUESDAY',
  wednesday: 'WEDNESDAY',
  'ረቡዕ': 'WEDNESDAY',
  'ሮብ': 'WEDNESDAY',
  thursday: 'THURSDAY',
  'ሐሙስ': 'THURSDAY',
  'ሀሙስ': 'THURSDAY',
  friday: 'FRIDAY',
  'ዓርብ': 'FRIDAY',
  'አርብ': 'FRIDAY',
  weekend: 'WEEKEND',
  everyday: 'EVERYDAY',
};

/**
 * Normalize a day string to a standard token
 */
function normalizeDay(dayStr) {
  if (!dayStr) return null;
  const cleaned = dayStr.trim().toLowerCase();
  return DAY_NORMALIZATION_MAP[cleaned] || cleaned.toUpperCase();
}

/**
 * Check if two day tokens match
 */
function daysOverlap(day1, day2) {
  const d1 = normalizeDay(day1);
  const d2 = normalizeDay(day2);
  if (!d1 || !d2) return false;
  if (d1 === 'EVERYDAY' || d2 === 'EVERYDAY') return true;
  if (d1 === 'WEEKEND' && (d2 === 'SATURDAY' || d2 === 'SUNDAY' || d2 === 'WEEKEND')) return true;
  if (d2 === 'WEEKEND' && (d1 === 'SATURDAY' || d1 === 'SUNDAY' || d1 === 'WEEKEND')) return true;
  return d1 === d2;
}

/**
 * Parse time string (e.g. "08:30", "14:00", "8:30 AM") to minutes since midnight
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3] ? match[3].toUpperCase() : null;

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

/**
 * Check if two time intervals [s1, e1] and [s2, e2] overlap
 */
function timeIntervalsOverlap(start1, end1, start2, end2) {
  const s1 = parseTimeToMinutes(start1);
  const e1 = parseTimeToMinutes(end1);
  const s2 = parseTimeToMinutes(start2);
  const e2 = parseTimeToMinutes(end2);

  if (s1 === null || e1 === null || s2 === null || e2 === null) {
    return false; // Cannot determine conflict without valid times
  }

  // Overlap occurs if max(start1, start2) < min(end1, end2)
  return Math.max(s1, s2) < Math.min(e1, e2);
}

/**
 * Verify if assigning a teacher to a course causes a schedule collision
 * @param {string|ObjectId} teacherId - User ID or Teacher ID
 * @param {Object} newCourseData - { dayOfWeek, startTime, endTime, name }
 * @param {string|ObjectId} [excludeCourseId] - Course ID to exclude from conflict check (for edits)
 */
async function checkTeacherScheduleConflict(teacherId, newCourseData, excludeCourseId = null) {
  if (!teacherId || !newCourseData.dayOfWeek || !newCourseData.startTime || !newCourseData.endTime) {
    return { hasConflict: false };
  }

  // Find all identifiers for this teacher (User ID and Teacher Doc ID)
  const teacherIds = [teacherId];
  const teacherDoc = await Teacher.findOne({
    $or: [{ userId: teacherId }, { _id: teacherId }],
  });

  if (teacherDoc) {
    if (teacherDoc._id && !teacherIds.some(id => String(id) === String(teacherDoc._id))) {
      teacherIds.push(teacherDoc._id);
    }
    if (teacherDoc.userId && !teacherIds.some(id => String(id) === String(teacherDoc.userId))) {
      teacherIds.push(teacherDoc.userId);
    }
  }

  // Query all active courses taught by this teacher
  const query = {
    teacher: { $in: teacherIds },
    status: { $regex: /^active$/i },
  };

  if (excludeCourseId) {
    query._id = { $ne: excludeCourseId };
  }

  const existingCourses = await EducationCourse.find(query);

  for (const existing of existingCourses) {
    if (daysOverlap(existing.dayOfWeek, newCourseData.dayOfWeek)) {
      const isOverlap = timeIntervalsOverlap(
        existing.startTime,
        existing.endTime,
        newCourseData.startTime,
        newCourseData.endTime
      );

      if (isOverlap) {
        const teacherName = teacherDoc?.fullName || 'መምህሩ';
        const dayName = existing.dayOfWeek || newCourseData.dayOfWeek;
        const msg = `የሰዓት መደራረብ ተገኝቷል (Schedule Conflict)! ${teacherName} በዚሁ ቀን (${dayName}) ከ ${existing.startTime || ''} - ${existing.endTime || ''} በ "${existing.name}" ክፍል ቀድመው ተመድበዋል።`;

        return {
          hasConflict: true,
          conflictingCourse: {
            id: existing._id,
            name: existing.name,
            dayOfWeek: existing.dayOfWeek,
            startTime: existing.startTime,
            endTime: existing.endTime,
            grade: existing.grade,
          },
          message: msg,
        };
      }
    }
  }

  return { hasConflict: false };
}

/**
 * Verify pairwise conflicts within a list of course names or IDs (e.g. when updating a teacher's coursesTaught)
 * @param {Array<string>} courseNamesOrIds
 */
async function checkCoursesListConflict(courseNamesOrIds) {
  if (!Array.isArray(courseNamesOrIds) || courseNamesOrIds.length < 2) {
    return { hasConflict: false };
  }

  const courses = await EducationCourse.find({
    $or: [
      { name: { $in: courseNamesOrIds } },
      { _id: { $in: courseNamesOrIds.filter(id => /^[0-9a-fA-F]{24}$/.test(id)) } },
    ],
    status: { $regex: /^active$/i },
  });

  for (let i = 0; i < courses.length; i++) {
    for (let j = i + 1; j < courses.length; j++) {
      const c1 = courses[i];
      const c2 = courses[j];

      if (daysOverlap(c1.dayOfWeek, c2.dayOfWeek)) {
        if (timeIntervalsOverlap(c1.startTime, c1.endTime, c2.startTime, c2.endTime)) {
          const dayName = c1.dayOfWeek || c2.dayOfWeek;
          const msg = `የሰዓት መደራረብ ተገኝቷል (Schedule Conflict)! "${c1.name}" (${c1.startTime}-${c1.endTime}) እና "${c2.name}" (${c2.startTime}-${c2.endTime}) በዚሁ ቀን (${dayName}) በአንድ ሰዓት ይካሄዳሉ።`;
          return {
            hasConflict: true,
            conflictingPair: [c1.name, c2.name],
            message: msg,
          };
        }
      }
    }
  }

  return { hasConflict: false };
}

module.exports = {
  normalizeDay,
  daysOverlap,
  parseTimeToMinutes,
  timeIntervalsOverlap,
  checkTeacherScheduleConflict,
  checkCoursesListConflict,
};
