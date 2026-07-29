
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// ---------- Import sub‑routers ----------
const studentRoutes      = require('./admin/studentRoutes');
const courseRoutes       = require('./admin/courseRoutes');
const attendanceRoutes   = require('./admin/attendanceRoutes');
const reportRoutes       = require('./admin/reportRoutes');
const userRoutes         = require('./admin/userRoutes');
const registrationRoutes = require('./admin/registrationRoutes');   // <-- NEW

// ---------- Protect ALL admin routes ----------
router.use(protect);
router.use(authorize('admin'));

// ---------- Mount sub‑routers (paths are relative to /api/admin) ----------
router.use('/students',      studentRoutes);       // /api/admin/students/...
router.use('/courses',       courseRoutes);        // /api/admin/courses/...
router.use('/attendance',    attendanceRoutes);    // /api/admin/attendance/...
router.use('/reports',       reportRoutes);        // /api/admin/reports/...
router.use('/registrations', registrationRoutes);  // /api/admin/registrations/...   <-- NEW
router.use('/',              userRoutes);          // /api/admin/stats, /api/admin/users, etc.


// ⏳ Temporary – remove after execution
router.post('/fix-sparse-indexes', async (req, res) => {
  try {
    const User = require('../models/User');

    // Drop old non‑sparse indexes (ignore errors if they don't exist)
    try { await User.collection.dropIndex('email_1'); } catch (e) {}
    try { await User.collection.dropIndex('phone_1'); } catch (e) {}

    // Re‑create indexes with current schema (sparse: true)
    await User.createIndexes();

    res.json({ success: true, message: 'Sparse indexes fixed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});




// ⏳ Temporary route – remove after execution
router.post('/backfill-student-ids', async (req, res) => {
  try {
    const Student = require('../models/Student');
    const Registration = require('../models/Registration');

    const generateStudentId = async (studentType) => {
      const prefix = studentType === 'distance' ? 'TKD' : 'TKR';
      const getEthiopianYearSuffix = () => {
        const now = new Date();
        const gregorianYear = now.getFullYear();
        const ethiopianYear =
          now >= new Date(gregorianYear, 8, 11) ? gregorianYear - 7 : gregorianYear - 8;
        return String(ethiopianYear % 100).padStart(2, '0');
      };
      const yearSuffix = getEthiopianYearSuffix();
      const lastStudent = await Student.findOne({
        studentId: { $regex: `^${prefix}-`, $exists: true },
      }).sort({ studentId: -1 }).limit(1);
      let lastNumber = 0;
      if (lastStudent && lastStudent.studentId) {
        const parts = lastStudent.studentId.split('/')[0].split('-');
        lastNumber = parseInt(parts[1]) || 0;
      }
      const newNumber = String(lastNumber + 1).padStart(4, '0');
      return `${prefix}-${newNumber}/${yearSuffix}`;
    };

    const studentsWithoutId = await Student.find({ studentId: { $exists: false } });
    let count = 0;
    for (const s of studentsWithoutId) {
      const studentType = s.studentType || 'regular';
      const newId = await generateStudentId(studentType);
      s.studentId = newId;
      await s.save();
      count++;
      // Also update Registration if phone matches
      await Registration.findOneAndUpdate(
        { phone: s.studentPhone },
        { $set: { studentId: newId } }
      );
    }

    res.json({ success: true, message: `Backfilled ${count} students with School IDs.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;