// routes/admin/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const Attendance = require('../../models/Attendance');
const Student = require('../../models/Student');

// Scan QR and record attendance
router.post('/scan', async (req, res) => {
  try {
    const { qrCode, courseId } = req.body;
    if (!qrCode) return res.status(400).json({ message: 'QR code data required' });

    const student = await Student.findOne({ qrCode });
    if (!student) return res.status(404).json({ message: 'Invalid QR code. Student not found.' });

    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const alreadyMarked = await Attendance.findOne({
      student: student._id,
      date: { $gte: today, $lt: tomorrow },
      ...(courseId ? { course: courseId } : {}),
    });
    if (alreadyMarked) {
      return res.json({
        success: true,
        message: 'Attendance already recorded for today.',
        student: { id: student._id, name: `${student.firstName} ${student.lastName}` },
      });
    }

    await Attendance.create({
      student: student._id,
      course: courseId || null,
      date: new Date(),
      scannedBy: req.user._id,
    });

    res.json({ success: true, message: 'Attendance recorded.', student: { id: student._id, name: `${student.firstName} ${student.lastName}` } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Basic attendance report (admin)
router.get('/report', async (req, res) => {
  try {
    const { startDate, endDate, courseId } = req.query;
    const query = {};
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (courseId) query.course = courseId;

    const attendances = await Attendance.find(query)
      .populate('student', 'firstName lastName grade')
      .populate('course', 'name')
      .sort({ date: -1 });

    res.json(attendances);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;