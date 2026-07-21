const mongoose = require('mongoose');

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

const studentProfileDataSchema = new mongoose.Schema({
  resources: { type: Array, default: [] },
  quizzes: { type: Array, default: [] },
  grades: { type: Array, default: [] },
  announcements: { type: Array, default: [] },
  complaints: { type: Array, default: [] },
  certificates: { type: Array, default: [] },
  courses: { type: Array, default: [] },
}, { timestamps: true });

module.exports = {
  AdminPanelData: mongoose.model('AdminPanelData', adminPanelDataSchema),
  TeacherDashboardData: mongoose.model('TeacherDashboardData', teacherDashboardDataSchema),
  StudentProfileData: mongoose.model('StudentProfileData', studentProfileDataSchema)
};