const mongoose = require('mongoose');

// Sub-schema for Syllabus Items
const syllabusItemSubSchema = new mongoose.Schema({
  topic: { type: String, trim: true },
  week: { type: Number, min: 1 },
  description: { type: String, trim: true }
}, { _id: false });

const courseSchema = new mongoose.Schema({
  // Core identifiers
  code: { type: String, unique: true, sparse: true, trim: true },
  name: { type: String, required: true, trim: true },
  nameAmharic: { type: String, trim: true },
  description: { type: String, default: '', trim: true },
  descriptionAmharic: { type: String, default: '', trim: true },

  // Program & Academic linkage
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', default: null },
  studentType: {
    type: String,
    enum: ['regular', 'distance'],
    default: 'regular',
  },
  grade: {
    type: String,
    enum: ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Batch 1', 'Batch 2', 'Batch 3', 'Batch 4'],
    default: undefined,
  },
  semester: {
    type: String,
    enum: ['Semester 1', 'Semester 2', 'First', 'Second', 'Year-round'],
    default: 'Semester 1'
  },
  academicYear: { type: String, default: '2017 ዓ.ም', trim: true },
  ageGroup: { type: String, enum: ['Children', 'Teens', 'Youth', 'Adults'], default: 'Youth' },
  department: { type: String, trim: true },

  // Teacher and Teaching Details
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  instructors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  teacherProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherProfile', default: null },

  // LMS Modules & Structure
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  sequentialProgression: { type: Boolean, default: true },
  order: { type: Number, default: 1, min: 1 },

  // Curriculum, Orthodox Themes & Content
  bibleTheme: { type: String, trim: true },
  mainBibleVerse: { type: String, trim: true },
  bibleBooks: [{ type: String, trim: true }],
  lessonDuration: { type: Number, min: 0 },
  numberOfLessons: { type: Number, min: 0 },
  schedule: { type: String, trim: true },
  dayOfWeek: {
    type: String,
    enum: [
      'Sunday', 'Saturday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday',
      'እሑድ', 'ቅዳሜ', 'ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ',
      'Weekend', 'Everyday', ''
    ],
    default: 'እሑድ',
  },
  startTime: { type: String, trim: true, default: '08:30' },
  endTime: { type: String, trim: true, default: '10:00' },
  shift: {
    type: String,
    enum: ['day', 'night', 'weekend', 'regular', 'distance', 'የቀን', 'የማታ', ''],
    default: 'የቀን',
  },
  language: { type: String, default: 'Amharic', trim: true },
  learningObjectives: { type: String, trim: true },
  learningOutcomes: [{ type: String, trim: true }],
  requiredMaterials: [{ type: String, trim: true }],
  syllabus: [syllabusItemSubSchema],
  courseImage: { type: String, default: '', trim: true },

  // Status and Timeline
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'Active', 'Inactive'], default: 'active' },
  certificateAvailable: { type: Boolean, default: true },
  prerequisiteCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationCourse', default: null },

  // Migration reference
  legacyCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
}, { 
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    },
  },
  toObject: { virtuals: true },
});

// Auto-generate course code if missing
courseSchema.pre('save', function () {
  if (!this.code) {
    this.code = `C-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  }
});

// Indexes for curriculum discovery & course lookups
courseSchema.index({ studentType: 1, status: 1 });
courseSchema.index({ grade: 1, studentType: 1 });
courseSchema.index({ teacher: 1 }, { sparse: true });
courseSchema.index({ programId: 1 }, { sparse: true });
courseSchema.index({ order: 1 });

const EducationCourse = mongoose.models.EducationCourse || mongoose.model('EducationCourse', courseSchema);
if (!mongoose.models.Course) {
  try {
    mongoose.model('Course', courseSchema);
  } catch (e) { }
}

module.exports = EducationCourse;