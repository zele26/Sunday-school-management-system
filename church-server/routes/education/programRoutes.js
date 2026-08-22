const express = require('express');
const router = express.Router();
const Program = require('../../models/education/Program');
const { protect } = require('../../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const programs = await Program.find({ status: 'active' });
    res.json({ success: true, programs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;