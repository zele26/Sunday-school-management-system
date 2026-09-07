const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'EducationCourse', required: true },
  grade: { type: String },
  resourceType: {
    type: String,
    enum: ['PDF', 'Video', 'YouTube', 'Audio', 'Link', 'Book', 'Image', 'Document', 'Other'],
    required: true,
  },
  fileUrl: { type: String },
  externalLink: { type: String },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Approval workflow
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  rejectionReason: { type: String },
  
  visibility: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
  uploadDate: { type: Date, default: Date.now },
}, { timestamps: true });

// Indexes for resource library and course materials
resourceSchema.index({ course: 1, status: 1, visibility: 1 });
resourceSchema.index({ grade: 1, status: 1 });
resourceSchema.index({ uploadedBy: 1 });

module.exports = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
