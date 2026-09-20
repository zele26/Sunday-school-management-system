// church-server/routes/education/progressionRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StudentProfile = require('../../models/education/StudentProfile');
const Student = require('../../models/Student');
const Person = require('../../models/Person');
const Program = require('../../models/education/Program');
const AcademicYear = require('../../models/education/AcademicYear');
const Grade = require('../../models/education/Grade');
const StudyMode = require('../../models/education/StudyMode');
const Schedule = require('../../models/education/Schedule');
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const { protect, authorize } = require('../../middleware/auth');

const getNextYearName = (currentYearName) => {
  if (!currentYearName) return '2018 ዓ.ም';
  const match = String(currentYearName).match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `${num + 1} ዓ.ም`;
  }
  return '2018 ዓ.ም';
};

const formatGradeAmharic = (g) => {
  if (!g) return '';
  const num = String(g).match(/\d+/);
  if (String(g).toLowerCase().includes('batch') || String(g).includes('ዙር')) return num ? `ዙር ${num[0]} (የርቀት)` : g;
  if (num) return `${num[0]}ኛ ክፍል`;
  return g;
};

// GET /api/education/students/:studentProfileId/history – get academic history
router.get('/students/:studentProfileId/history', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentProfileId } = req.params;

    let targetProfileId = studentProfileId;
    let studentDoc = null;

    if (mongoose.Types.ObjectId.isValid(studentProfileId)) {
      studentDoc = await Student.findById(studentProfileId);
    }
    if (!studentDoc) {
      studentDoc = await Student.findOne({
        $or: [{ studentId: studentProfileId }, { registrationNumber: studentProfileId }]
      });
    }

    let enrollments = [];
    if (mongoose.Types.ObjectId.isValid(studentProfileId)) {
      enrollments = await AcademicEnrollment.find({ studentProfileId })
        .populate('academicYearId', 'name')
        .populate('programId', 'name code type')
        .populate('gradeId', 'name level')
        .populate('studyModeId', 'name code')
        .populate('scheduleId', 'name code')
        .sort({ academicYearId: 1, startDate: 1 });
    }

    if (enrollments.length === 0 && studentDoc) {
      // Return synthetic current enrollment record
      enrollments = [
        {
          _id: studentDoc._id,
          academicYearId: { name: studentDoc.regYear ? `${studentDoc.regYear} ዓ.ም` : '2017 ዓ.ም' },
          programId: { name: studentDoc.studentType === 'distance' ? 'የየርቀት ትምህርት' : 'መደበኛ ሰንበት ት/ቤት', type: studentDoc.studentType || 'regular' },
          gradeId: { name: studentDoc.grade || 'Grade 10', level: parseInt(String(studentDoc.grade).match(/\d+/)?.[0] || '10', 10) },
          status: 'active',
          startDate: studentDoc.registrationDate || new Date(),
        }
      ];
    }

    res.json({ success: true, enrollments });
  } catch (err) {
    console.error('Fetch history error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/students/:studentProfileId/progress
router.post('/students/:studentProfileId/progress', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentProfileId } = req.params;

    // 1. Look up student in both Student and StudentProfile models
    let studentProfile = null;
    let studentDoc = null;

    if (mongoose.Types.ObjectId.isValid(studentProfileId)) {
      studentProfile = await StudentProfile.findById(studentProfileId).populate('personId');
      studentDoc = await Student.findById(studentProfileId);
    }

    if (!studentProfile) {
      studentProfile = await StudentProfile.findOne({
        $or: [{ studentNumber: studentProfileId }, { studentId: studentProfileId }]
      }).populate('personId');
    }

    if (!studentDoc && studentProfile) {
      studentDoc = await Student.findOne({
        $or: [
          { studentId: studentProfile.studentNumber },
          { registrationNumber: studentProfile.studentNumber },
        ]
      });
    }

    if (!studentDoc && !studentProfile) {
      studentDoc = await Student.findOne({
        $or: [
          { studentId: studentProfileId },
          { registrationNumber: studentProfileId },
        ]
      });
    }

    // If studentDoc was found, check if a StudentProfile already exists matching studentDoc's studentId
    if (studentDoc && !studentProfile) {
      studentProfile = await StudentProfile.findOne({
        $or: [
          { studentNumber: studentDoc.studentId },
          { studentNumber: studentDoc.registrationNumber },
        ]
      }).populate('personId');
    }

    if (!studentProfile && !studentDoc) {
      return res.status(404).json({ success: false, message: 'የተማሪው መረጃ አልተገኘም (Student profile not found)' });
    }

    // 2. Ensure StudentProfile & Person exist if starting from a Student document without an existing profile
    if (!studentProfile && studentDoc) {
      let person = null;
      if (studentDoc.studentPhone || studentDoc.email) {
        person = await Person.findOne({
          $or: [
            ...(studentDoc.studentPhone ? [{ phone: studentDoc.studentPhone }] : []),
            ...(studentDoc.email ? [{ email: studentDoc.email }] : [])
          ]
        });
      }
      if (!person) {
        person = await Person.create({
          firstName: studentDoc.firstName,
          middleName: studentDoc.middleName || '',
          lastName: studentDoc.lastName,
          gender: studentDoc.gender || 'Male',
          phone: studentDoc.studentPhone || '',
          email: studentDoc.email || '',
          address: studentDoc.address || '',
        });
      }
      studentProfile = await StudentProfile.create({
        personId: person._id,
        studentNumber: studentDoc.studentId || `STU-${studentDoc._id.toString().slice(-6).toUpperCase()}`,
        status: 'active',
        admissionDate: studentDoc.registrationDate || new Date(),
      });
    }

    // 3. Determine Study Track (Regular vs Distance)
    const isRegular = (studentDoc?.studentType || 'regular').toLowerCase() === 'regular';

    // 4. Calculate Current & Next Grade
    let currentGradeString = studentDoc?.grade || studentDoc?.batch || '';
    let nextGradeName = '';
    let nextGradeLevel = 1;

    if (isRegular) {
      const match = String(currentGradeString).match(/\d+/);
      const currentLevel = match ? parseInt(match[0], 10) : 10;
      if (currentLevel >= 12) {
        return res.status(400).json({
          success: false,
          message: 'ይህ ተማሪ 12ኛ ክፍልን አጠናቋል (Student has completed Grade 12 - Graduation status).'
        });
      }
      nextGradeLevel = currentLevel + 1;
      nextGradeName = `Grade ${nextGradeLevel}`;
    } else {
      const currentBatchString = studentDoc?.batch || currentGradeString || 'Batch 1';
      const match = String(currentBatchString).match(/\d+/);
      const currentBatch = match ? parseInt(match[0], 10) : 1;
      nextGradeLevel = currentBatch + 1;
      nextGradeName = `Batch ${nextGradeLevel}`;
    }

    // 5. Calculate Current & Next Academic Year
    const currentYearString = studentDoc?.regYear ? `${studentDoc.regYear} ዓ.ም` : '2017 ዓ.ም';
    const nextYearName = getNextYearName(currentYearString);
    const nextYearDigits = nextYearName.match(/\d+/)?.[0] || '2018';

    // 6. Update Student document directly
    if (studentDoc) {
      if (isRegular) {
        studentDoc.grade = nextGradeName;
      } else {
        studentDoc.batch = String(nextGradeLevel);
        studentDoc.grade = nextGradeName;
      }
      studentDoc.regYear = nextYearDigits;
      await studentDoc.save();
    }

    // Also look up any other matching Student record by studentNumber to keep in sync
    if (studentProfile?.studentNumber && (!studentDoc || studentDoc.studentId !== studentProfile.studentNumber)) {
      const otherStudent = await Student.findOne({ studentId: studentProfile.studentNumber });
      if (otherStudent) {
        if (isRegular) {
          otherStudent.grade = nextGradeName;
        } else {
          otherStudent.batch = String(nextGradeLevel);
          otherStudent.grade = nextGradeName;
        }
        otherStudent.regYear = nextYearDigits;
        await otherStudent.save();
      }
    }

    // 7. Update / Create Academic Program, Grade, and AcademicYear entities
    let program = await Program.findOne({ type: isRegular ? 'regular' : 'distance' });
    if (!program) {
      program = await Program.create({
        name: isRegular ? 'መደበኛ ሰንበት ት/ቤት' : 'የርቀት ትምህርት',
        code: isRegular ? 'REG' : 'DIST',
        type: isRegular ? 'regular' : 'distance',
      });
    }

    let nextGrade = await Grade.findOne({ name: nextGradeName, programId: program._id });
    if (!nextGrade) {
      nextGrade = await Grade.create({
        name: nextGradeName,
        level: nextGradeLevel,
        programId: program._id,
      });
    }

    let nextYear = await AcademicYear.findOne({ name: nextYearName });
    if (!nextYear) {
      nextYear = await AcademicYear.create({ name: nextYearName, status: 'active' });
    }

    let studyMode = await StudyMode.findOne({ code: isRegular ? 'REGULAR' : 'DISTANCE' });
    if (!studyMode) {
      studyMode = await StudyMode.findOne({ name: isRegular ? /regular|መደበኛ/i : /distance|ርቀት/i });
    }
    if (!studyMode) {
      studyMode = await StudyMode.create({
        name: isRegular ? 'መደበኛ (In-Person)' : 'የርቀት (Online/Distance)',
        code: isRegular ? 'REGULAR' : 'DISTANCE',
      });
    }

    // Complete previous active enrollments for this student profile
    await AcademicEnrollment.updateMany(
      { studentProfileId: studentProfile._id, status: 'active' },
      { status: 'completed', completionStatus: 'Promoted', endDate: new Date() }
    );

    // Create new active enrollment
    let newEnrollment = await AcademicEnrollment.findOne({
      studentProfileId: studentProfile._id,
      academicYearId: nextYear._id,
      programId: program._id,
      gradeId: nextGrade._id,
    });

    if (!newEnrollment) {
      newEnrollment = await AcademicEnrollment.create({
        studentProfileId: studentProfile._id,
        academicYearId: nextYear._id,
        programId: program._id,
        gradeId: nextGrade._id,
        studyModeId: studyMode._id,
        status: 'active',
        startDate: new Date(),
      });
    }

    const amharicGrade = formatGradeAmharic(nextGradeName);
    res.json({
      success: true,
      message: `ተማሪው ወደ ${amharicGrade} (${nextYearName}) በተሳካ ሁኔታ ተሸጋግሯል!`,
      nextGrade: nextGradeName,
      nextYear: nextYearName,
      newEnrollment,
    });
  } catch (err) {
    console.error('Progression error:', err);
    res.status(500).json({ success: false, message: err.message || 'ማሸጋገር አልተቻለም' });
  }
});

module.exports = router;