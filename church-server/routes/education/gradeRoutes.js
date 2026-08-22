const express = require('express');
const router = express.Router();
const Grade = require('../../models/education/Grade');
const { protect } = require('../../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const grades = await Grade.find().populate('programId', 'name code');
    res.json({ success: true, grades });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;