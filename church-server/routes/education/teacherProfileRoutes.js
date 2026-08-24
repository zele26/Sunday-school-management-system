// church-server/routes/education/teacherProfileRoutes.js
const express = require('express');
const router = express.Router();
const TeacherProfile = require('../../models/education/TeacherProfile');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/education/teacher-profiles – list all teacher profiles
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const profiles = await TeacherProfile.find()
      .populate('personId', 'firstName middleName lastName phone email')
      .sort({ createdAt: -1 });
    res.json({ success: true, profiles });
  } catch (err) {
    console.error('List teacher profiles error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;