// church-server/routes/education/studentProfileRoutes.js
const express = require('express');
const router = express.Router();
const StudentProfile = require('../../models/education/StudentProfile');
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/education/student-profiles
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const profiles = await StudentProfile.find()
      .populate('personId', 'firstName middleName lastName phone email')
      .sort({ createdAt: -1 });

    const profilesWithEnrollment = await Promise.all(profiles.map(async (profile) => {
      const latestEnrollment = await AcademicEnrollment.findOne({ studentProfileId: profile._id })
        .populate('gradeId', 'name level')
        .populate('programId', 'name code type')
        .populate('academicYearId', 'name')
        .sort({ startDate: -1, createdAt: -1 });
      return { ...profile.toObject(), latestEnrollment };
    }));

    res.json({ success: true, profiles: profilesWithEnrollment });
  } catch (err) {
    console.error('List profiles error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;