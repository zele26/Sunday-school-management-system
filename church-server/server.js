require('dotenv').config();

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dns = require('dns');

// Force IPv4 lookup first before any connection attempts
dns.setDefaultResultOrder('ipv4first');

const app = express();

// --- GLOBAL VARIABLES ---
let dbAvailable = false;

// --- MIDDLEWARE ---
app.use(express.json());

// Enable CORS for Vercel preview environments, local dev, and production
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const frontendDistPath = path.join(__dirname, '..', 'church-system', 'dist');
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

// --- DATABASE CONNECTION FUNCTION ---
const MONGO_URI = process.env.MONGO_URI || '';

const connectToDatabase = async () => {
  try {
    if (!MONGO_URI) {
      console.error('❌ CRITICAL: MONGO_URI environment variable is missing on Render!');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI, { 
      dbName: 'church_db', // 👈 THIS FORCES ALL OPERATIONS INTO church_db
      serverSelectionTimeoutMS: 30000 
    });

    dbAvailable = true;
    console.log('Connected to MongoDB Atlas successfully! ✅');
    console.log(`📌 Active Database Host: ${mongoose.connection.host}`);
    console.log(`📌 Active Database Name: ${mongoose.connection.name}`); // Will now print 'church_db'

    if (typeof seedAdminUser === 'function') {
      await seedAdminUser();
    }
  } catch (err) {
    dbAvailable = false;
    console.error('❌ Database connection error to MongoDB Atlas:', err.message);
  }
};

// Call database connection
connectToDatabase();

// --- SCHEMAS & MODELS ---

// 1. User Schema (Auth & Logins)
const userSchema = new mongoose.Schema({
  role: { type: String, default: 'student' },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phoneNumber: String,
  city: String,
  wereda: String,
  kebele: String,
  emergencyPersonName: String,
  emergencyPhone: String,
  status: { type: String, default: 'Active' },
  registrationDate: { type: Date, default: Date.now }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    throw err; 
  }
});

const User = mongoose.model('User', userSchema);

// 2. Student Schema (Full Student Profiles)
const studentSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  dob: String,
  address: String,
  grade: String,
  regYear: String,
  emergencyFirstName: String,
  emergencyMiddleName: String,
  emergencyLastName: String,
  relationship: String,
  contactPhone: String,
  contactAddress: String,
  contactEmail: String,
  registrationDate: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// 3. Attendance Scan Schema
const scanSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  fullName: String,
  date: { type: String, default: () => new Date().toLocaleDateString() },
  time: { type: String, default: () => new Date().toLocaleTimeString() },
  status: { type: String, default: "Present" }
});

const Scan = mongoose.model('Scan', scanSchema);

// 4. Panel Aggregation Schemas
const adminPanelDataSchema = new mongoose.Schema({
  users: { type: Array, default: [] },
  approvals: { type: Array, default: [] },
  classes: { type: Array, default: [] },
  courses: { type: Array, default: [] },
  announcements: { type: Array, default: [] },
  resources: { type: Array, default: [] },
  attendance: { type: Array, default: [] },
  complaints: { type: Array, default: [] },
  certificates: { type: Array, default: [] },
  settings: { type: Array, default: [] },
}, { timestamps: true });

const AdminPanelData = mongoose.model('AdminPanelData', adminPanelDataSchema);

const teacherDashboardDataSchema = new mongoose.Schema({
  classes: { type: Array, default: [] },
  lessons: { type: Array, default: [] },
  assignments: { type: Array, default: [] },
  quizzes: { type: Array, default: [] },
  exams: { type: Array, default: [] },
  materials: { type: Array, default: [] },
  announcements: { type: Array, default: [] },
  courses: { type: Array, default: [] },
  grades: { type: Array, default: [] },
}, { timestamps: true });

const TeacherDashboardData = mongoose.model('TeacherDashboardData', teacherDashboardDataSchema);

const studentProfileDataSchema = new mongoose.Schema({
  resources: { type: Array, default: [] },
  quizzes: { type: Array, default: [] },
  grades: { type: Array, default: [] },
  announcements: { type: Array, default: [] },
  complaints: { type: Array, default: [] },
  certificates: { type: Array, default: [] },
  courses: { type: Array, default: [] },
}, { timestamps: true });

const StudentProfileData = mongoose.model('StudentProfileData', studentProfileDataSchema);

// Defaults & Helper Functions
const defaultAdminPanelData = {
  users: [
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'Active', permissions: ['All'] },
    { id: 2, name: 'Teacher A', email: 'teacher@example.com', role: 'teacher', status: 'Active', permissions: ['Attendance', 'Classes'] },
    { id: 3, name: 'Student One', email: 'student@example.com', role: 'student', status: 'Pending', permissions: ['Profile'] },
  ],
  approvals: [
    { id: 1, name: 'Mulugeta Bekele', type: 'Teacher Account', status: 'Pending' },
    { id: 2, name: 'Selam Tadesse', type: 'Student Registration', status: 'Pending' },
  ],
  classes: [
    { id: 1, name: 'Grade 1A', department: 'Primary', year: '2026/27', teacher: 'Teacher A' },
    { id: 2, name: 'Grade 5B', department: 'Middle', year: '2026/27', teacher: 'Teacher B' },
  ],
  courses: [
    {
      id: 1,
      title: 'Mathematics Foundations',
      description: 'Build number sense, arithmetic, and problem solving.',
      objectives: 'Solve word problems and master core operations.',
      grade: 'Grade 1',
      subject: 'Mathematics',
      teacher: 'Teacher A',
      duration: '8 weeks',
      startDate: '2026-07-01',
      endDate: '2026-08-26',
      schedule: 'Monday 10:00',
      status: 'Active',
      maxStudents: 30,
      materials: ['PDF Notes', 'Video Lesson'],
      assignments: ['Week 1 Worksheet'],
      exams: ['Midterm Quiz'],
      prerequisites: 'None',
    },
  ],
  announcements: [{ id: 1, title: 'Term Opening', type: 'Announcement', body: 'School opens on Monday.' }],
  resources: [{ id: 1, title: 'Math Workbook', type: 'PDF', link: '#' }],
  attendance: [
    { id: 1, student: 'Selam Tadesse', status: 'Present', date: '2026-07-19' },
    { id: 2, student: 'Mulugeta Bekele', status: 'Absent', date: '2026-07-19' },
  ],
  complaints: [{ id: 1, title: 'Library access issue', status: 'Open' }],
  certificates: [{ id: 1, name: 'Selam Tadesse', status: 'Ready' }],
  settings: [
    { key: 'Registration Approval', enabled: true },
    { key: 'Teacher Assignment', enabled: true },
    { key: 'Announcements', enabled: true },
  ],
};

const seedAdminUser = async () => {
  try {
    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
      if (existing.role !== 'admin') {
        existing.role = 'admin';
        await existing.save();
        console.log('Updated existing admin user to admin role');
      }
      return;
    }

    const adminUser = new User({
      role: 'admin',
      fullName: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123'
    });

    await adminUser.save();
    console.log('Seeded admin user');
  } catch (err) {
    console.warn('Admin seeding skipped:', err.message);
  }
};

const findUserByEmail = async (email) => {
  if (!dbAvailable) return null;
  const cleanedEmail = (email || '').trim().toLowerCase();
  return User.findOne({ email: cleanedEmail });
};

// --- ROUTES ---

// Health Check
app.get('/api/test', (req, res) => {
  res.json({ status: "Online", message: "System is working!", dbConnected: dbAvailable });
});

// --- AUTHENTICATION ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    if (!dbAvailable) {
      return res.status(503).json({ message: 'Database is not connected to MongoDB Atlas.' });
    }

    const { email, password, fullName } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'ተጠቃሚው ቀደም ብሎ ተመዝግቧል (User email already registered)' });
    }

    const newUser = new User({
      ...req.body,
      email: cleanEmail
    });

    await newUser.save();
    return res.status(201).json({ message: 'Success', user: { fullName: newUser.fullName, email: newUser.email, role: newUser.role } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  try {
    if (!dbAvailable) {
      return res.status(503).json({ message: 'Database is not connected to MongoDB Atlas.' });
    }

    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password || '', user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const secretKey = process.env.JWT_SECRET || 'SECRET_KEY';
    const token = jwt.sign({ id: user._id, role: user.role }, secretKey, { expiresIn: '2h' });

    res.json({
      token,
      user: {
        name: user.fullName,
        role: user.role,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

app.get('/api/auth/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const secretKey = process.env.JWT_SECRET || 'SECRET_KEY';
    const decoded = jwt.verify(token, secretKey);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// --- ADMIN DIRECT ENDPOINTS ---
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const pendingCount = await User.countDocuments({ status: 'Pending' });
    res.json({ totalUsers, totalStudents, pendingCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ registrationDate: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/pending-approvals', async (req, res) => {
  try {
    const pending = await User.find({ status: 'Pending' }).select('-password');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/classes', async (req, res) => {
  try {
    let panelData = await AdminPanelData.findOne();
    res.json(panelData?.classes || defaultAdminPanelData.classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/admin/courses', async (req, res) => {
  try {
    let panelData = await AdminPanelData.findOne();
    res.json(panelData?.courses || defaultAdminPanelData.courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Aggregated Panel Endpoints
app.get('/api/admin/panel-data', async (req, res) => {
  try {
    if (!dbAvailable) {
      return res.status(503).json({ message: 'Database is not available right now.', data: defaultAdminPanelData });
    }

    let panelData = await AdminPanelData.findOne();
    if (!panelData) {
      panelData = await AdminPanelData.create(defaultAdminPanelData);
    }

    res.json({ data: panelData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

app.put('/api/admin/panel-data', async (req, res) => {
  try {
    if (!dbAvailable) {
      return res.status(503).json({ message: 'Database is not available right now.', data: defaultAdminPanelData });
    }

    const payload = req.body || {};
    let panelData = await AdminPanelData.findOne();

    if (!panelData) {
      panelData = new AdminPanelData({ ...defaultAdminPanelData, ...payload });
    } else {
      Object.assign(panelData, payload);
    }

    await panelData.save();
    res.json({ data: panelData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// --- TEACHER & STUDENT PORTAL DATA ROUTES ---
app.get('/api/teacher/dashboard-data', async (req, res) => {
  try {
    if (!dbAvailable) return res.status(503).json({ message: 'Database is not available right now.' });
    let dashboardData = await TeacherDashboardData.findOne();
    if (!dashboardData) dashboardData = await TeacherDashboardData.create({});
    res.json({ data: dashboardData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

app.put('/api/teacher/dashboard-data', async (req, res) => {
  try {
    if (!dbAvailable) return res.status(503).json({ message: 'Database is not available right now.' });
    const payload = req.body || {};
    let dashboardData = await TeacherDashboardData.findOne();
    if (!dashboardData) dashboardData = new TeacherDashboardData(payload);
    else Object.assign(dashboardData, payload);
    await dashboardData.save();
    res.json({ data: dashboardData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

app.get('/api/student/profile-data', async (req, res) => {
  try {
    if (!dbAvailable) return res.status(503).json({ message: 'Database is not available right now.' });
    let profileData = await StudentProfileData.findOne();
    if (!profileData) profileData = await StudentProfileData.create({});
    res.json({ data: profileData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

app.put('/api/student/profile-data', async (req, res) => {
  try {
    if (!dbAvailable) return res.status(503).json({ message: 'Database is not available right now.' });
    const payload = req.body || {};
    let profileData = await StudentProfileData.findOne();
    if (!profileData) profileData = new StudentProfileData(payload);
    else Object.assign(profileData, payload);
    await profileData.save();
    res.json({ data: profileData.toObject() });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
});

// --- STUDENT REGISTRATION FORM ENDPOINTS ---
app.post('/api/register', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    await newStudent.save();
    res.status(201).json({ message: "Student registered successfully!" });
  } catch (err) {
    res.status(400).json({ message: "Error: " + err.message });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ registrationDate: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: "Error fetching students" });
  }
});

// --- ATTENDANCE SCAN ENDPOINTS ---
app.post('/api/attendance/scan', async (req, res) => {
  try {
    const { studentId } = req.body;
    let student = null;
    
    if (mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    }
    if (!student) {
      student = await Student.findOne({ firstName: studentId });
    }
    if (!student) {
      return res.status(404).json({ message: "ተማሪው አልተገኘም (Student not found)" });
    }

    const newScan = new Scan({
      studentId: student._id,
      fullName: `${student.firstName} ${student.lastName}`
    });

    await newScan.save();
    res.status(201).json({ message: `ሰላም ${student.firstName}! ተመዝግቧል`, time: newScan.time });
  } catch (err) {
    console.error("Scan Error:", err);
    res.status(500).json({ message: "የቴክኒክ ስህተት (Scan failed)" });
  }
});

app.get('/api/attendance/today', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString();
    const list = await Scan.find({ date: today }).sort({ time: -1 });
    res.json(list || []); 
  } catch (err) {
    res.status(500).json({ message: "Error fetching attendance" });
  }
});

// Fallback for serving SPA or API 404s
app.get(/^(?!\/api).*/, (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'API route not found' });
  }
  if (require('fs').existsSync(frontendIndexPath)) {
    return res.sendFile(frontendIndexPath);
  }
  res.status(404).send('Frontend build not found. Run the Vite app first.');
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));