// church-server/routes/core/departmentMembershipRoutes.js
const express = require('express');
const router = express.Router();
const DepartmentMembership = require('../../models/DepartmentMembership');
const Person = require('../../models/Person');
const Department = require('../../models/Department');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/core/department-memberships?personId=xxx
router.get('/', protect, async (req, res) => {
  try {
    const { personId, departmentId, status } = req.query;
    const query = {};
    if (personId) query.personId = personId;
    if (departmentId) query.departmentId = departmentId;
    if (status) query.status = status;

    const memberships = await DepartmentMembership.find(query)
      .populate('personId', 'firstName middleName lastName phone email')
      .populate('departmentId', 'name code')
      .sort({ startDate: -1 });

    res.json({ success: true, memberships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/core/department-memberships – add person to department
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { personId, departmentId, departmentMemberId, roleId, status, startDate, metadata } = req.body;
    if (!personId || !departmentId) return res.status(400).json({ success: false, message: 'personId and departmentId are required' });

    const person = await Person.findById(personId);
    if (!person) return res.status(400).json({ success: false, message: 'Person not found' });

    const department = await Department.findById(departmentId);
    if (!department) return res.status(400).json({ success: false, message: 'Department not found' });

    const membership = await DepartmentMembership.create({
      personId,
      departmentId,
      departmentMemberId: departmentMemberId || null,
      roleId: roleId || null,
      status: status || 'active',
      startDate: startDate || new Date(),
      metadata: metadata || {},
    });

    res.status(201).json({ success: true, membership });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/core/department-memberships/:id – update membership (e.g., change status)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updates = {};
    const allowed = ['status', 'endDate', 'roleId', 'metadata'];
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    const membership = await DepartmentMembership.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!membership) return res.status(404).json({ success: false, message: 'Membership not found' });

    res.json({ success: true, membership });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;