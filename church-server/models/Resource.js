const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  grade: { type: String },                   // optional grade filter
  resourceType: {
    type: String,
    enum: ['PDF', 'Video', 'YouTube', 'Audio', 'Link', 'Book', 'Image', 'Document', 'Other'],
    required: true,
  },
  fileUrl: { type: String },                 // direct link or cloud URL
  externalLink: { type: String },            // for YouTube or external links
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  visibility: { type: String, enum: ['Published', 'Draft'], default: 'Published' },
  uploadDate: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);