const mongoose = require('mongoose');

// Sub-schema for Completed Courses on Certificate
const completedCourseSubSchema = new mongoose.Schema({
  courseName: { type: String, trim: true },
  code: { type: String, trim: true },
  mark: { type: Number, min: 0, max: 100 },
  grade: { type: String, trim: true },
}, { _id: false });

// Sub-schema for Authorized Signatories
const signatorySubSchema = new mongoose.Schema({
  title: { type: String, default: 'የሰንበት ት/ቤት ሰብሳቢ', trim: true },
  name: { type: String, default: 'ሊቀ ማእምራን', trim: true },
  signatureUrl: { type: String, trim: true },
}, { _id: false });

const certificateSchema = new mongoose.Schema({
  certificateNumber: { 
    type: String, 
    unique: true, 
    required: true, 
    trim: true,
    index: true 
  },
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  studentName: { type: String, required: true, trim: true },
  studentNameAmharic: { type: String, trim: true },
  studentNumber: { type: String, required: true, trim: true },
  
  // Academic Program Details
  program: { 
    type: String, 
    default: 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን የርቀት ነገረ መለኮትና የመጽሐፍ ቅዱስ ጥናት መርሃ ግብር',
    trim: true,
  },
  programEnglish: {
    type: String,
    default: 'Ethiopian Orthodox Tewahedo Church Distance Theological & Biblical Studies Program',
    trim: true,
  },
  batch: { type: String, required: true, trim: true },
  academicYear: { type: String, required: true, trim: true },
  
  // Academic Record Summary
  completedCourses: [completedCourseSubSchema],
  averageScore: { type: Number, default: 0, min: 0, max: 100 },
  honors: { type: String, default: 'በማዕረግ ተመርቋል (With Distinction)', trim: true },
  
  // Dates & Issuance
  issueDateEthiopian: { type: String, required: true, trim: true },
  issueDateGregorian: { type: Date, default: Date.now },
  
  // Verification Security
  verificationHash: { type: String, required: true, trim: true },
  qrCodeUrl: { type: String, trim: true },
  status: { 
    type: String, 
    enum: ['Valid', 'Revoked', 'Pending'], 
    default: 'Valid' 
  },
  
  // Authorized Signatories
  signatories: [signatorySubSchema],
  churchSealUrl: { type: String, trim: true },
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

// Security and Verification Indexes
certificateSchema.index({ verificationHash: 1 }, { unique: true });
certificateSchema.index({ studentId: 1, batch: 1 });
certificateSchema.index({ userId: 1 });
certificateSchema.index({ status: 1 });

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
