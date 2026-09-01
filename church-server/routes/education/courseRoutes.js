// church-server/routes/education/courseRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const EducationCourse = require('../../models/education/Course');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);

// GET /api/education/courses – list courses with filters
router.get('/', async (req, res) => {
  try {
    const { status, ageGroup, search, studentType, grade, programId } = req.query;
    const query = {};

    if (status) query.status = { $regex: new RegExp(`^${status}$`, 'i') };
    if (ageGroup) query.ageGroup = ageGroup;
    if (studentType) query.studentType = studentType;
    if (grade) query.grade = grade;
    if (programId) query.programId = programId;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { bibleTheme: { $regex: search, $options: 'i' } },
      ];
    }

    const courses = await EducationCourse.find(query)
      .populate('teacher', 'fullName email')
      .populate('teacherProfileId', 'teacherNumber subject')
      .populate('prerequisiteCourse', 'name code')
      .populate('programId', 'name code')
      .sort({ createdAt: -1 });

    // Return both direct array and wrapped format depending on caller
    res.json(courses);
  } catch (err) {
    console.error('List education courses error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/education/courses/:id – get course details
router.get('/:id', async (req, res) => {
  try {
    const course = await EducationCourse.findById(req.params.id)
      .populate('teacher', 'fullName email')
      .populate('teacherProfileId', 'teacherNumber subject')
      .populate('prerequisiteCourse', 'name code')
      .populate('programId', 'name code');

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/courses – create course (admin only)
router.post('/', authorize('admin'), async (req, res) => {
  try {
    const courseData = { ...req.body };

    if (!courseData.name) {
      return res.status(400).json({ success: false, message: 'Course name is required' });
    }

    // Clean empty teacher / prerequisiteCourse
    if (!courseData.teacher || courseData.teacher === '') {
      delete courseData.teacher;
    }
    if (!courseData.prerequisiteCourse || courseData.prerequisiteCourse === '' || !mongoose.Types.ObjectId.isValid(courseData.prerequisiteCourse)) {
      courseData.prerequisiteCourse = null;
    }

    // Convert comma-separated strings to arrays
    if (typeof courseData.bibleBooks === 'string') {
      courseData.bibleBooks = courseData.bibleBooks.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof courseData.requiredMaterials === 'string') {
      courseData.requiredMaterials = courseData.requiredMaterials.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (courseData.studentType === 'distance') {
      delete courseData.grade;
    }

    const course = await EducationCourse.create(courseData);
    res.status(201).json(course);
  } catch (err) {
    console.error('Create education course error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/education/courses/:id – update course (admin only)
router.put('/:id', authorize('admin'), async (req, res) => {
  try {
    const updates = { ...req.body };

    if (updates.teacher === '') delete updates.teacher;
    if (updates.prerequisiteCourse === '' || !mongoose.Types.ObjectId.isValid(updates.prerequisiteCourse || '')) {
      updates.prerequisiteCourse = null;
    }

    if (typeof updates.bibleBooks === 'string') {
      updates.bibleBooks = updates.bibleBooks.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (typeof updates.requiredMaterials === 'string') {
      updates.requiredMaterials = updates.requiredMaterials.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (updates.studentType === 'distance') {
      updates.grade = undefined;
    }

    const course = await EducationCourse.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('teacher', 'fullName email')
      .populate('prerequisiteCourse', 'name code')
      .populate('programId', 'name code');

    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/education/courses/:id – delete course (admin only)
router.delete('/:id', authorize('admin'), async (req, res) => {
  try {
    const course = await EducationCourse.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;