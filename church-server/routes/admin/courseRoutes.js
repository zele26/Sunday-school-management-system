// routes/admin/courseRoutes.js
const express = require('express');
const router = express.Router();
const Course = require('../../models/Course');
const mongoose = require('mongoose');

// Create
router.post('/', async (req, res) => {
  try {
    const courseData = { ...req.body };

    if (!courseData.teacher || courseData.teacher === '') {
      delete courseData.teacher;
    }
    if (!courseData.prerequisiteCourse || courseData.prerequisiteCourse === '' || !mongoose.Types.ObjectId.isValid(courseData.prerequisiteCourse)) {
      courseData.prerequisiteCourse = null;
    }

    if (typeof courseData.bibleBooks === 'string') {
      courseData.bibleBooks = courseData.bibleBooks.split(',').map(s => s.trim());
    }
    if (typeof courseData.requiredMaterials === 'string') {
      courseData.requiredMaterials = courseData.requiredMaterials.split(',').map(s => s.trim());
    }

    const course = await Course.create(courseData);
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List (with filters)
router.get('/', async (req, res) => {
  try {
    const { status, ageGroup, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (ageGroup) query.ageGroup = ageGroup;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { bibleTheme: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await Course.find(query)
      .populate('teacher', 'fullName email')
      .populate('prerequisiteCourse', 'name')
      .sort({ createdAt: -1 });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'fullName email')
      .populate('prerequisiteCourse', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.teacher === '') delete updates.teacher;
    if (updates.prerequisiteCourse === '' || !mongoose.Types.ObjectId.isValid(updates.prerequisiteCourse || '')) {
      updates.prerequisiteCourse = null;
    }

    if (typeof updates.bibleBooks === 'string') {
      updates.bibleBooks = updates.bibleBooks.split(',').map(s => s.trim());
    }
    if (typeof updates.requiredMaterials === 'string') {
      updates.requiredMaterials = updates.requiredMaterials.split(',').map(s => s.trim());
    }

    const course = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
      .populate('teacher', 'fullName email')
      .populate('prerequisiteCourse', 'name');

    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;