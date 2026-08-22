const express = require('express');
const router = express.Router();
const AcademicYear = require('../../models/education/AcademicYear');
const { protect } = require('../../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const years = await AcademicYear.find().sort({ name: -1 });
    res.json({ success: true, years });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;