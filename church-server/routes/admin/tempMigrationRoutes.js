// church-server/routes/admin/tempMigrationRoutes.js
const express = require('express');
const router = express.Router();
const Student = require('../../models/Student');
const Person = require('../../models/Person');
const StudentProfile = require('../../models/education/StudentProfile');
const Program = require('../../models/education/Program');
const AcademicYear = require('../../models/education/AcademicYear');
const Grade = require('../../models/education/Grade');
const StudyMode = require('../../models/education/StudyMode');
const Schedule = require('../../models/education/Schedule');
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const { protect, authorize } = require('../../middleware/auth');

// POST /api/admin/temp/run-education-core-migration
router.post('/run-education-core-migration', protect, authorize('admin'), async (req, res) => {
  try {
    // Seed Programs
    const programMap = {};
    const programs = [
      { name: 'Regular Education', code: 'REG', type: 'regular' },
      { name: 'Distance Education', code: 'DIS', type: 'distance' },
    ];
    for (const p of programs) {
      let program = await Program.findOne({ code: p.code });
      if (!program) program = await Program.create(p);
      programMap[p.code] = program;
    }

    // Seed Study Modes
    const studyModeMap = {};
    const studyModes = [
      { name: 'Regular', code: 'REGULAR' },
      { name: 'Distance', code: 'DISTANCE' },
    ];
    for (const sm of studyModes) {
      let mode = await StudyMode.findOne({ code: sm.code });
      if (!mode) mode = await StudyMode.create(sm);
      studyModeMap[sm.code] = mode;
    }

    // Seed Schedules
    const scheduleMap = {};
    const schedules = [
      { name: 'Weekend', code: 'WEEKEND' },
      { name: 'Monday / Wednesday / Friday - Night', code: 'MWF_NIGHT' },
    ];
    for (const s of schedules) {
      let schedule = await Schedule.findOne({ code: s.code });
      if (!schedule) schedule = await Schedule.create(s);
      scheduleMap[s.code] = schedule;
    }

    // Seed Academic Year
    const currentYear = new Date().getFullYear().toString();
    let academicYear = await AcademicYear.findOne({ name: currentYear });
    if (!academicYear) academicYear = await AcademicYear.create({ name: currentYear, status: 'active' });

    // Process Students
    const students = await Student.find({});
    let createdProfiles = 0;
    let createdEnrollments = 0;

    for (const student of students) {
      let person = await Person.findOne({
        $or: [
          { phone: student.studentPhone || student.contactPhone || '' },
          { email: student.email || '' },
        ],
      });
      if (!person) continue;

      let profile = await StudentProfile.findOne({ personId: person._id });
      if (!profile) {
        profile = await StudentProfile.create({
          personId: person._id,
          studentNumber: student.studentId,
          admissionDate: student.registrationDate || new Date(),
          status: 'active',
        });
        createdProfiles++;
      }

      const programCode = student.studentType === 'distance' ? 'DIS' : 'REG';
      const modeCode = student.studentType === 'distance' ? 'DISTANCE' : 'REGULAR';
      let gradeId = null;
      if (student.studentType === 'regular') {
        const gradeName = student.grade;
        if (gradeName) {
          let grade = await Grade.findOne({ name: gradeName, programId: programMap[programCode]._id });
          if (!grade) {
            const levelMatch = gradeName.match(/(\d+)/);
            const level = levelMatch ? parseInt(levelMatch[1]) : 1;
            grade = await Grade.create({ name: gradeName, level, programId: programMap[programCode]._id });
          }
          gradeId = grade._id;
        }
      }

      const existing = await AcademicEnrollment.findOne({
        studentProfileId: profile._id,
        academicYearId: academicYear._id,
        programId: programMap[programCode]._id,
      });
      if (!existing) {
        await AcademicEnrollment.create({
          studentProfileId: profile._id,
          academicYearId: academicYear._id,
          programId: programMap[programCode]._id,
          gradeId: gradeId,
          studyModeId: studyModeMap[modeCode]._id,
          scheduleId: scheduleMap['WEEKEND']?._id || null,
          status: 'active',
          startDate: new Date(),
        });
        createdEnrollments++;
      }
    }

    res.json({
      success: true,
      message: 'Education Core migration completed successfully.',
      createdProfiles,
      createdEnrollments,
    });
  } catch (err) {
    console.error('Migration endpoint error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;