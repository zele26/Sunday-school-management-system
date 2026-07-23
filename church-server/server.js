require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');          // <-- NEW
const connectToDatabase = require('./config/db');

// --- ROUTE IMPORTS ---
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
// ❌ Removed: const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cookieParser());                                // <-- NEW

// Enable CORS with credentials support
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from Vercel previews, local dev, and production
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, origin);   // ✅ return the exact origin, required for credentials
    } else {
      // In production you may want to restrict to your exact domain
      callback(null, origin);
    }
  },
  credentials: true,               // <-- NEW: allows cookies to be sent cross‑origin
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
app.use('/api/auth', authRoutes);             // includes login, register, refresh, logout
app.use('/api/admin', adminRoutes);           // admin hub
app.use('/api/student', studentRoutes);       // student hub
app.use('/api/teacher', teacherRoutes);       // teacher hub

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

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));