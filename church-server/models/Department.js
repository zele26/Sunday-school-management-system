const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  parentDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
}, { timestamps: true });

// Department hierarchy & active query indexes
departmentSchema.index({ status: 1 });
departmentSchema.index({ parentDepartmentId: 1 }, { sparse: true });

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);