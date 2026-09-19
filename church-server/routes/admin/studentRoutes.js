
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
      studentId, batch, registrationNumber, studentType,
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

    if (studentId && studentId.trim()) {
      const existingId = await Student.findOne({ studentId: studentId.trim() });
      if (existingId) {
        return res.status(400).json({ success: false, message: `ተማሪ መለያ (${studentId}) ቀድሞውኑ ተመዝግቧል።` });
      }
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
      studentId: studentId ? studentId.trim() : undefined,
      registrationNumber: registrationNumber ? registrationNumber.trim() : '',
      batch: batch ? batch.trim() : null,
      studentType: studentType || 'regular',
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
      relationship: relationship || 'Father',
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
        studentId: newStudent.studentId,
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
    const { search, grade, studentType, shift, page = 1, limit = 20 } = req.query;
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
    if (shift) query.shift = shift;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .populate('userId', 'email fullName')
      .populate('teacher', 'fullName email phone')
      .populate('teachers', 'fullName email phone')
      .populate({
        path: 'courses',
        select: 'name grade code teacher shift dayOfWeek startTime endTime',
        populate: { path: 'teacher', select: 'fullName email phone' }
      })
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
    const { search, grade, studentType, shift } = req.query;
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
    if (shift) query.shift = shift;

    const students = await Student.find(query)
      .populate('userId', 'email fullName')
      .populate('teacher', 'fullName email')
      .populate('courses', 'name grade')
      .sort({ registrationDate: -1 })
      .lean();

    const fields = [
      'የተማሪ መለያ',
      'የምዝገባ ቁጥር',
      'የተማሪ ዓይነት',
      'ባች / ምድብ',
      'ስም',
      'የአባት ስም',
      'የአያት ስም',
      'ሙሉ ስም',
      'ዕድሜ',
      'ጾታ',
      'ክፍለ ከተማ',
      'ወረዳ',
      'ቀበሌ',
      'ፈረቃ',
      'የትምህርት ደረጃ',
      'የሥራ ዘርፍ / ሙያ',
      'ክፍል',
      'የትውልድ ቀን',
      'አድራሻ',
      'የተማሪ ስልክ ቁጥር',
      'የመግቢያ ኢሜይል',
      'የተመደበ መምህር',
      'የመምህር ኢሜይል',
      'የተመዘገቡ ኮርሶች',
      'የአስቸኳይ ጊዜ ተጠሪ ስም',
      'የአስቸኳይ ጊዜ ተጠሪ የአባት ስም',
      'የአስቸኳይ ጊዜ ተጠሪ የአያት ስም',
      'ዝምድና',
      'የአስቸኳይ ጊዜ ስልክ',
      'የአስቸኳይ ጊዜ ኢሜይል',
      'የአስቸኳይ ጊዜ አድራሻ',
      'የተመዘገበበት ቀን',
    ];

    const getRelationshipAmharic = (rel) => {
      switch (rel) {
        case 'Father': return 'አባት';
        case 'Mother': return 'እናት';
        case 'Brother': return 'ወንድም';
        case 'Sister': return 'እህት';
        case 'Guardian': return 'ሞግዚት / አሳዳጊ';
        case 'Spouse': return 'የትዳር አጋር';
        case 'Relative': return 'ሌላ ዘመድ';
        case 'Other': return 'ሌላ';
        default: return rel || '';
      }
    };

    const getEducationLevelAmharic = (edu) => {
      if (!edu) return '';
      switch (edu) {
        case 'Grade 7': return '7ኛ ክፍል';
        case 'Grade 8': return '8ኛ ክፍል';
        case 'Grade 9': return '9ኛ ክፍል';
        case 'Grade 10': return '10ኛ ክፍል';
        case 'Grade 11': return '11ኛ ክፍል';
        case 'Grade 12': return '12ኛ ክፍል (የሁለተኛ ደረጃ ማጠናቀቂያ)';
        case 'Certificate': return 'ሠርተፊኬት / የሙያ ማረጋገጫ';
        case 'Diploma': return 'ኮሌጅ ዲፕሎማ';
        case 'Degree': return 'የመጀመሪያ ዲግሪ';
        case 'Masters': return 'ሁለተኛ ዲግሪ / ማስተርስ';
        case 'PhD': return 'ዶክትሬት ዲግሪ (PhD)';
        case 'Traditional': return 'የአብነት / የቤተክርስቲያን ትምህርት';
        case 'Below Grade 7': return 'ከ 7ኛ ክፍል በታች / መሠረታዊ ትምህርት';
        case 'Other': return 'ሌላ';
        default: return edu;
      }
    };

    const getProfessionAmharic = (prof) => {
      if (!prof) return '';
      switch (prof) {
        case 'Student': return 'ተማሪ';
        case 'Government Employee': return 'የመንግሥት ሠራተኛ';
        case 'Private Employee': return 'የግል ድርጅት ሠራተኛ';
        case 'NGO Employee': return 'የመንግሥታዊ ያልሆነ ድርጅት (NGO) ሠራተኛ';
        case 'Business / Merchant': return 'የንግድ ሥራ / ነጋዴ';
        case 'Health Professional': return 'የጤና ባለሙያ';
        case 'Teacher / Lecturer': return 'መምህር / አስተማሪ / ሌክቸረር';
        case 'Engineering & Tech': return 'ኢንጂነሪንግ / አይቲ እና ቴክኖሎጂ';
        case 'Accounting & Finance': return 'የሂሳብ፣ ፋይናንስ እና ባንክ ባለሙያ';
        case 'Legal Professional': return 'የሕግ ባለሙያ';
        case 'Agriculture': return 'ግብርና / የእንስሳት እርባታ';
        case 'Construction & Technical': return 'ኮንስትራክሽን እና ቴክኒክ ሙያ';
        case 'Transport & Logistics': return 'የትራንስፖርት እና ሎጂስቲክስ';
        case 'Arts & Journalism': return 'ኪነ-ጥበብ፣ ሚዲያ እና ጋዜጠኝነት';
        case 'Tourism & Hotel': return 'ሆቴል እና ቱሪዝም';
        case 'Daily Laborer': return 'የቀን ሠራተኛ / ጉልበት ሥራ';
        case 'Homemaker': return 'የቤት እመቤት / የቤት አስተዳዳሪ';
        case 'Self Employed': return 'የግል ሥራ / ፍሪላንሰር';
        case 'Church Servant / Clergy': return 'የቤተክርስቲያን አገልጋይ';
        case 'Job Seeker': return 'ሥራ ፈላጊ / በሥራ ላይ ያልተሰማራ';
        case 'Retired': return 'የጡረታ ባለመብት';
        case 'Other': return 'ሌላ የሥራ ዘርፍ';
        default: return prof;
      }
    };

    const csvData = students.map(s => ({
      'የተማሪ መለያ': s.studentId || 'N/A',
      'የምዝገባ ቁጥር': s.registrationNumber || '',
      'የተማሪ ዓይነት': s.studentType === 'distance' ? 'የርቀት' : 'መደበኛ',
      'ባች / ምድብ': s.batch || '',
      'ስም': s.firstName || '',
      'የአባት ስም': s.middleName || '',
      'የአያት ስም': s.lastName || '',
      'ሙሉ ስም': [s.firstName, s.middleName, s.lastName].filter(Boolean).join(' ') || s.fullName || '',
      'ዕድሜ': s.age || '',
      'ጾታ': s.gender === 'Female' ? 'ሴት' : (s.gender === 'Male' ? 'ወንድ' : (s.gender || '')),
      'ክፍለ ከተማ': s.subcity || '',
      'ወረዳ': s.woreda || '',
      'ቀበሌ': s.kebele || '',
      'ፈረቃ': s.shift === 'night' ? 'የማታ' : (s.shift === 'weekend' ? 'የቀን / ሳምንት መጨረሻ' : (s.shift || '')),
      'የትምህርት ደረጃ': getEducationLevelAmharic(s.educationLevel),
      'የሥራ ዘርፍ / ሙያ': getProfessionAmharic(s.profession),
      'ክፍል': s.grade || '',
      'የትውልድ ቀን': s.dob ? formatEthiopianDate(s.dob) : '',
      'አድራሻ': s.address || '',
      'የተማሪ ስልክ ቁጥር': s.studentPhone || '',
      'የመግቢያ ኢሜይል': s.userId?.email || s.email || '',
      'የተመደበ መምህር': s.teacher?.fullName || '',
      'የመምህር ኢሜይል': s.teacher?.email || '',
      'የተመዘገቡ ኮርሶች': s.courses?.map(c => c.name).join('; ') || '',
      'የአስቸኳይ ጊዜ ተጠሪ ስም': s.emergencyFirstName || s.parentName || '',
      'የአስቸኳይ ጊዜ ተጠሪ የአባት ስም': s.emergencyMiddleName || '',
      'የአስቸኳይ ጊዜ ተጠሪ የአያት ስም': s.emergencyLastName || '',
      'ዝምድና': getRelationshipAmharic(s.relationship),
      'የአስቸኳይ ጊዜ ስልክ': s.emergencyPhone || s.contactPhone || s.parentPhone || '',
      'የአስቸኳይ ጊዜ ኢሜይል': s.emergencyEmail || s.contactEmail || s.parentEmail || '',
      'የአስቸኳይ ጊዜ አድራሻ': s.emergencyAddress || s.contactAddress || '',
      'የተመዘገበበት ቀን': s.registrationDate ? formatEthiopianDate(s.registrationDate) : '',
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel renders Amharic characters cleanly
    const utf8Csv = '\uFEFF' + csv;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=students_export.csv');
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
router.put('/:id/assign-teacher', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { teacherId } = req.body;
    const studentId = req.params.id;

    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Teacher ID required' });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: 'Invalid student ID format' });
    }

    let targetUserId = null;

    // 1. Check if teacherId is a User ID
    try {
      const userDoc = await User.findById(teacherId);
      if (userDoc) {
        targetUserId = userDoc._id;
      }
    } catch (e) {}

    // 2. If not, resolve from Teacher document
    if (!targetUserId) {
      const Teacher = require('../../models/Teacher');
      let teacherDoc = null;
      try { teacherDoc = await Teacher.findById(teacherId); } catch (e) {}
      if (!teacherDoc) {
        try { teacherDoc = await Teacher.findOne({ teacherId }); } catch (e) {}
      }
      if (teacherDoc) {
        targetUserId = teacherDoc.userId || teacherDoc._id;
      }
    }

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'መምህር አልተገኘም (Teacher not found)' });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { teacher: targetUserId },
      { new: true }
    ).populate('teacher', 'fullName email phone');

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, student, message: 'መምህር በተሳካ ሁኔታ ተመድቧል' });
  } catch (err) {
    console.error('Assign teacher error:', err);
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

    // Deduplicate course IDs to guarantee no course is assigned twice
    const uniqueCourseIds = [...new Set(courseIds.map(id => id ? String(id) : null).filter(Boolean))];

    const EducationCourse = require('../../models/education/Course');
    const validCourses = await EducationCourse.find({ _id: { $in: uniqueCourseIds } });
    if (validCourses.length !== uniqueCourseIds.length) {
      return res.status(400).json({ success: false, message: 'Some course IDs are invalid' });
    }

    // Automatically derive student teachers list from course-level teachers
    const courseTeacherIds = validCourses
      .map(c => c.teacher ? String(c.teacher) : null)
      .filter(Boolean);
    const uniqueTeacherIds = [...new Set(courseTeacherIds)];

    const updateFields = {
      courses: uniqueCourseIds,
      teachers: uniqueTeacherIds,
    };
    if (uniqueTeacherIds.length > 0) {
      updateFields.teacher = uniqueTeacherIds[0];
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    )
    .populate('userId', 'email fullName')
    .populate('teacher', 'fullName email phone')
    .populate('teachers', 'fullName email phone')
    .populate({
      path: 'courses',
      select: 'name grade code teacher shift dayOfWeek startTime endTime',
      populate: { path: 'teacher', select: 'fullName email phone' }
    });

    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    res.json({ success: true, message: 'Courses assigned successfully', student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Add a single course (optional) ----------
router.put('/:id/add-course', protect, authorize('admin'), async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'Course ID required' });

    const EducationCourse = require('../../models/education/Course');
    const course = await EducationCourse.findById(courseId);
    if (!course) return res.status(400).json({ success: false, message: 'Course not found' });

    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    // Validate duplicate course assignment
    if (student.courses && student.courses.some(c => String(c?._id || c) === String(courseId))) {
      return res.status(400).json({
        success: false,
        message: `ይህ ኮርስ ("${course.name}") ቀድሞውኑ ለተማሪው ተመድቧል (This course is already assigned to the student).`
      });
    }

    student.courses.push(courseId);
    await student.save();

    const populated = await Student.findById(student._id).populate({
      path: 'courses',
      populate: { path: 'teacher', select: 'fullName email' }
    });

    res.json({ success: true, message: 'Course added successfully', student: populated });
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
      studentId, batch, registrationNumber,
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

    if (studentId !== undefined && studentId.trim() && studentId.trim() !== student.studentId) {
      const trimmedId = studentId.trim();
      const existingConflict = await Student.findOne({ studentId: trimmedId, _id: { $ne: student._id } });
      if (existingConflict) {
        return res.status(400).json({ success: false, message: `ተማሪ መለያ (${trimmedId}) ቀድሞውኑ ለሌላ ተማሪ ተመዝግቧል።` });
      }
      student.studentId = trimmedId;
    }

    if (batch !== undefined) student.batch = batch ? batch.trim() : null;
    if (registrationNumber !== undefined) student.registrationNumber = registrationNumber.trim();
    if (firstName !== undefined) student.firstName = firstName.trim();
    if (middleName !== undefined) student.middleName = middleName.trim();
    if (lastName !== undefined) student.lastName = lastName.trim();
    if (dob !== undefined) student.dob = dob;
    if (age !== undefined) student.age = age ? Number(age) : undefined;
    if (subcity !== undefined) student.subcity = subcity;
    if (woreda !== undefined) student.woreda = woreda;
    if (kebele !== undefined) student.kebele = kebele;
    if (shift !== undefined) student.shift = shift;
    if (grade !== undefined) student.grade = grade.trim();
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