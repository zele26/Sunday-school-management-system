const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStudentAnalytics,
  getTeacherAnalytics,
  getAdminAnalytics,
} = require('../controllers/analyticsController');

// Protect all routes
router.use(protect);

// Student self-service analytics (also allowed for admin/teacher with ?studentId=)
router.get('/student/me', getStudentAnalytics);

// Teacher analytics for courses & students taught by teacher
router.get('/teacher/courses', authorize('teacher', 'admin', 'superadmin'), getTeacherAnalytics);

// Admin school-wide analytics dashboard
router.get('/admin/overview', authorize('admin', 'superadmin', 'department_admin'), getAdminAnalytics);

module.exports = router;
