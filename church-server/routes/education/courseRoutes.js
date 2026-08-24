// church-server/routes/education/courseRoutes.js
const express = require('express');
const router = express.Router();
const EducationCourse = require('../../models/education/Course');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/education/courses – list all education courses
router.get('/', protect, async (req, res) => {
  try {
    const courses = await EducationCourse.find().sort({ name: 1 });
    res.json({ success: true, courses });
  } catch (err) {
    console.error('List education courses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/courses – create new education course (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, code, description, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Course name is required' });

    const course = await EducationCourse.create({
      name,
      code: code || `C-${Date.now()}`,
      description: description || '',
      status: status || 'active',
    });

    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error('Create education course error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;