const express = require('express');
const router = express.Router();
const StudentProfile = require('../../models/education/StudentProfile');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/education/student-profiles
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const profiles = await StudentProfile.find()
      .populate('personId', 'firstName middleName lastName phone email')
      .sort({ createdAt: -1 });
    res.json({ success: true, profiles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;