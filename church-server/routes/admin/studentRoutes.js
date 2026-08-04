// // routes/admin/studentRoutes.js
// const express = require('express');
// const router = express.Router();
// const User = require('../../models/User');
// const Student = require('../../models/Student');
// const Course = require('../../models/Course');
// const bcrypt = require('bcryptjs');
// const { Parser } = require('json2csv');
// const qrcode = require('qrcode');
// const crypto = require('crypto');

// // ---------- Create Student ----------
// router.post('/', async (req, res) => {
//   try {
//     const {
//       firstName, middleName, lastName, dob, grade, address, contactPhone,
//       email, password,
//       emergencyFirstName, emergencyMiddleName, emergencyLastName,
//       relationship, emergencyPhone, emergencyEmail, emergencyAddress,
//     } = req.body;

//     if (!firstName || !lastName || !email || !password) {
//       return res.status(400).json({ success: false, message: 'First name, last name, email, and password are required.' });
//     }

//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
//     }

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
//     const newUser = await User.create({
//       fullName,
//       email: email.toLowerCase(),
//       password: hashedPassword,
//       role: 'student',
//       status: 'approved',
//     });

//     const studentData = {
//       userId: newUser._id,
//       firstName,
//       middleName: middleName || '',
//       lastName,
//       dob: dob || '',
//       grade: grade || '',
//       address: address || '',
//       regYear: new Date().getFullYear().toString(),
//       emergencyFirstName: emergencyFirstName || '',
//       emergencyMiddleName: emergencyMiddleName || '',
//       emergencyLastName: emergencyLastName || '',
//       relationship: relationship || '',
//       contactPhone: emergencyPhone || '',
//       contactAddress: emergencyAddress || '',
//       contactEmail: emergencyEmail || '',
//       studentPhone: contactPhone || '',
//     };

//     const newStudent = await Student.create(studentData);

//     res.status(201).json({
//       success: true,
//       message: 'Student account created successfully.',
//       student: {
//         id: newStudent._id,
//         firstName: newStudent.firstName,
//         lastName: newStudent.lastName,
//         email: newUser.email,
//         grade: newStudent.grade,
//       },
//     });
//   } catch (error) {
//     console.error('Create student error:', error);
//     res.status(500).json({ success: false, message: 'Server error while creating student.' });
//   }
// });

// // ---------- List students (with search, filter, pagination) ----------
// router.get('/', async (req, res) => {
//   try {
//     const { search, grade, page = 1, limit = 20 } = req.query;
//     const query = {};

//     if (search) {
//       const userQuery = {
//         $or: [
//           { fullName: { $regex: search, $options: 'i' } },
//           { email: { $regex: search, $options: 'i' } }
//         ]
//       };
//       const users = await User.find(userQuery).select('_id');
//       const userIds = users.map(u => u._id);
//       query.userId = { $in: userIds };
//     }

//     if (grade) query.grade = grade;

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const total = await Student.countDocuments(query);
//     const students = await Student.find(query)
//       .populate('userId', 'email fullName')
//       .populate('teacher', 'fullName email')
//       .populate('courses', 'name grade')
//       .select('+studentId')                 // ← ENSURE studentId is included
//       .sort({ registrationDate: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     res.json({ students, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- Export Students as CSV ----------
// router.get('/export', async (req, res) => {
//   try {
//     const { search, grade } = req.query;
//     const query = {};

//     if (search) {
//       const userQuery = {
//         $or: [
//           { fullName: { $regex: search, $options: 'i' } },
//           { email: { $regex: search, $options: 'i' } }
//         ]
//       };
//       const users = await User.find(userQuery).select('_id');
//       const userIds = users.map(u => u._id);
//       query.userId = { $in: userIds };
//     }

//     if (grade) query.grade = grade;

//     const students = await Student.find(query)
//       .populate('userId', 'email fullName')
//       .populate('teacher', 'fullName email')
//       .populate('courses', 'name grade')
//       .select('+studentId')                 // ← ENSURE studentId is included
//       .sort({ registrationDate: -1 })
//       .lean();

//     const csvData = students.map(s => ({
//       'Student ID': s._id.toString(),
//       'First Name': s.firstName || '',
//       'Middle Name': s.middleName || '',
//       'Last Name': s.lastName || '',
//       'Grade': s.grade || '',
//       'Date of Birth': s.dob || '',
//       'Address': s.address || '',
//       'Student Phone': s.studentPhone || '',
//       'Email (login)': s.userId?.email || '',
//       'Assigned Teacher': s.teacher?.fullName || '',
//       'Teacher Email': s.teacher?.email || '',
//       'Courses': s.courses?.map(c => c.name).join('; ') || '',
//       'School ID': s.studentId || '',       // ← ADDED to CSV
//       'Emergency First Name': s.emergencyFirstName || '',
//       'Emergency Middle Name': s.emergencyMiddleName || '',
//       'Emergency Last Name': s.emergencyLastName || '',
//       'Relationship': s.relationship || '',
//       'Emergency Phone': s.contactPhone || '',
//       'Emergency Email': s.contactEmail || '',
//       'Emergency Address': s.contactAddress || '',
//       'Registration Date': s.registrationDate ? new Date(s.registrationDate).toLocaleDateString() : '',
//     }));

//     const fields = Object.keys(csvData[0] || {});
//     const parser = new Parser({ fields });
//     const csv = parser.parse(csvData);

//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
//     res.status(200).send(csv);
//   } catch (err) {
//     console.error('Export error:', err);
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- QR Code Generation ----------
// router.post('/generate-qr', async (req, res) => {
//   try {
//     const { studentId } = req.body;

//     if (studentId) {
//       const student = await Student.findById(studentId);
//       if (!student) return res.status(404).json({ message: 'Student not found' });

//       if (!student.qrCode) {
//         student.qrCode = crypto.randomUUID();
//         await student.save();
//       }
//       const qrDataUrl = await qrcode.toDataURL(student.qrCode);
//       return res.json({ studentId: student._id, qrCode: student.qrCode, qrImage: qrDataUrl });
//     }

//     const studentsWithoutQR = await Student.find({ qrCode: { $exists: false } });
//     for (const s of studentsWithoutQR) {
//       s.qrCode = crypto.randomUUID();
//       await s.save();
//     }
//     res.json({ message: `Generated QR codes for ${studentsWithoutQR.length} students.` });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- Assign teacher to student ----------
// router.put('/:id/assign-teacher', async (req, res) => {
//   try {
//     const { teacherId } = req.body;
//     if (!teacherId) return res.status(400).json({ success: false, message: 'Teacher ID required' });

//     const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
//     if (!teacher) return res.status(400).json({ success: false, message: 'Invalid teacher' });

//     const student = await Student.findByIdAndUpdate(
//       req.params.id,
//       { teacher: teacherId },
//       { new: true }
//     ).populate('teacher', 'fullName email');

//     if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

//     res.json({ success: true, student });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ---------- Assign courses (replace entire list) ----------
// router.put('/:id/assign-courses', async (req, res) => {
//   try {
//     const { courseIds } = req.body;
//     if (!courseIds || !Array.isArray(courseIds)) {
//       return res.status(400).json({ success: false, message: 'courseIds array required' });
//     }

//     const validCourses = await Course.find({ _id: { $in: courseIds } });
//     if (validCourses.length !== courseIds.length) {
//       return res.status(400).json({ success: false, message: 'Some course IDs are invalid' });
//     }

//     const student = await Student.findByIdAndUpdate(
//       req.params.id,
//       { courses: courseIds },
//       { new: true }
//     ).populate('courses', 'name grade');

//     if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

//     res.json({ success: true, student });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ---------- Add a single course (optional) ----------
// router.put('/:id/add-course', async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     if (!courseId) return res.status(400).json({ success: false, message: 'Course ID required' });

//     const course = await Course.findById(courseId);
//     if (!course) return res.status(400).json({ success: false, message: 'Course not found' });

//     const student = await Student.findById(req.params.id);
//     if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

//     if (!student.courses.includes(courseId)) {
//       student.courses.push(courseId);
//       await student.save();
//     }

//     res.json({ success: true, student: await student.populate('courses', 'name grade') });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// module.exports = router;






// routes/admin/studentRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Student = require('../../models/Student');
const Course = require('../../models/Course');
const bcrypt = require('bcryptjs');
const { Parser } = require('json2csv');
const qrcode = require('qrcode');
const crypto = require('crypto');
const { protect, authorize } = require('../../middleware/auth'); // ✅ Added auth

// ---------- Create Student ----------
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      firstName, middleName, lastName, dob, grade, address, contactPhone,
      email, password,
      emergencyFirstName, emergencyMiddleName, emergencyLastName,
      relationship, emergencyPhone, emergencyEmail, emergencyAddress,
    } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'First name, last name, email, and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const fullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const newUser = await User.create({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      status: 'approved',
    });

    const studentData = {
      userId: newUser._id,
      firstName,
      middleName: middleName || '',
      lastName,
      dob: dob || '',
      grade: grade || '',
      address: address || '',
      regYear: new Date().getFullYear().toString(),
      emergencyFirstName: emergencyFirstName || '',
      emergencyMiddleName: emergencyMiddleName || '',
      emergencyLastName: emergencyLastName || '',
      relationship: relationship || '',
      contactPhone: emergencyPhone || '',
      contactAddress: emergencyAddress || '',
      contactEmail: emergencyEmail || '',
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
    res.status(500).json({ success: false, message: 'Server error while creating student.' });
  }
});

// ---------- List students (with search, filter, pagination) ----------
// ✅ Fixed: added authentication, search trim, and success wrapper
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, grade, page = 1, limit = 20 } = req.query;
    const query = {};

    // ✅ Only search if search term is provided and not empty
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

    if (grade) query.grade = grade;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('userId', 'email fullName')
      .populate('teacher', 'fullName email')
      .populate('courses', 'name grade')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // ✅ Wrapped response with success flag
    res.json({
      success: true,
      students,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    console.error('List students error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Export Students as CSV ----------
router.get('/export', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, grade } = req.query;
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

    if (grade) query.grade = grade;

    const students = await Student.find(query)
      .populate('userId', 'email fullName')
      .populate('teacher', 'fullName email')
      .populate('courses', 'name grade')
      .sort({ registrationDate: -1 })
      .lean();

    const csvData = students.map(s => ({
      'Student ID': s._id.toString(),
      'First Name': s.firstName || '',
      'Middle Name': s.middleName || '',
      'Last Name': s.lastName || '',
      'Grade': s.grade || '',
      'Date of Birth': s.dob || '',
      'Address': s.address || '',
      'Student Phone': s.studentPhone || '',
      'Email (login)': s.userId?.email || '',
      'Assigned Teacher': s.teacher?.fullName || '',
      'Teacher Email': s.teacher?.email || '',
      'Courses': s.courses?.map(c => c.name).join('; ') || '',
      'Emergency First Name': s.emergencyFirstName || '',
      'Emergency Middle Name': s.emergencyMiddleName || '',
      'Emergency Last Name': s.emergencyLastName || '',
      'Relationship': s.relationship || '',
      'Emergency Phone': s.contactPhone || '',
      'Emergency Email': s.contactEmail || '',
      'Emergency Address': s.contactAddress || '',
      'Registration Date': s.registrationDate ? new Date(s.registrationDate).toLocaleDateString() : '',
    }));

    const fields = Object.keys(csvData[0] || {});
    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.status(200).send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ message: err.message });
  }
});

// ---------- QR Code Generation ----------
router.post('/generate-qr', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentId } = req.body;

    if (studentId) {
      const student = await Student.findById(studentId);
      if (!student) return res.status(404).json({ message: 'Student not found' });

      if (!student.qrCode) {
        student.qrCode = crypto.randomUUID();
        await student.save();
      }
      const qrDataUrl = await qrcode.toDataURL(student.qrCode);
      return res.json({ studentId: student._id, qrCode: student.qrCode, qrImage: qrDataUrl });
    }

    const studentsWithoutQR = await Student.find({ qrCode: { $exists: false } });
    for (const s of studentsWithoutQR) {
      s.qrCode = crypto.randomUUID();
      await s.save();
    }
    res.json({ message: `Generated QR codes for ${studentsWithoutQR.length} students.` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- Assign teacher to student ----------
router.put('/:id/assign-teacher', protect, authorize('admin'), async (req, res) => {
  try {
    const { teacherId } = req.body;
    if (!teacherId) return res.status(400).json({ success: false, message: 'Teacher ID required' });

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

// ---------- Assign courses (replace entire list) ----------
router.put('/:id/assign-courses', protect, authorize('admin'), async (req, res) => {
  try {
    const { courseIds } = req.body;
    if (!courseIds || !Array.isArray(courseIds)) {
      return res.status(400).json({ success: false, message: 'courseIds array required' });
    }

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

// ---------- Add a single course (optional) ----------
router.put('/:id/add-course', protect, authorize('admin'), async (req, res) => {
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

// ---------- Get Single Student by ID ----------
// ✅ Added missing route
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'email fullName')
      .populate('teacher', 'fullName email')
      .populate('courses', 'name grade description');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Update Student ----------
// ✅ Added missing route
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { firstName, middleName, lastName, dob, grade, address, contactPhone } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (firstName) student.firstName = firstName;
    if (middleName !== undefined) student.middleName = middleName;
    if (lastName) student.lastName = lastName;
    if (dob) student.dob = dob;
    if (grade) student.grade = grade;
    if (address) student.address = address;
    if (contactPhone) student.studentPhone = contactPhone;

    await student.save();

    if (firstName || lastName) {
      const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');
      await User.findByIdAndUpdate(student.userId, { fullName });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      student: await student.populate('userId', 'email fullName')
    });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Delete Student ----------
// ✅ Added missing route
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    await User.findByIdAndDelete(student.userId);
    await Student.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// Temporary debug route – remove after testing
router.get('/debug/raw', protect, authorize('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const db = mongoose.connection.db;
    
    // Count using native driver
    const count = await db.collection('students').countDocuments({});
    const sample = await db.collection('students').find({}).limit(2).toArray();
    
    res.json({ 
      collectionName: 'students', 
      count, 
      sample,
      dbName: db.databaseName 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;