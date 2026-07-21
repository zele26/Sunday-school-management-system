// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const { AdminPanelData } = require('../models/PanelData');
const { protect, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const Course = require('../models/Course'); 

// All routes below require a valid token and admin role
router.use(protect);
router.use(authorize('admin'));

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

// ---------- Create Student (User + Student document) ----------
router.post('/students', async (req, res) => {
  try {
    const {
      // Student personal info
      firstName,
      middleName,
      lastName,
      dob,
      grade,
      address,
      contactPhone,   // student's own phone (to be stored in a new field if you add it)

      // Account credentials
      email,
      password,

      // Emergency contact
      emergencyFirstName,
      emergencyMiddleName,
      emergencyLastName,
      relationship,
      emergencyPhone,
      emergencyEmail,
      emergencyAddress,
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, email, and password are required.',
      });
    }

    // Check duplicate email
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

    // 1. Create User for authentication
    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      status: 'approved',
    });

    // 2. Create Student document (matching your existing Student model)
    const studentData = {
      firstName,
      middleName: middleName || '',
      lastName,
      dob: dob || '',
      grade: grade || '',
      address: address || '',
      regYear: new Date().getFullYear().toString(),

      // Emergency contact fields (model's existing fields)
      emergencyFirstName: emergencyFirstName || '',
      emergencyMiddleName: emergencyMiddleName || '',
      emergencyLastName: emergencyLastName || '',
      relationship: relationship || '',
      contactPhone: emergencyPhone || '',        // store emergency phone here
      contactAddress: emergencyAddress || '',
      contactEmail: emergencyEmail || '',

      // Student's own phone – not yet in your Student model.
      // To store it, add a field `studentPhone: String` to the model.
      // Until then, Mongoose will ignore this property.
      studentPhone: contactPhone || '',
    };

    const newStudent = await Student.create(studentData);

    res.status(201).json({
      success: true,
      message: 'Student account created successfully.',
      student: {
        id: newStudent._id,
        firstName: newStudent.firstName,
        lastName: newStudent.lastName,
        email: newUser.email,
        grade: newStudent.grade,
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


// List all teachers
router.get('/teachers', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', status: 'approved' })
      .select('fullName email');
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//List all courses (for the assign‑course dropdown)
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ name: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//List students with search, filter, and pagination

router.get('/students', async (req, res) => {
  try {
    const { search, grade, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      // search by full name (first + middle + last) or email from User
      // we'll first find matching userIds from User model, then filter students
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

    if (grade) {
      query.grade = grade;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('userId', 'email fullName')          // get login email
      .populate('teacher', 'fullName email')         // assigned teacher info
      .populate('courses', 'name grade')             // enrolled courses
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      students,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Assign a teacher to a student
router.put('/students/:id/assign-teacher', async (req, res) => {
  try {
    const { teacherId } = req.body;
    if (!teacherId) return res.status(400).json({ success: false, message: 'Teacher ID required' });

    // Verify teacher exists and has role teacher
    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) return res.status(400).json({ success: false, message: 'Invalid teacher' });

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { teacher: teacherId },
      { new: true }
    ).populate('teacher', 'fullName email');

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


//Assign courses to a student (replace entire list)
router.put('/students/:id/assign-courses', async (req, res) => {
  try {
    const { courseIds } = req.body;  // array of course ObjectIds
    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ success: false, message: 'courseIds array required' });
    }

    // Optional: verify all courses exist
    const validCourses = await Course.find({ _id: { $in: courseIds } });
    if (validCourses.length !== courseIds.length) {
      return res.status(400).json({ success: false, message: 'Some course IDs are invalid' });
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { courses: courseIds },
      { new: true }
    ).populate('courses', 'name grade');

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//Add a single course
router.put('/students/:id/add-course', async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'Course ID required' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(400).json({ success: false, message: 'Course not found' });

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    if (!student.courses.includes(courseId)) {
      student.courses.push(courseId);
      await student.save();
    }

    res.json({ success: true, student: await student.populate('courses', 'name grade') });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


router.post('/courses', async (req, res) => {
  try {
    const { name, grade, description } = req.body;
    const course = await Course.create({ name, grade, description });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;