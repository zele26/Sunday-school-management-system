// routes/admin/userRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');                        // <-- added
const User = require('../../models/User');
const Student = require('../../models/Student');
const { AdminPanelData } = require('../../models/PanelData');

// ---------- Stats ----------
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const pendingCount = await User.countDocuments({ status: 'pending' });
    res.json({ totalUsers, totalStudents, pendingCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- All Users ----------
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Pending Approvals ----------
router.get('/pending-approvals', async (req, res) => {
  try {
    const pending = await User.find({ status: 'pending' }).select('-password');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Approve a User ----------
router.put('/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.status = 'approved';
    await user.save();
    res.json({ success: true, message: 'User approved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Reject a User ----------
router.put('/users/:id/reject', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.status = 'rejected';
    await user.save();
    res.json({ success: true, message: 'User rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Admin Panel Data ----------
router.get('/panel-data', async (req, res) => {
  try {
    let panelData = await AdminPanelData.findOne();
    if (!panelData) panelData = await AdminPanelData.create({});
    res.json({ data: panelData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.put('/panel-data', async (req, res) => {
  try {
    const payload = req.body || {};
    let panelData = await AdminPanelData.findOne();
    if (!panelData) panelData = new AdminPanelData(payload);
    else Object.assign(panelData, payload);
    await panelData.save();
    res.json({ data: panelData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ---------- List all teachers (for dropdown) ----------
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', status: 'approved' }).select('fullName email');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Create a new teacher (admin only) ----------
router.post('/teachers', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full name, email, and password are required.' });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the teacher account
    const newTeacher = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'teacher',
      status: 'approved',
    });

    res.status(201).json({
      success: true,
      message: 'Teacher account created successfully.',
      user: {
        id: newTeacher._id,
        fullName: newTeacher.fullName,
        email: newTeacher.email,
        role: newTeacher.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;