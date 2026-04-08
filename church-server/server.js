const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*", // This allows your phone to connect
  methods: ["GET", "POST"]
}));
// Use an Environment Variable for security
// 1. Wrap the string in double quotes ""
// 2. Make sure you replaced <db_password> with your actual password
const MONGO_URI = "mongodb+srv://zelalemfiseha26_db_user:zolazola@workconnect.pj2hwsn.mongodb.net/church_db?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to Cloud MongoDB! ✅"))
  .catch(err => console.error("Cloud Connection Error: ❌", err));

//mongoose.connect('mongodb://localhost:27017/churchDB')
 // .then(() => console.log("✅ MongoDB Connected"))
 // .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- THE SCHEMA (Made very flexible to avoid 400 errors) ---
const userSchema = new mongoose.Schema({
  role: { type: String, default: 'student' },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // All other fields are optional Strings
  city: String,
  wereda: String,
  kebele: String,
  phoneNumber: String,
  emergencyPersonName: String,
  emergencyPhone: String,
  emergencyAddress: String,
  registrationDate: { type: Date, default: Date.now }
});

// FIXED: Encrypt password before saving
userSchema.pre('save', async function() {
  // If password isn't changed, don't re-hash it
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    // Notice: We don't need to call 'next()' in modern Mongoose async hooks!
  } catch (err) {
    throw err; 
  }
});

const User = mongoose.model('User', userSchema);

// --- THE SIGNUP ROUTE ---
app.post('/api/auth/signup', async (req, res) => {
  console.log("📥 Received Data:", req.body); // Check your VS Code terminal for this!
  
  try {
    const newUser = new User(req.body);
    await newUser.save();
    console.log("👤 User Saved Successfully!");
    res.status(201).json({ message: "Success" });
  } catch (err) {
    console.error("🔥 DATABASE ERROR:", err.message); // THIS LINE TELLS US THE TRUTH
    
    // Check for duplicate email
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already registered." });
    }
    
    res.status(400).json({ message: err.message });
  }
});

// --- THE LOGIN ROUTE ---
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

// --- GET USER PROFILE (Protected) ---
app.get('/api/auth/profile', async (req, res) => {
  try {
    // 1. Get the token from the header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    // 2. Verify the token
    const decoded = jwt.verify(token, 'SECRET_KEY');
    
    // 3. Find the user in DB (excluding the password for security)
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
});


// --- NEW ATTENDANCE RECORD SCHEMA ---
const scanSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: String, // Storing name here makes reports faster
  date: { type: String, default: () => new Date().toLocaleDateString() }, // e.g., "4/7/2026"
  time: { type: String, default: () => new Date().toLocaleTimeString() }, // e.g., "09:30:15 AM"
  status: { type: String, default: "Present" }
});

const Scan = mongoose.model('Scan', scanSchema);

// --- API TO RECORD A SCAN ---
app.post('/api/attendance/scan', async (req, res) => {
  try {
    const { studentId } = req.body;
    const student = await User.findById(studentId);
    
    if (!student) return res.status(404).json({ message: "Student not found" });

    const newScan = new Scan({
      studentId: student._id,
      fullName: student.fullName
    });

    await newScan.save();
    res.status(201).json({ message: `መገኘት ተመዝግቧል: ${student.fullName}`, time: newScan.time });
  } catch (err) {
    res.status(500).json({ message: "Scan failed" });
  }
});

// --- API FOR ADMIN/TEACHER TO SEE TODAY'S ATTENDANCE ---
app.get('/api/attendance/today', async (req, res) => {
  const today = new Date().toLocaleDateString();
  const list = await Scan.find({ date: today }).sort({ time: -1 });
  res.json(list);
});

// Render provides a port automatically, or uses 5000 for local testing
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});