// church-server/routes/education/resourceRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const resourceController = require('../../controllers/education/resourceController');

// All routes require authentication
router.use(protect);

// ---------- Teacher Routes ----------
router.get('/my', authorize('teacher', 'admin'), resourceController.getMyResources);
router.post('/', authorize('teacher', 'admin'), resourceController.createResource);
router.put('/:id', authorize('teacher', 'admin'), resourceController.updateResource);
router.delete('/:id', authorize('teacher', 'admin'), resourceController.deleteResource);

// ---------- Admin Routes ----------
router.get('/admin/all', authorize('admin'), resourceController.getAllResourcesForAdmin);
router.put('/admin/approve/:id', authorize('admin'), resourceController.approveResource);

// ---------- Student Routes ----------
router.get('/student/my', authorize('student'), resourceController.getStudentResources);

module.exports = router;
