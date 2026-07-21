// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ageGroup: { type: String, enum: ['Children', 'Teens', 'Youth', 'Adults'], default: 'Youth' },
  department: { type: String, trim: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bibleTheme: { type: String, trim: true },
  mainBibleVerse: { type: String, trim: true },
  bibleBooks: [{ type: String, trim: true }],               // array of strings
  lessonDuration: { type: Number },                         // in minutes
  numberOfLessons: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  schedule: { type: String, trim: true },                   // e.g., "Sunday"
  language: { type: String, trim: true },
  learningObjectives: { type: String, trim: true },
  requiredMaterials: [{ type: String, trim: true }],        // array
  courseImage: { type: String, default: '' },               // URL to image
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  certificateAvailable: { type: Boolean, default: false },
  prerequisiteCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);