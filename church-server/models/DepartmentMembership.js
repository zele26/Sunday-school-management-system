const mongoose = require('mongoose');

const departmentMembershipSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  departmentMemberId: { type: String, default: null },   // e.g., studentId or teacherId
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', default: null },
  status: { type: String, enum: ['active', 'inactive', 'pending', 'graduated', 'retired'], default: 'active' },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

// Ensure one person can have multiple memberships in same department with different IDs
departmentMembershipSchema.index({ personId: 1, departmentId: 1, departmentMemberId: 1 });

module.exports = mongoose.models.DepartmentMembership || mongoose.model('DepartmentMembership', departmentMembershipSchema);