const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  ageGroup: { type: String, enum: ['Children', 'Teens', 'Youth', 'Adults'], default: 'Youth' },
  department: { type: String, trim: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  bibleTheme: { type: String, trim: true },
  mainBibleVerse: { type: String, trim: true },
  bibleBooks: [{ type: String, trim: true }],
  lessonDuration: { type: Number },
  numberOfLessons: { type: Number },
  startDate: { type: Date },
  endDate: { type: Date },
  schedule: { type: String, trim: true },
  language: { type: String, trim: true },
  learningObjectives: { type: String, trim: true },
  requiredMaterials: [{ type: String, trim: true }],
  courseImage: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  certificateAvailable: { type: Boolean, default: false },
  prerequisiteCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  createdAt: { type: Date, default: Date.now },
  // NEW FIELDS
  studentType: {
    type: String,
    enum: ['regular', 'distance'],
    required: true,
    default: 'regular',
  },
  grade: {
    type: String,
    enum: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    required: function () {
      return this.studentType === 'regular';   // only required for regular courses
    },
    default: undefined,
  },
});

module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);