// church-server/routes/core/departmentRoutes.js
const express = require('express');
const router = express.Router();
const Department = require('../../models/Department');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/core/departments
router.get('/', protect, async (req, res) => {
  try {
    const departments = await Department.find({ status: 'Active' }).sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/core/departments – admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, code, description, parentDepartmentId } = req.body;
    if (!name || !code) return res.status(400).json({ success: false, message: 'Name and code are required' });

    const existing = await Department.findOne({ $or: [{ name }, { code }] });
    if (existing) return res.status(400).json({ success: false, message: 'Department already exists' });

    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || '',
      parentDepartmentId: parentDepartmentId || null,
    });

    res.status(201).json({ success: true, department });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;