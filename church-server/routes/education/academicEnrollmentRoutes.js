const express = require('express');
const router = express.Router();
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const { protect } = require('../../middleware/auth');

// GET /api/education/academic-enrollments
router.get('/', protect, async (req, res) => {
  try {
    const enrollments = await AcademicEnrollment.find()
      .populate({
        path: 'studentProfileId',
        populate: { path: 'personId', select: 'firstName lastName' }
      })
      .populate('academicYearId', 'name')
      .populate('programId', 'name code')
      .populate('gradeId', 'name')
      .populate('studyModeId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// GET /api/education/academic-enrollments/:enrollmentId
router.get('/:enrollmentId', protect, async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const enrollment = await AcademicEnrollment.findById(enrollmentId)
      .populate('studentProfileId', 'studentNumber')
      .populate('academicYearId', 'name')
      .populate('programId', 'name code type')
      .populate('gradeId', 'name level')
      .populate('studyModeId', 'name code')
      .populate('scheduleId', 'name code');
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    res.json({ success: true, enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;