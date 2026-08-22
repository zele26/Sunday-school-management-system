const mongoose = require('mongoose');

const churchMembershipSchema = new mongoose.Schema({
  personId: { type: mongoose.Schema.Types.ObjectId, ref: 'Person', required: true, unique: true },
  memberId: { type: String, unique: true, sparse: true },   // permanent Church Member ID
  assignedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.models.ChurchMembership || mongoose.model('ChurchMembership', churchMembershipSchema);