// routes/resourceRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Resource = require('../models/Resource');
const Student = require('../models/Student');

// All routes require a token
router.use(protect);

// ---------- Teacher / Admin: create a resource ----------
router.post('/', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const resource = await Resource.create({
      ...req.body,
      uploadedBy: req.user._id,
    });
    res.status(201).json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher / Admin: update a resource ----------
router.put('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher / Admin: delete a resource ----------
router.delete('/:id', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) return res.status(404).json({ message: 'Resource not found' });
    res.json({ success: true, message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Teacher / Admin: list all resources (optionally filter by course) ----------
router.get('/', authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { courseId } = req.query;
    const query = {};
    if (courseId) query.course = courseId;
    const resources = await Resource.find(query)
      .populate('course', 'name')
      .populate('uploadedBy', 'fullName')
      .sort({ uploadDate: -1 });
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Student: view resources for enrolled courses ----------
router.get('/my', async (req, res) => {
  try {
    // Find the student record
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(403).json({ message: 'Student record not found' });

    const resources = await Resource.find({
      course: { $in: student.courses },
      visibility: 'Published',
    })
      .populate('course', 'name')
      .populate('uploadedBy', 'fullName')
      .sort({ uploadDate: -1 });

    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;