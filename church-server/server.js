require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const connectToDatabase = require('./config/db');

// --- ROUTE IMPORTS ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const teacherRoutes = require('./routes/teacherRoutes');

const app = express();

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

// --- SERVE FRONTEND SPA ---
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

// --- DATABASE CONNECTION ---
connectToDatabase();

// --- ROUTE MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', studentRoutes);          // Handles /api/register & /api/students
app.use('/api/attendance', attendanceRoutes);

// Health Check Endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: "Online", message: "System is working!" });
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

app.use('/api/teacher', teacherRoutes);
const studentRoutes = require('./routes/studentRoutes');
app.use('/api/student', studentRoutes);

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));