// church-server/routes/education/courseEnrollmentRoutes.js
const express = require('express');
const router = express.Router();
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const CourseEnrollment = require('../../models/education/CourseEnrollment');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/education/academic-enrollments/:enrollmentId/courses
router.get('/enrollments/:enrollmentId/courses', protect, authorize('admin'), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const courseEnrollments = await CourseEnrollment.find({ academicEnrollmentId: enrollmentId })
      .populate('courseId', 'name grade description')
      .populate('teachers', 'personId firstName lastName email')
      .populate('teacherId', 'personId firstName lastName email');
    res.json({ success: true, courseEnrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST single course
router.post('/enrollments/:enrollmentId/courses', protect, authorize('admin'), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { courseId, teacherIds = [] } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });

    const enrollment = await AcademicEnrollment.findById(enrollmentId);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    const exists = await CourseEnrollment.findOne({ academicEnrollmentId: enrollmentId, courseId });
    if (exists) return res.status(400).json({ success: false, message: 'Course already assigned' });

    const courseEnrollment = await CourseEnrollment.create({
      academicEnrollmentId: enrollmentId,
      courseId,
      teachers: teacherIds,
      teacherId: teacherIds[0] || null,
      status: 'enrolled',
    });

    res.status(201).json({ success: true, courseEnrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST bulk courses
router.post('/enrollments/:enrollmentId/bulk-courses', protect, authorize('admin'), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { items } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items array is required' });
    }

    const enrollment = await AcademicEnrollment.findById(enrollmentId);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    const created = [];
    for (const item of items) {
      const { courseId, teacherIds = [] } = item;
      if (!courseId) continue;

      const exists = await CourseEnrollment.findOne({ academicEnrollmentId: enrollmentId, courseId });
      if (exists) continue;

      const courseEnrollment = await CourseEnrollment.create({
        academicEnrollmentId: enrollmentId,
        courseId,
        teachers: teacherIds,
        teacherId: teacherIds[0] || null,
        status: 'enrolled',
      });
      created.push(courseEnrollment);
    }

    res.status(201).json({
      success: true,
      message: `${created.length} course(s) assigned successfully.`,
      created,
    });
  } catch (err) {
    console.error('Bulk course assignment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/education/course-enrollments/:id/complete
router.put('/course-enrollments/:id/complete', protect, authorize('admin'), async (req, res) => {
  try {
    const { finalResult, mark } = req.body;
    const courseEnrollment = await CourseEnrollment.findById(req.params.id);
    if (!courseEnrollment) return res.status(404).json({ success: false, message: 'Course enrollment not found' });

    courseEnrollment.status = 'completed';
    courseEnrollment.finalResult = finalResult || '';
    courseEnrollment.mark = mark !== undefined ? mark : null;
    courseEnrollment.completionDate = new Date();
    await courseEnrollment.save();

    res.json({ success: true, courseEnrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;