const express = require('express');
const router = express.Router();
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const CourseEnrollment = require('../../models/education/CourseEnrollment');
const Course = require('../../models/Course');          // legacy Course
const Teacher = require('../../models/Teacher');        // legacy Teacher
const { protect, authorize } = require('../../middleware/auth');

// GET /api/education/academic-enrollments/:enrollmentId/courses
router.get('/enrollments/:enrollmentId/courses', protect, authorize('admin'), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const courseEnrollments = await CourseEnrollment.find({ academicEnrollmentId: enrollmentId })
      .populate('courseId', 'name grade description')
      .populate('teacherId', 'fullName firstName lastName email');
    res.json({ success: true, courseEnrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/education/academic-enrollments/:enrollmentId/courses – add course with teacher
router.post('/enrollments/:enrollmentId/courses', protect, authorize('admin'), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { courseId, teacherId } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });

    const enrollment = await AcademicEnrollment.findById(enrollmentId);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    // check duplicate
    const exists = await CourseEnrollment.findOne({ academicEnrollmentId: enrollmentId, courseId });
    if (exists) return res.status(400).json({ success: false, message: 'Course already assigned to this enrollment' });

    const courseEnrollment = await CourseEnrollment.create({
      academicEnrollmentId: enrollmentId,
      courseId,
      teacherId: teacherId || null,
      status: 'enrolled',
    });

    res.status(201).json({ success: true, courseEnrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/education/course-enrollments/:id/complete – mark course completed with grade/mark
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


// POST /api/education/academic-enrollments/:enrollmentId/bulk-courses
router.post('/enrollments/:enrollmentId/bulk-courses', protect, authorize('admin'), async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { items } = req.body;   // items: [{ courseId, teacherId }]

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'items array is required' });
    }

    const enrollment = await AcademicEnrollment.findById(enrollmentId);
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    const created = [];
    for (const item of items) {
      const { courseId, teacherId } = item;
      if (!courseId) continue;

      // Check duplicate
      const exists = await CourseEnrollment.findOne({ academicEnrollmentId: enrollmentId, courseId });
      if (exists) continue; // skip already assigned courses

      const courseEnrollment = await CourseEnrollment.create({
        academicEnrollmentId: enrollmentId,
        courseId,
        teacherId: teacherId || null,
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
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;