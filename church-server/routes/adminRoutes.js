// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');   // Optional: for storing extra student info
const { AdminPanelData } = require('../models/PanelData');
const { protect, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// All routes below require a valid token and admin role
router.use(protect);
router.use(authorize('admin'));

// ---------- Existing routes ----------
// Stats Endpoint
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

// Fetch All Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Fetch Pending Approvals
router.get('/pending-approvals', async (req, res) => {
  try {
    const pending = await User.find({ status: 'pending' }).select('-password');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve a user
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

// Reject a user
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

// Admin Panel Data
router.get('/panel-data', async (req, res) => {
  try {
    let panelData = await AdminPanelData.findOne();
    if (!panelData) {
      panelData = await AdminPanelData.create({});
    }
    res.json({ data: panelData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

router.put('/panel-data', async (req, res) => {
  try {
    const payload = req.body || {};
    let panelData = await AdminPanelData.findOne();
    if (!panelData) {
      panelData = new AdminPanelData(payload);
    } else {
      Object.assign(panelData, payload);
    }
    await panelData.save();
    res.json({ data: panelData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// ---------- NEW: Admin creates a student account ----------
router.post('/students', async (req, res) => {
  try {
    const { fullName, email, password, grade, parentName, parentPhone, address } = req.body;

    // Basic validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and password are required.',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User with role=student and status=approved
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      status: 'approved',
    });

    // Optionally create a Student record for extra info (if Student model exists)
    // If your Student model is different, adjust the fields accordingly.
    try {
      await Student.create({
        userId: newUser._id,
        fullName,
        grade,
        parentName,
        parentPhone,
        address,
      });
    } catch (studentErr) {
      console.warn('Could not create Student record (maybe the model is not used):', studentErr.message);
      // Not critical – the User record is already created
    }

    res.status(201).json({
      success: true,
      message: 'Student account created successfully.',
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating student.',
    });
  }
});

module.exports = router;