const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  titleAmharic: { type: String, trim: true },
  description: { type: String, default: '' },
  descriptionAmharic: { type: String, default: '' },
  
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'EducationCourse', 
    required: true 
  },
  
  order: { type: Number, default: 1 },
  prerequisiteModuleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Module', 
    default: null 
  },
  isLockedByDefault: { type: Boolean, default: false },
  
  // Mandatory Activity Requirements for Module Completion
  mandatoryActivities: {
    requireAllLessons: { type: Boolean, default: true },
    requireAllVideos: { type: Boolean, default: true },
    minVideoWatchPct: { type: Number, default: 90 }, // Require 90% watch time
    requireAllReadings: { type: Boolean, default: true },
    requireQuizPassing: { type: Boolean, default: true },
    minQuizScorePct: { type: Number, default: 70 }, // Default 70% passing mark
    requireAssignmentSubmission: { type: Boolean, default: false },
  },
  
  status: { 
    type: String, 
    enum: ['Draft', 'Published', 'Archived'], 
    default: 'Published' 
  },
  estimatedHours: { type: Number, default: 2 },
}, { timestamps: true });

module.exports = mongoose.models.Module || mongoose.model('Module', moduleSchema);
