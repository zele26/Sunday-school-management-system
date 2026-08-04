const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const User = require('../../models/User');
const Teacher = require('../../models/Teacher');
const bcrypt = require('bcryptjs');

// ---------- Helper: Generate teacherId ----------
const generateTeacherId = async () => {
  const count = await Teacher.countDocuments();
  const year = new Date().getFullYear();
  return `TCH-${year}-${String(count + 1).padStart(4, '0')}`;
};

// ---------- List Teachers ----------
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = {};
    
    if (search && search.trim()) {
      const userQuery = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
      const users = await User.find(userQuery).select('_id');
      const userIds = users.map(u => u._id);
      query.userId = { $in: userIds };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Teacher.countDocuments(query);
    const teachers = await Teacher.find(query)
      .populate('userId', 'fullName email role status')
      .populate('coursesTaught', 'name')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({ 
      success: true, 
      teachers, 
      total, 
      page: parseInt(page), 
      totalPages: Math.ceil(total / parseInt(limit)) 
    });
  } catch (err) {
    console.error('List teachers error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Get Single Teacher ----------
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('userId', 'fullName email role status')
      .populate('coursesTaught', 'name');
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.json({ success: true, teacher });
  } catch (err) {
    console.error('Get teacher error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Create Teacher ----------
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password, phone, subject, qualification, experience, bio, address, city, gender, dateOfBirth } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, and password are required.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const newUser = await User.create({
      fullName: `${firstName} ${lastName}`,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'teacher',
      status: 'approved',
    });

    // Generate teacherId
    const teacherId = await generateTeacherId();

    // Create Teacher profile
    const teacher = await Teacher.create({
      teacherId,
      firstName,
      middleName: middleName || '',
      lastName,
      email: email.toLowerCase(),
      phone: phone || '',
      subject: subject || '',
      qualification: qualification || '',
      experience: experience || '',
      bio: bio || '',
      address: address || '',
      city: city || '',
      gender: gender || '',
      dateOfBirth: dateOfBirth || '',
      userId: newUser._id,
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher,
    });
  } catch (err) {
    console.error('Create teacher error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Update Teacher ----------
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { firstName, middleName, lastName, phone, subject, qualification, experience, bio, address, city, gender, dateOfBirth } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Update teacher profile
    if (firstName) teacher.firstName = firstName;
    if (middleName !== undefined) teacher.middleName = middleName;
    if (lastName) teacher.lastName = lastName;
    if (phone) teacher.phone = phone;
    if (subject !== undefined) teacher.subject = subject;
    if (qualification !== undefined) teacher.qualification = qualification;
    if (experience !== undefined) teacher.experience = experience;
    if (bio !== undefined) teacher.bio = bio;
    if (address !== undefined) teacher.address = address;
    if (city !== undefined) teacher.city = city;
    if (gender !== undefined) teacher.gender = gender;
    if (dateOfBirth !== undefined) teacher.dateOfBirth = dateOfBirth;

    await teacher.save();

    // Update User fullName if name changed
    if (firstName || lastName) {
      const fullName = `${teacher.firstName} ${teacher.lastName}`;
      await User.findByIdAndUpdate(teacher.userId, { fullName });
    }

    const updatedTeacher = await Teacher.findById(teacher._id)
      .populate('userId', 'fullName email role status');

    res.json({ success: true, message: 'Teacher updated', teacher: updatedTeacher });
  } catch (err) {
    console.error('Update teacher error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Delete Teacher ----------
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    // Delete user and teacher
    await User.findByIdAndDelete(teacher.userId);
    await Teacher.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (err) {
    console.error('Delete teacher error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;