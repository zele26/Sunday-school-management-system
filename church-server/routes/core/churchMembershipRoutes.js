// church-server/routes/core/churchMembershipRoutes.js
const express = require('express');
const router = express.Router();
const ChurchMembership = require('../../models/ChurchMembership');
const Person = require('../../models/Person');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/core/church-memberships – list all
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const memberships = await ChurchMembership.find()
      .populate('personId', 'firstName middleName lastName phone email')
      .sort({ assignedAt: -1 });
    res.json({ success: true, memberships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/core/church-memberships – assign permanent member ID
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { personId, memberId } = req.body;
    if (!personId || !memberId) {
      return res.status(400).json({ success: false, message: 'personId and memberId are required' });
    }

    // Check if person exists
    const person = await Person.findById(personId);
    if (!person) return res.status(400).json({ success: false, message: 'Person not found' });

    // Check if person already has a membership
    const existing = await ChurchMembership.findOne({ personId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Person already has a church membership' });
    }

    // Check if memberId is unique
    const existingMemberId = await ChurchMembership.findOne({ memberId });
    if (existingMemberId) {
      return res.status(400).json({ success: false, message: 'Member ID already exists' });
    }

    const membership = await ChurchMembership.create({
      personId,
      memberId,
      assignedAt: new Date(),
      status: 'active',
    });

    res.status(201).json({ success: true, membership });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;