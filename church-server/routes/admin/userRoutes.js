// routes/admin/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Student = require('../../models/Student');
const { AdminPanelData } = require('../../models/PanelData');

// Stats
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

// All Users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Pending Approvals
router.get('/pending-approvals', async (req, res) => {
  try {
    const pending = await User.find({ status: 'pending' }).select('-password');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Approve
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

// Reject
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

// Panel data
router.get('/panel-data', async (req, res) => {
  try {
    let panelData = await AdminPanelData.findOne();
    if (!panelData) panelData = await AdminPanelData.create({});
    res.json({ data: panelData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
});

// List teachers (for dropdown)
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', status: 'approved' }).select('fullName email');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;