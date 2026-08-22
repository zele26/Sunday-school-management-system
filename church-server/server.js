require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); // ✅ Added body-parser
const connectToDatabase = require('./config/db');

// --- ROUTE IMPORTS ---
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

// Core routes (New Architecture)
const corePersonRoutes = require('./routes/core/personRoutes');
const coreDepartmentRoutes = require('./routes/core/departmentRoutes');
const coreDepartmentMembershipRoutes = require('./routes/core/departmentMembershipRoutes');

// Education module routes (New Architecture)
const eduStudentProfileRoutes = require('./routes/education/studentProfileRoutes');
const eduProgramRoutes = require('./routes/education/programRoutes');
const eduAcademicYearRoutes = require('./routes/education/academicYearRoutes');
const eduGradeRoutes = require('./routes/education/gradeRoutes');

const app = express();

// --- MIDDLEWARE ---
app.use(bodyParser.json({ limit: '50mb' })); // ✅ body-parser
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(cors({
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

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

// --- TEST ENDPOINT (to verify body parsing) ---
app.post('/api/test-body', (req, res) => {
  console.log('🔵 [TEST] req.body:', req.body);
  res.json({
    received: req.body,
    contentType: req.headers['content-type']
  });
});

// --- ROUTE MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/admin/teachers', teacherAdminRoutes); // ✅ Mounted before adminRoutes
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

// Health Check
app.get('/api/test', (req, res) => {
  res.json({
    status: "Online",
    message: "System is working!",
    timestamp: new Date().toISOString()
  });
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

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File too large. Maximum size is 10MB.'
    });
  }
  
  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists. Please use a different value.`
    });
  }
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred'
      : err.message
  });
});

app.use('/api/core/persons', corePersonRoutes);
app.use('/api/core/departments', coreDepartmentRoutes);
app.use('/api/core/department-memberships', coreDepartmentMembershipRoutes);



app.use('/api/education/student-profiles', eduStudentProfileRoutes);
app.use('/api/education/programs', eduProgramRoutes);
app.use('/api/education/academic-years', eduAcademicYearRoutes);
app.use('/api/education/grades', eduGradeRoutes);

// --- START SERVER ---
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectToDatabase();
    console.log('✅ Database connected');

    const User = require('./models/User');
    try { await User.collection.dropIndex('email_1'); } catch (e) { /* not exist */ }
    try { await User.collection.dropIndex('phone_1'); } catch (e) { /* not exist */ }
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

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

start();