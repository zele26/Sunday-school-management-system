// church-server/routes/education/progressionRoutes.js
const express = require('express');
const router = express.Router();
const StudentProfile = require('../../models/education/StudentProfile');
const Program = require('../../models/education/Program');
const AcademicYear = require('../../models/education/AcademicYear');
const Grade = require('../../models/education/Grade');
const StudyMode = require('../../models/education/StudyMode');
const Schedule = require('../../models/education/Schedule');
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const { protect, authorize } = require('../../middleware/auth');

// Helper: get next academic year name
const getNextYearName = (currentYearName) => {
  const current = parseInt(currentYearName) || new Date().getFullYear();
  return String(current + 1);
};

// POST /api/education/students/:studentProfileId/progress
router.post('/students/:studentProfileId/progress', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentProfileId } = req.params;

    const studentProfile = await StudentProfile.findById(studentProfileId);
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Find latest enrollment (most recent academic year)
    const currentEnrollment = await AcademicEnrollment.findOne({
      studentProfileId: studentProfile._id,
      status: 'active',
    })
      .populate('academicYearId', 'name')
      .populate('programId', 'name code type')
      .populate('gradeId', 'name level')
      .populate('studyModeId', 'name code')
      .populate('scheduleId', 'name code')
      .sort({ startDate: -1, createdAt: -1 });

    if (!currentEnrollment) {
      return res.status(400).json({ success: false, message: 'No active enrollment found for this student' });
    }

    const programCode = currentEnrollment.programId.code;
    const isRegular = currentEnrollment.programId.type === 'regular';

    // Determine next grade/batch
    let nextGradeId = null;
    if (isRegular) {
      if (!currentEnrollment.gradeId) {
        return res.status(400).json({ success: false, message: 'Regular student has no grade assigned' });
      }
      const currentLevel = currentEnrollment.gradeId.level;
      const nextLevel = currentLevel + 1;
      if (nextLevel > 12) {
        return res.status(400).json({ success: false, message: 'Student already completed Grade 12' });
      }
      const nextGradeName = `Grade ${nextLevel}`;
      let nextGrade = await Grade.findOne({ name: nextGradeName, programId: currentEnrollment.programId._id });
      if (!nextGrade) {
        nextGrade = await Grade.create({
          name: nextGradeName,
          level: nextLevel,
          programId: currentEnrollment.programId._id,
        });
      }
      nextGradeId = nextGrade._id;
    } else {
      // Distance: batch progression
      const currentGradeName = currentEnrollment.gradeId?.name || currentEnrollment.programId.name;
      const batchMatch = currentGradeName.match(/(\d+)/);
      const currentBatch = batchMatch ? parseInt(batchMatch[1]) : 1;
      const nextBatch = currentBatch + 1;
      const nextBatchName = `Batch ${nextBatch}`;
      let nextBatchGrade = await Grade.findOne({ name: nextBatchName, programId: currentEnrollment.programId._id });
      if (!nextBatchGrade) {
        nextBatchGrade = await Grade.create({
          name: nextBatchName,
          level: nextBatch, // store batch number as level for ordering
          programId: currentEnrollment.programId._id,
        });
      }
      nextGradeId = nextBatchGrade._id;
    }

    // Determine next academic year
    const currentYearName = currentEnrollment.academicYearId.name;
    const nextYearName = getNextYearName(currentYearName);
    let nextYear = await AcademicYear.findOne({ name: nextYearName });
    if (!nextYear) {
      nextYear = await AcademicYear.create({ name: nextYearName, status: 'active' });
    }

    // Check if an enrollment already exists for next year and same program
    const existingNext = await AcademicEnrollment.findOne({
      studentProfileId: studentProfile._id,
      academicYearId: nextYear._id,
      programId: currentEnrollment.programId._id,
      gradeId: nextGradeId,
    });
    if (existingNext) {
      return res.status(400).json({ success: false, message: 'Student already has an enrollment for the next year/grade' });
    }

    // Mark current enrollment as completed
    currentEnrollment.status = 'completed';
    currentEnrollment.completionStatus = 'Promoted';
    currentEnrollment.endDate = new Date();
    await currentEnrollment.save();

    // Create new enrollment
    const newEnrollment = await AcademicEnrollment.create({
      studentProfileId: studentProfile._id,
      academicYearId: nextYear._id,
      programId: currentEnrollment.programId._id,
      gradeId: nextGradeId,
      studyModeId: currentEnrollment.studyModeId?._id || null,
      scheduleId: currentEnrollment.scheduleId?._id || null,
      status: 'active',
      startDate: new Date(),
    });

    res.json({
      success: true,
      message: `Student progressed to ${isRegular ? nextGradeName : nextBatchName} for ${nextYearName}.`,
      currentEnrollment,
      newEnrollment,
    });
  } catch (err) {
    console.error('Progression error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;