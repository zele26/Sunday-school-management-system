const express = require('express');
const router = express.Router();
const StudyMode = require('../../models/education/StudyMode');
const { protect } = require('../../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const modes = await StudyMode.find();
    res.json({ success: true, studyModes: modes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;