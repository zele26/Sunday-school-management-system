// require('dotenv').config();

// const express = require('express');
// const path = require('path');
// const cors = require('cors');
// const connectToDatabase = require('./config/db');

// // --- ROUTE IMPORTS ---
// const authRoutes = require('./routes/authRoutes');
// const adminRoutes = require('./routes/adminRoutes');
// const studentRoutes = require('./routes/studentRoutes');
// const attendanceRoutes = require('./routes/attendanceRoutes');
// const teacherRoutes = require('./routes/teacherRoutes');

// const app = express();

// // --- MIDDLEWARE ---
// app.use(express.json());

// // Enable CORS for Vercel preview environments, local dev, and production
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
//       callback(null, true);
//     } else {
//       callback(null, true);
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// // --- SERVE FRONTEND SPA ---
// const frontendDistPath = path.join(__dirname, '..', 'church-system', 'dist');
// const frontendIndexPath = path.join(frontendDistPath, 'index.html');

// if (require('fs').existsSync(frontendDistPath)) {
//   app.use(express.static(frontendDistPath));
// }

// app.get('/', (req, res) => {
//   if (require('fs').existsSync(frontendIndexPath)) {
//     return res.sendFile(frontendIndexPath);
//   }
//   res.send('Church Management System API is running.');
// });

// // --- DATABASE CONNECTION ---
// connectToDatabase();

// // --- ROUTE MOUNTING ---
// app.use('/api/auth', authRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/student', studentRoutes);          // Student routes (profile, attendance, courses)
// app.use('/api/teacher', teacherRoutes);          // Teacher routes (my-courses, my-students, attendance)
// app.use('/api/attendance', attendanceRoutes);    // If you have a separate attendance route

// // Health Check Endpoint
// app.get('/api/test', (req, res) => {
//   res.json({ status: "Online", message: "System is working!" });
// });

// // Fallback for serving SPA or API 404s
// app.get(/^(?!\/api).*/, (req, res) => {
//   if (req.path.startsWith('/api/')) {
//     return res.status(404).json({ message: 'API route not found' });
//   }
//   if (require('fs').existsSync(frontendIndexPath)) {
//     return res.sendFile(frontendIndexPath);
//   }
//   res.status(404).send('Frontend build not found. Run the Vite app first.');
// });

// // --- SERVER START ---
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
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
app.use('/api/admin', adminRoutes);        // Admin hub (includes /api/admin/attendance/...)
app.use('/api/student', studentRoutes);    // Student hub (profile, attendance, courses)
app.use('/api/teacher', teacherRoutes);    // Teacher hub (my-courses, my-students, attendance)
// ❌ Removed: app.use('/api/attendance', attendanceRoutes);

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