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

module.exports = router;