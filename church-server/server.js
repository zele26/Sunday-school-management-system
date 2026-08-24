require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const connectToDatabase = require('./config/db');

// --- EXISTING ROUTE IMPORTS ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminStudentRoutes = require('./routes/admin/studentRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const attendanceRoutes = require('./routes/admin/attendanceRoutes');
const teacherAdminRoutes = require('./routes/admin/teacherRoutes');

// --- NEW CORE / EDUCATION / TEMP ROUTES (safe loading) ---
let corePersonRoutes = null;
let coreDepartmentRoutes = null;
let coreDepartmentMembershipRoutes = null;
let churchMembershipRoutes = null;
let eduStudentProfileRoutes = null;
let eduProgramRoutes = null;
let eduAcademicYearRoutes = null;
let eduGradeRoutes = null;
let eduAcademicEnrollmentRoutes = null;
let eduEnrollmentRoutes = null;
let eduStudyModeRoutes = null;
let eduScheduleRoutes = null;
let eduCourseEnrollmentRoutes = null;
let eduCertificateRoutes = null;
let eduProgressionRoutes = null;
let tempMigrationRoutes = null;

try { corePersonRoutes = require('./routes/core/personRoutes'); } catch (e) { console.warn('⚠️ personRoutes not loaded:', e.message); }
try { coreDepartmentRoutes = require('./routes/core/departmentRoutes'); } catch (e) { console.warn('⚠️ departmentRoutes not loaded:', e.message); }
try { coreDepartmentMembershipRoutes = require('./routes/core/departmentMembershipRoutes'); } catch (e) { console.warn('⚠️ departmentMembershipRoutes not loaded:', e.message); }
try { churchMembershipRoutes = require('./routes/core/churchMembershipRoutes'); } catch (e) { console.warn('⚠️ churchMembershipRoutes not loaded:', e.message); }

try { eduStudentProfileRoutes = require('./routes/education/studentProfileRoutes'); } catch (e) { console.warn('⚠️ studentProfileRoutes not loaded:', e.message); }
try { eduProgramRoutes = require('./routes/education/programRoutes'); } catch (e) { console.warn('⚠️ programRoutes not loaded:', e.message); }
try { eduAcademicYearRoutes = require('./routes/education/academicYearRoutes'); } catch (e) { console.warn('⚠️ academicYearRoutes not loaded:', e.message); }
try { eduGradeRoutes = require('./routes/education/gradeRoutes'); } catch (e) { console.warn('⚠️ gradeRoutes not loaded:', e.message); }
try { eduAcademicEnrollmentRoutes = require('./routes/education/academicEnrollmentRoutes'); } catch (e) { console.warn('⚠️ academicEnrollmentRoutes not loaded:', e.message); }
try { eduEnrollmentRoutes = require('./routes/education/enrollmentRoutes'); } catch (e) { console.warn('⚠️ enrollmentRoutes not loaded:', e.message); }
try { eduStudyModeRoutes = require('./routes/education/studyModeRoutes'); } catch (e) { console.warn('⚠️ studyModeRoutes not loaded:', e.message); }
try { eduScheduleRoutes = require('./routes/education/scheduleRoutes'); } catch (e) { console.warn('⚠️ scheduleRoutes not loaded:', e.message); }
try { eduCourseEnrollmentRoutes = require('./routes/education/courseEnrollmentRoutes'); } catch (e) { console.warn('⚠️ courseEnrollmentRoutes not loaded:', e.message); }
try { eduCertificateRoutes = require('./routes/education/certificateRoutes'); } catch (e) { console.warn('⚠️ certificateRoutes not loaded:', e.message); }
try { eduProgressionRoutes = require('./routes/education/progressionRoutes'); } catch (e) { console.warn('⚠️ progressionRoutes not loaded:', e.message); }
try { tempMigrationRoutes = require('./routes/admin/tempMigrationRoutes'); } catch (e) { console.warn('⚠️ tempMigrationRoutes not loaded:', e.message); }

const app = express();

// --- CORS CONFIGURATION ---
const allowedOrigins = [
  'https://sunday-school-management-system-u68.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://church-api-3l2c.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

// --- MIDDLEWARE ---
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// --- SERVE FRONTEND SPA ---
const frontendDistPath = path.join(__dirname, 'dist');
const frontendIndexPath = path.join(frontendDistPath, 'index.html');

if (require('fs').existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
}

app.get('/', (req, res) => {
  if (require('fs').existsSync(frontendIndexPath)) {
    return res.sendFile(frontendIndexPath);
  }
  res.send('Church Management System API is running.');
});

// --- TEST ENDPOINT ---
app.post('/api/test-body', (req, res) => {
  console.log('🔵 [TEST] req.body:', req.body);
  res.json({ received: req.body, contentType: req.headers['content-type'] });
});

// --- ROUTE MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/admin/teachers', teacherAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/students', adminStudentRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/attendance', attendanceRoutes);

// Core routes
if (corePersonRoutes) app.use('/api/core/persons', corePersonRoutes);
if (coreDepartmentRoutes) app.use('/api/core/departments', coreDepartmentRoutes);
if (coreDepartmentMembershipRoutes) app.use('/api/core/department-memberships', coreDepartmentMembershipRoutes);
if (churchMembershipRoutes) app.use('/api/core/church-memberships', churchMembershipRoutes);

// Education module routes
if (eduStudentProfileRoutes) app.use('/api/education/student-profiles', eduStudentProfileRoutes);
if (eduProgramRoutes) app.use('/api/education/programs', eduProgramRoutes);
if (eduAcademicYearRoutes) app.use('/api/education/academic-years', eduAcademicYearRoutes);
if (eduGradeRoutes) app.use('/api/education/grades', eduGradeRoutes);
if (eduAcademicEnrollmentRoutes) app.use('/api/education/academic-enrollments', eduAcademicEnrollmentRoutes);
if (eduEnrollmentRoutes) app.use('/api/education/enroll', eduEnrollmentRoutes);
if (eduStudyModeRoutes) app.use('/api/education/study-modes', eduStudyModeRoutes);
if (eduScheduleRoutes) app.use('/api/education/schedules', eduScheduleRoutes);
if (eduProgressionRoutes) app.use('/api/education', eduProgressionRoutes);
if (eduCourseEnrollmentRoutes) app.use('/api/education', eduCourseEnrollmentRoutes);
if (eduCertificateRoutes) app.use('/api/education', eduCertificateRoutes);

// Temporary migration route (from file, if exists)
if (tempMigrationRoutes) app.use('/api/admin/temp', tempMigrationRoutes);

// Embedded temporary migration endpoint (guaranteed to exist)
app.post('/api/admin/temp/run-full-education-migration', async (req, res) => {
  try {
    // Require models inside to avoid startup failure if missing
    const Student = require('./models/Student');
    const Teacher = require('./models/Teacher');
    const Course = require('./models/Course');
    const Person = require('./models/Person');
    const StudentProfile = require('./models/education/StudentProfile');
    const TeacherProfile = require('./models/education/TeacherProfile');
    const EducationCourse = require('./models/education/Course');
    const AcademicEnrollment = require('./models/education/AcademicEnrollment');
    const CourseEnrollment = require('./models/education/CourseEnrollment');

    // 1. Migrate Teachers
    const teachers = await Teacher.find({});
    const teacherMap = {};
    for (const teacher of teachers) {
      let person = await Person.findOne({
        $or: [
          { phone: teacher.phone || '' },
          { email: teacher.email?.toLowerCase() || '' },
        ],
      });
      if (!person) {
        person = await Person.create({
          firstName: teacher.firstName || '',
          middleName: teacher.middleName || '',
          lastName: teacher.lastName || '',
          gender: teacher.gender || 'Male',
          dateOfBirth: teacher.dateOfBirth || '',
          phone: teacher.phone || '',
          email: teacher.email?.toLowerCase() || '',
          address: teacher.address || '',
        });
      }
      let profile = await TeacherProfile.findOne({ personId: person._id });
      if (!profile) {
        profile = await TeacherProfile.create({
          personId: person._id,
          teacherNumber: teacher.teacherId,
          subject: teacher.subject || '',
          qualification: teacher.qualification || '',
          experience: teacher.experience || '',
          bio: teacher.bio || '',
          status: teacher.isActive === false ? 'inactive' : 'active',
          legacyTeacherId: teacher._id,
        });
      }
      teacherMap[teacher._id.toString()] = profile._id;
    }

    // 2. Migrate Courses
    const legacyCourses = await Course.find({});
    const courseMap = {};
    for (const legacy of legacyCourses) {
      let eduCourse = await EducationCourse.findOne({ legacyCourseId: legacy._id });
      if (!eduCourse) {
        eduCourse = await EducationCourse.create({
          code: legacy.code || `C-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
          name: legacy.name,
          description: legacy.description || '',
          status: 'active',
          legacyCourseId: legacy._id,
        });
      }
      courseMap[legacy._id.toString()] = eduCourse._id;
    }

    // 3. Migrate Students and course enrollments
    const students = await Student.find({}).populate('courses');
    let createdEnrollments = 0;
    for (const student of students) {
      let person = await Person.findOne({
        $or: [
          { phone: student.studentPhone || student.contactPhone || '' },
          { email: student.email || '' },
        ],
      });
      if (!person) continue;

      const profile = await StudentProfile.findOne({ personId: person._id });
      if (!profile) continue;

      const enrollment = await AcademicEnrollment.findOne({
        studentProfileId: profile._id,
        status: { $in: ['active', 'completed'] },
      }).sort({ startDate: -1 });

      if (!enrollment) continue;

      if (student.courses && student.courses.length > 0) {
        for (const legacyCourse of student.courses) {
          const newCourseId = courseMap[legacyCourse._id.toString()];
          if (!newCourseId) continue;

          const existing = await CourseEnrollment.findOne({
            academicEnrollmentId: enrollment._id,
            courseId: newCourseId,
          });
          if (existing) continue;

          let teacherIds = [];
          if (student.teacher) {
            const teacherLegacy = await Teacher.findOne({ userId: student.teacher });
            if (teacherLegacy && teacherMap[teacherLegacy._id.toString()]) {
              teacherIds = [teacherMap[teacherLegacy._id.toString()]];
            }
          }

          await CourseEnrollment.create({
            academicEnrollmentId: enrollment._id,
            courseId: newCourseId,
            teachers: teacherIds,
            teacherId: teacherIds[0] || null,
            status: 'enrolled',
          });
          createdEnrollments++;
        }
      }
    }

    res.json({
      success: true,
      message: 'Full education data migration completed.',
      teachersMigrated: Object.keys(teacherMap).length,
      coursesMigrated: Object.keys(courseMap).length,
      courseEnrollmentsCreated: createdEnrollments,
    });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Health Check
app.get('/api/test', (req, res) => {
  res.json({ status: "Online", message: "System is working!", timestamp: new Date().toISOString() });
});

// Fallback SPA
app.get(/^(?!\/api).*/, (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  if (require('fs').existsSync(frontendIndexPath)) {
    return res.sendFile(frontendIndexPath);
  }
  res.status(404).send('Frontend build not found. Run the Vite app first.');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ success: false, message: 'File too large. Maximum size is 10MB.' });
  if (err.message && err.message.includes('Invalid file type')) return res.status(400).json({ success: false, message: err.message });
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors: messages });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({ success: false, message: `${field} already exists. Please use a different value.` });
  }
  res.status(500).json({ success: false, message: process.env.NODE_ENV === 'production' ? 'An internal server error occurred' : err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectToDatabase();
    console.log('✅ Database connected');
    const User = require('./models/User');
    try { await User.collection.dropIndex('email_1'); } catch (e) {}
    try { await User.collection.dropIndex('phone_1'); } catch (e) {}
    await User.createIndexes();
    console.log('✅ Sparse indexes ensured for User model');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🌐 Health check at http://localhost:${PORT}/api/test`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => console.error('❌ Unhandled Rejection:', err));
process.on('uncaughtException', (err) => { console.error('❌ Uncaught Exception:', err); process.exit(1); });

start();