const express = require('express');
const router = express.Router();
const Schedule = require('../../models/education/Schedule');
const { protect } = require('../../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const schedules = await Schedule.find();
    res.json({ success: true, schedules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;