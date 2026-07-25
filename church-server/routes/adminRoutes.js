// // routes/adminRoutes.js
// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const Student = require('../models/Student');
// const Course = require('../models/Course');
// const Attendance = require('../models/Attendance');  // <-- ADDED
// const { AdminPanelData } = require('../models/PanelData');
// const { protect, authorize } = require('../middleware/auth');
// const bcrypt = require('bcryptjs');
// const { Parser } = require('json2csv');
// const mongoose = require('mongoose');
// const qrcode = require('qrcode');
// const crypto = require('crypto');  // <-- ADDED

// // All routes below require a valid token and admin role
// router.use(protect);
// router.use(authorize('admin'));

// // ---------- Stats ----------
// router.get('/stats', async (req, res) => {
//   try {
//     const totalUsers = await User.countDocuments();
//     const totalStudents = await Student.countDocuments();
//     const pendingCount = await User.countDocuments({ status: 'pending' });
//     res.json({ totalUsers, totalStudents, pendingCount });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- All Users ----------
// router.get('/users', async (req, res) => {
//   try {
//     const users = await User.find().select('-password').sort({ createdAt: -1 });
//     res.json(users);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- Pending Approvals ----------
// router.get('/pending-approvals', async (req, res) => {
//   try {
//     const pending = await User.find({ status: 'pending' }).select('-password');
//     res.json(pending);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- Approve a User ----------
// router.put('/users/:id/approve', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });
//     user.status = 'approved';
//     await user.save();
//     res.json({ success: true, message: 'User approved successfully' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ---------- Reject a User ----------
// router.put('/users/:id/reject', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });
//     user.status = 'rejected';
//     await user.save();
//     res.json({ success: true, message: 'User rejected' });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// });

// // ---------- Admin Panel Data ----------
// router.get('/panel-data', async (req, res) => {
//   try {
//     let panelData = await AdminPanelData.findOne();
//     if (!panelData) {
//       panelData = await AdminPanelData.create({});
//     }
//     res.json({ data: panelData.toObject() });
//   } catch (err) {
//     res.status(500).json({ message: err.message || 'Server error' });
//   }
// });

// router.put('/panel-data', async (req, res) => {
//   try {
//     const payload = req.body || {};
//     let panelData = await AdminPanelData.findOne();
//     if (!panelData) {
//       panelData = new AdminPanelData(payload);
//     } else {
//       Object.assign(panelData, payload);
//     }
//     await panelData.save();
//     res.json({ data: panelData.toObject() });
//   } catch (err) {
//     res.status(500).json({ message: err.message || 'Server error' });
//   }
// });

// // ---------- Create Student (User + Student document) ----------
// router.post('/students', async (req, res) => {
//   try {
//     const {
//       firstName,
//       middleName,
//       lastName,
//       dob,
//       grade,
//       address,
//       contactPhone,

//       email,
//       password,

//       emergencyFirstName,
//       emergencyMiddleName,
//       emergencyLastName,
//       relationship,
//       emergencyPhone,
//       emergencyEmail,
//       emergencyAddress,
//     } = req.body;

//     if (!firstName || !lastName || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'First name, last name, email, and password are required.',
//       });
//     }

//     const existingUser = await User.findOne({ email: email.toLowerCase() });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'A user with this email already exists.',
//       });
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
//     res.status(500).json({
//       success: false,
//       message: 'Server error while creating student.',
//     });
//   }
// });

// // ---------- List all teachers (for dropdown) ----------
// router.get('/teachers', async (req, res) => {
//   try {
//     const teachers = await User.find({ role: 'teacher', status: 'approved' })
//       .select('fullName email');
//     res.json(teachers);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- List all courses (for dropdown) ----------
// router.get('/courses', async (req, res) => {
//   try {
//     const courses = await Course.find().sort({ name: 1 });
//     res.json(courses);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- List students with search, filter, and pagination ----------
// router.get('/students', async (req, res) => {
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

//     if (grade) {
//       query.grade = grade;
//     }

//     const skip = (parseInt(page) - 1) * parseInt(limit);
//     const total = await Student.countDocuments(query);
//     const students = await Student.find(query)
//       .populate('userId', 'email fullName')
//       .populate('teacher', 'fullName email')
//       .populate('courses', 'name grade')
//       .sort({ registrationDate: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     res.json({
//       students,
//       total,
//       page: parseInt(page),
//       totalPages: Math.ceil(total / parseInt(limit))
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- Export Students as CSV ----------
// router.get('/students/export', async (req, res) => {
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

//     if (grade) {
//       query.grade = grade;
//     }

//     const students = await Student.find(query)
//       .populate('userId', 'email fullName')
//       .populate('teacher', 'fullName email')
//       .populate('courses', 'name grade')
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

// // ---------- Assign teacher to student ----------
// router.put('/students/:id/assign-teacher', async (req, res) => {
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
// router.put('/students/:id/assign-courses', async (req, res) => {
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
// router.put('/students/:id/add-course', async (req, res) => {
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

// // ---------- Course Management ----------

// router.post('/courses', async (req, res) => {
//   try {
//     const courseData = { ...req.body };

//     if (!courseData.teacher || courseData.teacher === '') {
//       delete courseData.teacher;
//     }
//     if (!courseData.prerequisiteCourse || courseData.prerequisiteCourse === '' || !mongoose.Types.ObjectId.isValid(courseData.prerequisiteCourse)) {
//       courseData.prerequisiteCourse = null;
//     }

//     if (typeof courseData.bibleBooks === 'string') {
//       courseData.bibleBooks = courseData.bibleBooks.split(',').map(s => s.trim());
//     }
//     if (typeof courseData.requiredMaterials === 'string') {
//       courseData.requiredMaterials = courseData.requiredMaterials.split(',').map(s => s.trim());
//     }

//     const course = await Course.create(courseData);
//     res.status(201).json(course);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get('/courses', async (req, res) => {
//   try {
//     const { status, ageGroup, search } = req.query;
//     const query = {};

//     if (status) query.status = status;
//     if (ageGroup) query.ageGroup = ageGroup;
//     if (search) {
//       query.$or = [
//         { name: { $regex: search, $options: 'i' } },
//         { department: { $regex: search, $options: 'i' } },
//         { bibleTheme: { $regex: search, $options: 'i' } },
//       ];
//     }

//     const courses = await Course.find(query)
//       .populate('teacher', 'fullName email')
//       .populate('prerequisiteCourse', 'name')
//       .sort({ createdAt: -1 });

//     res.json(courses);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get('/courses/:id', async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.id)
//       .populate('teacher', 'fullName email')
//       .populate('prerequisiteCourse', 'name');
//     if (!course) return res.status(404).json({ message: 'Course not found' });
//     res.json(course);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.put('/courses/:id', async (req, res) => {
//   try {
//     const updates = { ...req.body };

//     if (updates.teacher === '') {
//       delete updates.teacher;
//     }
//     if (updates.prerequisiteCourse === '' || !mongoose.Types.ObjectId.isValid(updates.prerequisiteCourse || '')) {
//       updates.prerequisiteCourse = null;
//     }

//     if (typeof updates.bibleBooks === 'string') {
//       updates.bibleBooks = updates.bibleBooks.split(',').map(s => s.trim());
//     }
//     if (typeof updates.requiredMaterials === 'string') {
//       updates.requiredMaterials = updates.requiredMaterials.split(',').map(s => s.trim());
//     }

//     const course = await Course.findByIdAndUpdate(req.params.id, updates, {
//       new: true,
//       runValidators: true,
//     })
//       .populate('teacher', 'fullName email')
//       .populate('prerequisiteCourse', 'name');

//     if (!course) return res.status(404).json({ message: 'Course not found' });
//     res.json(course);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// router.delete('/courses/:id', async (req, res) => {
//   try {
//     const course = await Course.findByIdAndDelete(req.params.id);
//     if (!course) return res.status(404).json({ message: 'Course not found' });
//     res.json({ success: true, message: 'Course deleted' });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- QR Code Generation ----------
// router.post('/students/generate-qr', async (req, res) => {
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

// // ---------- Attendance Scanning ----------
// router.post('/attendance/scan', async (req, res) => {
//   try {
//     const { qrCode, courseId } = req.body;
//     if (!qrCode) return res.status(400).json({ message: 'QR code data required' });

//     const student = await Student.findOne({ qrCode });
//     if (!student) return res.status(404).json({ message: 'Invalid QR code. Student not found.' });

//     const today = new Date();
//     today.setHours(0,0,0,0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(tomorrow.getDate() + 1);

//     const alreadyMarked = await Attendance.findOne({
//       student: student._id,
//       date: { $gte: today, $lt: tomorrow },
//       ...(courseId ? { course: courseId } : {}),
//     });
//  if (alreadyMarked) {
//   return res.json({
//     success: true,
//     message: 'Attendance already recorded for today.',
//     student: {
//       id: student._id,
//       name: `${student.firstName} ${student.lastName}`,
//     },
//   });
// }

//     const attendance = await Attendance.create({
//       student: student._id,
//       course: courseId || null,
//       date: new Date(),
//       scannedBy: req.user._id,
//     });

//     res.json({ success: true, message: 'Attendance recorded.', student: { id: student._id, name: `${student.firstName} ${student.lastName}` } });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // ---------- Attendance Reports ----------
// router.get('/attendance/report', async (req, res) => {
//   try {
//     const { startDate, endDate, courseId } = req.query;
//     const query = {};
//     if (startDate && endDate) {
//       query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
//     }
//     if (courseId) query.course = courseId;

//     const attendances = await Attendance.find(query)
//       .populate('student', 'firstName lastName grade')
//       .populate('course', 'name')
//       .sort({ date: -1 });

//     res.json(attendances);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// // ---------- REPORTS ----------

// // GET /api/admin/reports/student/:studentId
// router.get('/reports/student/:studentId', async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.studentId)
//       .populate('userId', 'email')
//       .populate('courses', 'name')
//       .lean();
//     if (!student) return res.status(404).json({ message: 'Student not found' });

//     // Attendance history (all records for this student)
//     const history = await Attendance.find({ student: student._id })
//       .populate('course', 'name')
//       .sort({ date: -1 })
//       .lean();

//     // Per‑course summary: total sessions (distinct dates) vs attended count
//     const courseSummaries = [];
//     for (const course of student.courses) {
//       const totalSessions = (await Attendance.distinct('date', { course: course._id })).length;
//       const attended = await Attendance.countDocuments({
//         student: student._id,
//         course: course._id,
//       });
//       courseSummaries.push({
//         courseId: course._id,
//         courseName: course.name,
//         totalSessions,
//         attended,
//         missed: totalSessions - attended,
//       });
//     }

//     res.json({
//       student: {
//         _id: student._id,
//         fullName: `${student.firstName} ${student.lastName}`,
//         grade: student.grade,
//         email: student.userId?.email,
//       },
//       courseSummaries,
//       attendanceHistory: history.map(r => ({
//         _id: r._id,
//         date: r.date,
//         courseName: r.course?.name || 'General',
//       })),
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// // GET /api/admin/reports/grade/:grade
// router.get('/reports/grade/:grade', async (req, res) => {
//   try {
//     const grade = req.params.grade;
//     const students = await Student.find({ grade }).populate('courses', 'name').lean();

//     const result = [];
//     for (const student of students) {
//       const courseBreakdown = [];
//       let totalAttendedOverall = 0;
//       let totalSessionsOverall = 0;

//       for (const course of student.courses) {
//         const totalSessions = (await Attendance.distinct('date', { course: course._id })).length;
//         const attended = await Attendance.countDocuments({
//           student: student._id,
//           course: course._id,
//         });
//         courseBreakdown.push({
//           courseName: course.name,
//           attended,
//           totalSessions,
//         });
//         totalAttendedOverall += attended;
//         totalSessionsOverall += totalSessions;
//       }

//       result.push({
//         studentId: student._id,
//         studentName: `${student.firstName} ${student.lastName}`,
//         courses: courseBreakdown,
//         overallAttended: totalAttendedOverall,
//         overallSessions: totalSessionsOverall,
//       });
//     }

//     res.json({ grade, students: result });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/admin/reports/course/:courseId
// router.get('/reports/course/:courseId', async (req, res) => {
//   try {
//     const course = await Course.findById(req.params.courseId).populate('teacher', 'fullName').lean();
//     if (!course) return res.status(404).json({ message: 'Course not found' });

//     // Students enrolled in this course
//     const students = await Student.find({ courses: course._id }).lean();
//     const totalSessions = (await Attendance.distinct('date', { course: course._id })).length;

//     const studentSummaries = [];
//     for (const student of students) {
//       const attended = await Attendance.countDocuments({
//         student: student._id,
//         course: course._id,
//       });
//       studentSummaries.push({
//         studentId: student._id,
//         studentName: `${student.firstName} ${student.lastName}`,
//         attended,
//         totalSessions,
//       });
//     }

//     res.json({
//       course: { _id: course._id, name: course.name, teacherName: course.teacher?.fullName },
//       totalSessions,
//       students: studentSummaries,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/admin/reports/teacher/:teacherId
// router.get('/reports/teacher/:teacherId', async (req, res) => {
//   try {
//     const teacher = await User.findById(req.params.teacherId).lean();
//     if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

//     const courses = await Course.find({ teacher: teacher._id }).lean();
//     const coursesData = [];

//     for (const course of courses) {
//       const students = await Student.find({ courses: course._id }).lean();
//       const totalSessions = (await Attendance.distinct('date', { course: course._id })).length;
//       const studentSummaries = [];
//       for (const student of students) {
//         const attended = await Attendance.countDocuments({
//           student: student._id,
//           course: course._id,
//         });
//         studentSummaries.push({
//           studentId: student._id,
//           studentName: `${student.firstName} ${student.lastName}`,
//           attended,
//           totalSessions,
//         });
//       }
//       coursesData.push({
//         courseId: course._id,
//         courseName: course.name,
//         totalSessions,
//         students: studentSummaries,
//       });
//     }

//     res.json({
//       teacher: { _id: teacher._id, fullName: teacher.fullName, email: teacher.email },
//       courses: coursesData,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // GET /api/admin/reports/date?date=YYYY-MM-DD
// router.get('/reports/date', async (req, res) => {
//   try {
//     const { date } = req.query;
//     if (!date) return res.status(400).json({ message: 'date query parameter is required (YYYY-MM-DD)' });

//     const startOfDay = new Date(date);
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date(date);
//     endOfDay.setHours(23, 59, 59, 999);

//     const records = await Attendance.find({
//       date: { $gte: startOfDay, $lte: endOfDay }
//     })
//       .populate('student', 'firstName lastName grade')
//       .populate('course', 'name')
//       .sort({ date: 1 })
//       .lean();

//     const result = records.map(r => ({
//       _id: r._id,
//       time: r.date,
//       studentName: `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim(),
//       courseName: r.course?.name || 'General',
//       grade: r.student?.grade || '',
//     }));

//     res.json({ date, records: result });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;

// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Import sub‑routers
const studentRoutes = require('./admin/studentRoutes');
const courseRoutes = require('./admin/courseRoutes');
const attendanceRoutes = require('./admin/attendanceRoutes');
const reportRoutes = require('./admin/reportRoutes');
const userRoutes = require('./admin/userRoutes');

// Apply admin protection to all routes below
router.use(protect);
router.use(authorize('admin'));

const registrationRoutes = require('./admin/registrationRoutes');
router.use('/registrations', registrationRoutes);

// Mount sub‑routers – paths are relative to /api/admin
router.use('/students', studentRoutes);      // /api/admin/students/...
router.use('/courses', courseRoutes);        // /api/admin/courses/...
router.use('/attendance', attendanceRoutes); // /api/admin/attendance/...
router.use('/reports', reportRoutes);        // /api/admin/reports/...
router.use('/', userRoutes);                 // /api/admin/stats, /api/admin/users, etc.

// ⏳ Temporary route – remove after execution
router.post('/cleanup-attendance', async (req, res) => {
  try {
    const Attendance = require('../models/Attendance');
    const duplicates = await Attendance.aggregate([
      {
        $group: {
          _id: { student: '$student', date: '$date', course: '$course' },
          ids: { $push: '$_id' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    let totalRemoved = 0;
    for (const group of duplicates) {
      const [keep, ...remove] = group.ids;
      await Attendance.deleteMany({ _id: { $in: remove } });
      totalRemoved += remove.length;
    }

    res.json({ success: true, removed: totalRemoved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
module.exports = router;