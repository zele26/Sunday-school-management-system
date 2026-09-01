
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// ---------- Import sub‑routers ----------
const studentRoutes = require('./admin/studentRoutes');
const courseRoutes = require('./admin/courseRoutes');
const attendanceRoutes = require('./admin/attendanceRoutes');
const reportRoutes = require('./admin/reportRoutes');
const userRoutes = require('./admin/userRoutes');
const registrationRoutes = require('./admin/registrationRoutes');   // <-- NEW

// ---------- Protect ALL admin routes ----------
router.use(protect);
router.use(authorize('admin', 'superadmin', 'department_admin'));

// ---------- Mount sub‑routers (paths are relative to /api/admin) ----------
router.use('/students', studentRoutes);       // /api/admin/students/...
router.use('/courses', courseRoutes);        // /api/admin/courses/...
router.use('/attendance', attendanceRoutes);    // /api/admin/attendance/...
router.use('/reports', reportRoutes);        // /api/admin/reports/...
router.use('/registrations', registrationRoutes);  // /api/admin/registrations/...   <-- NEW
router.use('/', userRoutes);          // /api/admin/stats, /api/admin/users, etc.


// ⏳ Temporary – remove after execution
router.post('/fix-sparse-indexes', async (req, res) => {
  try {
    const User = require('../models/User');

    // Drop old non‑sparse indexes (ignore errors if they don't exist)
    try { await User.collection.dropIndex('email_1'); } catch (e) { }
    try { await User.collection.dropIndex('phone_1'); } catch (e) { }

    // Re‑create indexes with current schema (sparse: true)
    await User.createIndexes();

    res.json({ success: true, message: 'Sparse indexes fixed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;