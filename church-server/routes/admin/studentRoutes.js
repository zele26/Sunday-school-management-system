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
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../../models/User');
const Student = require('../../models/Student');
const Course = require('../../models/Course');
const bcrypt = require('bcryptjs');
const { Parser } = require('json2csv');
const qrcode = require('qrcode');
const crypto = require('crypto');
const { protect, authorize } = require('../../middleware/auth'); // ✅ Added auth
const { formatEthiopianDate } = require('../../utils/ethiopianDate');

// ---------- Create Student ----------
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      firstName, middleName, lastName, dob, grade, address, contactPhone,
      email, password,
      age, subcity, woreda, kebele, shift,
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
      age: age ? Number(age) : undefined,
      subcity: subcity || '',
      woreda: woreda || '',
      kebele: kebele || '',
      shift: shift || '',
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
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, grade, studentType, page = 1, limit = 20 } = req.query;
    const query = {};

    // Search by name (Student fields) or email (User fields)
    if (search && search.trim()) {
      const s = search.trim();
      // Find users matching name/email
      const userQuery = {
        $or: [
          { fullName: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } }
        ]
      };
      const users = await User.find(userQuery).select('_id');
      const userIds = users.map(u => u._id);

      // Also search directly on Student name fields
      query.$or = [
        { userId: { $in: userIds } },
        { firstName: { $regex: s, $options: 'i' } },
        { middleName: { $regex: s, $options: 'i' } },
        { lastName: { $regex: s, $options: 'i' } },
        { studentId: { $regex: s, $options: 'i' } },
        { studentPhone: { $regex: s, $options: 'i' } },
      ];
    }

    if (grade) query.grade = grade;
    if (studentType) query.studentType = studentType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('userId', 'email fullName')
      .populate('teacher', 'fullName email')
      .populate('courses', 'name grade')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const [totalCount, regularCount, distanceCount, qrCount] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ studentType: 'regular' }),
      Student.countDocuments({ studentType: 'distance' }),
      Student.countDocuments({ qrCode: { $exists: true, $ne: '' } }),
    ]);

    res.json({
      success: true,
      students,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      stats: {
        total: totalCount,
        regular: regularCount,
        distance: distanceCount,
        withQR: qrCount,
      }
    });
  } catch (err) {
    console.error('List students error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Export Students as CSV ----------
router.get('/export', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, grade, studentType } = req.query;
    const query = {};

    if (search && search.trim()) {
      const s = search.trim();
      const userQuery = {
        $or: [
          { fullName: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } }
        ]
      };
      const users = await User.find(userQuery).select('_id');
      const userIds = users.map(u => u._id);

      query.$or = [
        { userId: { $in: userIds } },
        { firstName: { $regex: s, $options: 'i' } },
        { middleName: { $regex: s, $options: 'i' } },
        { lastName: { $regex: s, $options: 'i' } },
        { studentId: { $regex: s, $options: 'i' } },
        { studentPhone: { $regex: s, $options: 'i' } },
      ];
    }

    if (grade) query.grade = grade;
    if (studentType) query.studentType = studentType;

    const students = await Student.find(query)
      .populate('userId', 'email fullName')
      .populate('teacher', 'fullName email')
      .populate('courses', 'name grade')
      .sort({ registrationDate: -1 })
      .lean();

    const csvData = students.map(s => ({
      'School ID': s.studentId || 'N/A',
      'Registration No': s.registrationNumber || '',
      'Student Type': s.studentType || 'regular',
      'Batch': s.batch || '',
      'First Name': s.firstName || '',
      'Middle Name': s.middleName || '',
      'Last Name': s.lastName || '',
      'Age': s.age || '',
      'Gender': s.gender || 'Male',
      'Subcity': s.subcity || '',
      'Woreda': s.woreda || '',
      'Kebele': s.kebele || '',
      'Shift': s.shift === 'night' ? 'የማታ (Night)' : (s.shift === 'weekend' ? 'የቀን (Weekend)' : (s.shift || '')),
      'Education Level': s.educationLevel || '',
      'Profession': s.profession || '',
      'Grade': s.grade || '',
      'Date of Birth': s.dob ? formatEthiopianDate(s.dob) : '',
      'Address': s.address || '',
      'Student Phone': s.studentPhone || '',
      'Email (login)': s.userId?.email || s.email || '',
      'Assigned Teacher': s.teacher?.fullName || '',
      'Teacher Email': s.teacher?.email || '',
      'Courses': s.courses?.map(c => c.name).join('; ') || '',
      'Emergency First Name': s.emergencyFirstName || s.parentName || '',
      'Emergency Middle Name': s.emergencyMiddleName || '',
      'Emergency Last Name': s.emergencyLastName || '',
      'Relationship': s.relationship || 'Father',
      'Emergency Phone': s.emergencyPhone || s.contactPhone || s.parentPhone || '',
      'Emergency Email': s.emergencyEmail || s.contactEmail || s.parentEmail || '',
      'Emergency Address': s.emergencyAddress || s.contactAddress || '',
      'Registration Date': s.registrationDate ? formatEthiopianDate(s.registrationDate) : '',
    }));

    const fields = Object.keys(csvData[0] || {});
    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel renders Amharic characters cleanly
    const utf8Csv = '\uFEFF' + csv;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
    res.status(200).send(utf8Csv);
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
    const studentId = req.params.id;

    console.log('🔵 assign-teacher request', {
      userId: req.user?._id,
      userRole: req.user?.role,
      studentId,
      teacherId,
    });

    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Teacher ID required' });
    }

    if (!mongoose.Types.ObjectId.isValid(teacherId)) {
      return res.status(400).json({ success: false, message: 'Invalid teacher ID format' });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }

    const teacher = await User.findOne({ _id: teacherId, role: 'teacher' });
    if (!teacher) {
      return res.status(400).json({ success: false, message: 'Invalid teacher' });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { teacher: teacherId },
      { new: true }
    ).populate('teacher', 'fullName email');

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, student });
  } catch (err) {
    console.error('assign-teacher error:', err);
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
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      firstName, middleName, lastName, dob, grade, address, studentPhone, contactPhone,
      educationLevel, profession, gender, studentType,
      age, subcity, woreda, kebele, shift,
      emergencyFirstName, emergencyMiddleName, emergencyLastName,
      relationship, emergencyPhone, emergencyEmail, emergencyAddress,
      contactEmail, contactAddress
    } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (firstName !== undefined) student.firstName = firstName;
    if (middleName !== undefined) student.middleName = middleName;
    if (lastName !== undefined) student.lastName = lastName;
    if (dob !== undefined) student.dob = dob;
    if (age !== undefined) student.age = age ? Number(age) : undefined;
    if (subcity !== undefined) student.subcity = subcity;
    if (woreda !== undefined) student.woreda = woreda;
    if (kebele !== undefined) student.kebele = kebele;
    if (shift !== undefined) student.shift = shift;
    if (grade !== undefined) student.grade = grade;
    if (address !== undefined) student.address = address;
    if (educationLevel !== undefined) student.educationLevel = educationLevel;
    if (profession !== undefined) student.profession = profession;
    if (gender !== undefined) student.gender = gender;
    if (studentType !== undefined) student.studentType = studentType;

    const phoneValue = studentPhone || contactPhone;
    if (phoneValue !== undefined) student.studentPhone = phoneValue;

    const ePhone = emergencyPhone || contactPhone || student.emergencyPhone;
    const eEmail = emergencyEmail || contactEmail || student.emergencyEmail;
    const eAddr = emergencyAddress || contactAddress || student.emergencyAddress;
    const eFirst = emergencyFirstName || student.emergencyFirstName;
    const eMiddle = emergencyMiddleName !== undefined ? emergencyMiddleName : student.emergencyMiddleName;
    const eLast = emergencyLastName !== undefined ? emergencyLastName : student.emergencyLastName;
    const eRel = relationship || student.relationship;

    if (emergencyFirstName !== undefined) student.emergencyFirstName = emergencyFirstName;
    if (emergencyMiddleName !== undefined) student.emergencyMiddleName = emergencyMiddleName;
    if (emergencyLastName !== undefined) student.emergencyLastName = emergencyLastName;
    if (relationship !== undefined) student.relationship = relationship;
    if (emergencyPhone !== undefined) student.emergencyPhone = emergencyPhone;
    if (emergencyEmail !== undefined) student.emergencyEmail = emergencyEmail;
    if (emergencyAddress !== undefined) student.emergencyAddress = emergencyAddress;

    student.parentName = eFirst;
    student.parentPhone = ePhone;
    student.parentEmail = eEmail;
    student.contactPhone = ePhone;
    student.contactEmail = eEmail;
    student.contactAddress = eAddr;

    await student.save();

    if (firstName || middleName || lastName) {
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