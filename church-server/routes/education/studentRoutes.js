// routes/education/studentRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/auth');
const Student = require('../../models/Student');
const Attendance = require('../../models/education/Attendance');
const Lesson = require('../../models/education/Lesson');
const ExamResult = require('../../models/education/ExamResult');

// All routes require a valid token
router.use(protect);

// Middleware to ensure the user is linked to a Student record
const ensureStudent = async (req, res, next) => {
  try {
    const rawPhone = req.user.phone ? String(req.user.phone).trim() : '';
    const cleanPhoneDigits = rawPhone.replace(/\D/g, '').slice(-9);

    const orConditions = [
      { userId: req.user._id },
    ];

    if (req.user.studentProfileId) {
      orConditions.push({ _id: req.user.studentProfileId });
    }
    if (req.user.email) {
      orConditions.push({ email: req.user.email.toLowerCase() });
    }
    if (rawPhone) {
      orConditions.push({ studentPhone: rawPhone });
      orConditions.push({ contactPhone: rawPhone });
      orConditions.push({ emergencyPhone: rawPhone });
      orConditions.push({ phone: rawPhone });
    }
    if (cleanPhoneDigits && cleanPhoneDigits.length >= 8) {
      const phoneRegex = new RegExp(cleanPhoneDigits + '$');
      orConditions.push({ studentPhone: phoneRegex });
      orConditions.push({ contactPhone: phoneRegex });
      orConditions.push({ emergencyPhone: phoneRegex });
      orConditions.push({ phone: phoneRegex });
    }

    // 1. Try to find student document linked to user ID, phone, email, or studentProfileId
    let student = await Student.findOne({ $or: orConditions });

    // 2. Check student capability
    const isStudentUser =
      req.user.role === 'student' ||
      (Array.isArray(req.user.roles) && req.user.roles.some((r) => r && r.toLowerCase() === 'student')) ||
      Boolean(student) ||
      Boolean(req.user.studentProfileId) ||
      Boolean(req.user.studentId);

    if (!student) {
      if (!isStudentUser) {
        return res.status(403).json({ success: false, message: 'Access denied. Only students can access this resource.' });
      }
      const names = (req.user.fullName || 'Student').trim().split(/\s+/);
      student = await Student.create({
        userId: req.user._id,
        firstName: names[0] || 'Student',
        lastName: names.length > 1 ? names.slice(1).join(' ') : '',
        email: req.user.email ? req.user.email.toLowerCase() : '',
        studentPhone: rawPhone || '',
        contactPhone: rawPhone || '',
        grade: 'Grade 7',
        studentType: 'regular',
      });
      console.log(`✅ Created missing Student document for user ${req.user.email || req.user.phone}`);
    } else if (!student.userId || String(student.userId) !== String(req.user._id)) {
      student.userId = req.user._id;
      await student.save();
    }

    req.student = student;
    next();
  } catch (err) {
    console.error('ensureStudent middleware error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

router.use(ensureStudent);

// ---------- Profile ----------
router.get('/profile', async (req, res) => {
  try {
    const student = await Student.findById(req.student._id)
      .populate('userId', 'email phone fullName role roles')
      .populate({
        path: 'courses',
        populate: { path: 'teacher', select: 'fullName email phone' }
      })
      .populate('teacher', 'fullName email phone');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const studentObj = student.toObject({ virtuals: true });
    if (!studentObj.studentPhone && req.user.phone) studentObj.studentPhone = req.user.phone;
    if (!studentObj.email && req.user.email) studentObj.email = req.user.email;
    if (!studentObj.fullName) {
      studentObj.fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') || req.user.fullName;
    }

    res.json(studentObj);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Update My Profile ----------
router.put('/profile', async (req, res) => {
  try {
    const {
      firstName, middleName, lastName, dob, age,
      subcity, woreda, kebele, shift, address,
      educationLevel, profession, gender,
      emergencyFirstName, emergencyMiddleName, emergencyLastName,
      relationship, emergencyPhone, emergencyEmail, emergencyAddress
    } = req.body;

    const student = await Student.findById(req.student._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (firstName !== undefined) student.firstName = firstName;
    if (middleName !== undefined) student.middleName = middleName;
    if (lastName !== undefined) student.lastName = lastName;
    if (dob !== undefined) student.dob = dob;
    if (age !== undefined) student.age = age ? Number(age) : undefined;
    if (subcity !== undefined) student.subcity = subcity;
    if (woreda !== undefined) student.woreda = woreda;
    if (kebele !== undefined) student.kebele = kebele;
    if (shift !== undefined) student.shift = shift;
    if (address !== undefined) student.address = address;
    if (educationLevel !== undefined) student.educationLevel = educationLevel;
    if (profession !== undefined) student.profession = profession;
    if (gender !== undefined) student.gender = gender;

    if (emergencyFirstName !== undefined) student.emergencyFirstName = emergencyFirstName;
    if (emergencyMiddleName !== undefined) student.emergencyMiddleName = emergencyMiddleName;
    if (emergencyLastName !== undefined) student.emergencyLastName = emergencyLastName;
    if (relationship !== undefined) student.relationship = relationship;
    if (emergencyPhone !== undefined) student.emergencyPhone = emergencyPhone;
    if (emergencyEmail !== undefined) student.emergencyEmail = emergencyEmail;
    if (emergencyAddress !== undefined) student.emergencyAddress = emergencyAddress;

    await student.save();
    res.json({ success: true, message: 'Profile updated successfully', student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- My Attendance ----------
const getStudentAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ student: req.student._id })
      .populate('course', 'name')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

router.get('/attendance', getStudentAttendance);
router.get('/my-attendance', getStudentAttendance);

// ---------- My Courses (enrolled) ----------
const getStudentCourses = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id)
      .populate({
        path: 'courses',
        populate: { path: 'teacher', select: 'fullName email phone' }
      });

    let coursesList = (student?.courses || []).filter(Boolean);

    // If no explicit courses are manually assigned yet, but the student has a grade or studentType,
    // automatically retrieve all active courses for their grade/type
    if (coursesList.length === 0) {
      const EducationCourse = require('../../models/education/Course');
      const orConditions = [];

      if (student?.grade) {
        orConditions.push({ grade: student.grade });
        orConditions.push({ grade: `Grade ${student.grade}` });
      }

      if (student?.studentType) {
        orConditions.push({ studentType: student.studentType });
      }

      if (orConditions.length > 0) {
        const autoCourses = await EducationCourse.find({
          $or: orConditions,
          status: { $regex: /^active$/i }
        })
          .populate('teacher', 'fullName email phone')
          .sort({ createdAt: -1 });

        coursesList = autoCourses;
      }
    }

    res.json(coursesList);
  } catch (err) {
    console.error('Student courses error:', err);
    res.status(500).json({ message: err.message });
  }
};

router.get('/my-courses', getStudentCourses);
router.get('/courses', getStudentCourses);

// ---------- Lessons for my courses ----------
router.get('/lessons', async (req, res) => {
  try {
    const student = await Student.findById(req.student._id).select('courses');
    const courseIds = student?.courses || [];
    const lessons = await Lesson.find({ course: { $in: courseIds } })
      .populate('course', 'name')
      .sort({ course: 1, order: 1 });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ---------- My Exam Results (list) ----------
const getStudentExamResults = async (req, res) => {
  try {
    const results = await ExamResult.find({ student: req.student._id })
      .populate('quiz', 'title')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

router.get('/exam-results', getStudentExamResults);
router.get('/my-exams', getStudentExamResults);
router.get('/results', getStudentExamResults);
router.get('/my-results', getStudentExamResults);

// ---------- Detailed Exam Result ----------
router.get('/exam-results/:resultId', async (req, res) => {
  try {
    const result = await ExamResult.findById(req.params.resultId)
      .populate('quiz', 'title')
      .populate('answers.question', 'text type options correctAnswer points');
    if (!result) return res.status(404).json({ message: 'Result not found' });

    if (result.student.toString() !== req.student._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
