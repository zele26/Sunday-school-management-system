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

const getNextYearName = (currentYearName) => {
  const current = parseInt(currentYearName) || new Date().getFullYear();
  return String(current + 1);
};

// GET /api/education/students/:studentProfileId/history – get academic history
router.get('/students/:studentProfileId/history', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentProfileId } = req.params;
    const enrollments = await AcademicEnrollment.find({ studentProfileId })
      .populate('academicYearId', 'name')
      .populate('programId', 'name code type')
      .populate('gradeId', 'name level')
      .populate('studyModeId', 'name code')
      .populate('scheduleId', 'name code')
      .sort({ academicYearId: 1, startDate: 1 });
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

    const studentProfile = await StudentProfile.findById(studentProfileId);
    if (!studentProfile) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    // Find latest active enrollment
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

    const isRegular = currentEnrollment.programId.type === 'regular';
    let nextName = '';
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
      nextName = `Grade ${nextLevel}`;
      let nextGrade = await Grade.findOne({ name: nextName, programId: currentEnrollment.programId._id });
      if (!nextGrade) {
        nextGrade = await Grade.create({ name: nextName, level: nextLevel, programId: currentEnrollment.programId._id });
      }
      nextGradeId = nextGrade._id;
    } else {
      // Distance: batch progression
      const currentGradeName = currentEnrollment.gradeId?.name || '';
      const batchMatch = currentGradeName.match(/(\d+)/);
      const currentBatch = batchMatch ? parseInt(batchMatch[1]) : 1;
      const nextBatch = currentBatch + 1;
      nextName = `Batch ${nextBatch}`;
      let nextBatchGrade = await Grade.findOne({ name: nextName, programId: currentEnrollment.programId._id });
      if (!nextBatchGrade) {
        nextBatchGrade = await Grade.create({ name: nextName, level: nextBatch, programId: currentEnrollment.programId._id });
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

    // Check duplicate
    const existingNext = await AcademicEnrollment.findOne({
      studentProfileId: studentProfile._id,
      academicYearId: nextYear._id,
      programId: currentEnrollment.programId._id,
      gradeId: nextGradeId,
    });
    if (existingNext) {
      return res.status(400).json({ success: false, message: 'Student already has an enrollment for the next year/grade' });
    }

    // Complete current enrollment
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
      message: `Student progressed to ${nextName} for ${nextYearName}.`,
      newEnrollment,
    });
  } catch (err) {
    console.error('Progression error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;