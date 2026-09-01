const mongoose = require('mongoose');

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
  studentName: { type: String, required: true },
  studentNameAmharic: { type: String },
  studentNumber: { type: String, required: true },
  
  // Academic Program Details
  program: { 
    type: String, 
    default: 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን የርቀት ነገረ መለኮትና የመጽሐፍ ቅዱስ ጥናት መርሃ ግብር' 
  },
  programEnglish: {
    type: String,
    default: 'Ethiopian Orthodox Tewahedo Church Distance Theological & Biblical Studies Program'
  },
  batch: { type: String, required: true },
  academicYear: { type: String, required: true },
  
  // Academic Record Summary
  completedCourses: [{
    courseName: { type: String },
    code: { type: String },
    mark: { type: Number },
    grade: { type: String }
  }],
  averageScore: { type: Number, default: 0 },
  honors: { type: String, default: 'በማዕረግ ተመርቋል (With Distinction)' },
  
  // Dates & Issuance
  issueDateEthiopian: { type: String, required: true },
  issueDateGregorian: { type: Date, default: Date.now },
  
  // Verification Security
  verificationHash: { type: String, required: true },
  qrCodeUrl: { type: String },
  status: { 
    type: String, 
    enum: ['Valid', 'Revoked', 'Pending'], 
    default: 'Valid' 
  },
  
  // Authorized Signatories
  signatories: [{
    title: { type: String, default: 'የሰንበት ት/ቤት ሰብሳቢ' },
    name: { type: String, default: 'ሊቀ ማእምራን' },
    signatureUrl: { type: String }
  }],
  churchSealUrl: { type: String },
}, { timestamps: true });

module.exports = mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
