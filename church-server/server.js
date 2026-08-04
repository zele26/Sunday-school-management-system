require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDatabase = require('./config/db');

// --- ROUTE IMPORTS ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/admin/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const attendanceRoutes = require('./routes/admin/attendanceRoutes');
const teacherAdminRoutes = require('./routes/admin/teacherRoutes');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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

// --- ROUTE MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/students', studentRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/attendance', attendanceRoutes);

// ✅ Explicit JSON parser for this route
app.use('/api/admin/teachers', express.json({ limit: '50mb' }), teacherAdminRoutes);

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