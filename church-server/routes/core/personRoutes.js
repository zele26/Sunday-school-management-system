// church-server/routes/core/personRoutes.js
const express = require('express');
const router = express.Router();
const Person = require('../../models/Person');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/core/persons – list with search and pagination
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { middleName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Person.countDocuments(query);
    const persons = await Person.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      persons,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('List persons error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/core/persons/:id – single person
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    if (!person) return res.status(404).json({ success: false, message: 'Person not found' });
    res.json({ success: true, person });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/core/persons – create person (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { firstName, middleName, lastName, gender, dateOfBirth, phone, email, address } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'First name and last name are required' });
    }

    // Check duplicate phone/email
    if (phone) {
      const existingPhone = await Person.findOne({ phone });
      if (existingPhone) return res.status(400).json({ success: false, message: 'Phone number already exists' });
    }
    if (email) {
      const existingEmail = await Person.findOne({ email: email.toLowerCase() });
      if (existingEmail) return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const person = await Person.create({
      firstName,
      middleName: middleName || '',
      lastName,
      gender: gender || 'Male',
      dateOfBirth: dateOfBirth || '',
      phone: phone || '',
      email: email?.toLowerCase() || '',
      address: address || '',
    });

    res.status(201).json({ success: true, person });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/core/persons/:id – update person
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updates = {};
    const allowed = ['firstName', 'middleName', 'lastName', 'gender', 'dateOfBirth', 'phone', 'email', 'address'];
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (updates.email) updates.email = updates.email.toLowerCase();

    const person = await Person.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!person) return res.status(404).json({ success: false, message: 'Person not found' });

    res.json({ success: true, person });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;