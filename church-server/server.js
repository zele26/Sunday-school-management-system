const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST"]
}));

// --- DATABASE CONNECTION ---
const MONGO_URI = "mongodb+srv://zelalemfiseha26_db_user:zolazola@workconnect.pj2hwsn.mongodb.net/church_db?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to Cloud MongoDB! ✅"))
  .catch(err => console.error("Cloud Connection Error: ❌", err));

// --- 1. USER SCHEMA ---
const userSchema = new mongoose.Schema({
  role: { type: String, default: 'student' },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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

// --- 2. STUDENT SCHEMA ---
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

// --- 3. ATTENDANCE SCHEMA ---
const scanSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  fullName: String,
  date: { type: String, default: () => new Date().toLocaleDateString() },
  time: { type: String, default: () => new Date().toLocaleTimeString() },
  status: { type: String, default: "Present" }
});

const Scan = mongoose.model('Scan', scanSchema);

// --- ROUTES ---

// Health Check
app.get('/api/test', (req, res) => {
  res.json({ status: "Online", message: "System is working!" });
});

// Auth
app.post('/api/auth/signup', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: "Success" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, 'SECRET_KEY', { expiresIn: '2h' });
    res.json({ token, user: { name: user.fullName, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Student Registration
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

// Attendance Scan
app.post('/api/attendance/scan', async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const newScan = new Scan({
      studentId: student._id,
      fullName: `${student.firstName} ${student.lastName}`
    });

    await newScan.save();
    res.status(201).json({ message: "Present", time: newScan.time });
  } catch (err) {
    res.status(500).json({ message: "Scan failed" });
  }
});

// FIXED: Added missing route to stop the 404/JSON error
app.get('/api/attendance/today', async (req, res) => {
  try {
    const today = new Date().toLocaleDateString();
    const list = await Scan.find({ date: today }).sort({ time: -1 });
    res.json(list || []); 
  } catch (err) {
    res.status(500).json({ message: "Error fetching attendance" });
  }
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server live on port ${PORT}`);
});