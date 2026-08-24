// church-server/routes/education/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const StudentProfile = require('../../models/education/StudentProfile');
const Program = require('../../models/education/Program');
const AcademicYear = require('../../models/education/AcademicYear');
const Grade = require('../../models/education/Grade');
const StudyMode = require('../../models/education/StudyMode');
const Schedule = require('../../models/education/Schedule');
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const Person = require('../../models/Person');
const { protect, authorize } = require('../../middleware/auth');

// POST /api/education/enroll
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      personId,
      programCode,
      academicYearName,
      gradeName,          // optional; may be null for distance
      studyModeCode,
      scheduleCode,
      status = 'active',
    } = req.body;

    if (!personId || !programCode || !academicYearName || !studyModeCode) {
      return res.status(400).json({ success: false, message: 'personId, programCode, academicYearName, and studyModeCode are required' });
    }

    // Find Person
    const person = await Person.findById(personId);
    if (!person) return res.status(400).json({ success: false, message: 'Person not found' });

    // Find or create StudentProfile
    let studentProfile = await StudentProfile.findOne({ personId: person._id });
    if (!studentProfile) {
      // Generate a temporary student number if not provided (e.g., from person's phone last 6)
      const studentNumber = `EDU-${Date.now().toString().slice(-6)}`; // will be replaced later with official ID
      studentProfile = await StudentProfile.create({
        personId: person._id,
        studentNumber,
        admissionDate: new Date(),
        status: 'active',
      });
    }

    // Find Program by code
    const program = await Program.findOne({ code: programCode.toUpperCase() });
    if (!program) return res.status(400).json({ success: false, message: 'Program not found' });

    // Find or create AcademicYear
    let academicYear = await AcademicYear.findOne({ name: academicYearName });
    if (!academicYear) {
      academicYear = await AcademicYear.create({ name: academicYearName, status: 'active' });
    }

    // Find StudyMode by code
    const studyMode = await StudyMode.findOne({ code: studyModeCode.toUpperCase() });
    if (!studyMode) return res.status(400).json({ success: false, message: 'StudyMode not found' });

    // Optional: Grade
    let gradeId = null;
    if (gradeName) {
      let grade = await Grade.findOne({ name: gradeName, programId: program._id });
      if (!grade) {
        const levelMatch = gradeName.match(/(\d+)/);
        const level = levelMatch ? parseInt(levelMatch[1]) : 1;
        grade = await Grade.create({ name: gradeName, level, programId: program._id });
      }
      gradeId = grade._id;
    }

    // Optional: Schedule
    let scheduleId = null;
    if (scheduleCode) {
      let schedule = await Schedule.findOne({ code: scheduleCode.toUpperCase() });
      if (!schedule) {
        schedule = await Schedule.create({ name: scheduleCode, code: scheduleCode.toUpperCase() });
      }
      scheduleId = schedule._id;
    }

    // Check for existing enrollment to avoid duplicates
    const existingEnrollment = await AcademicEnrollment.findOne({
      studentProfileId: studentProfile._id,
      academicYearId: academicYear._id,
      programId: program._id,
    });

    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Student already enrolled for this academic year and program' });
    }

    // Create AcademicEnrollment
    const enrollment = await AcademicEnrollment.create({
      studentProfileId: studentProfile._id,
      academicYearId: academicYear._id,
      programId: program._id,
      gradeId: gradeId,
      studyModeId: studyMode._id,
      scheduleId: scheduleId,
      status: status,
      startDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully.',
      enrollment,
    });
  } catch (err) {
    console.error('Manual enrollment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;