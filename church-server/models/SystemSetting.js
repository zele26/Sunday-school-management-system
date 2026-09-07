const mongoose = require('mongoose');

const systemSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'registration' },
  // Registration master and stream controls
  isRegistrationOpen: { type: Boolean, default: true },
  isRegularOpen: { type: Boolean, default: true },
  isDistanceOpen: { type: Boolean, default: true },
  academicYear: { type: String, default: '2017 ዓ.ም' },
  regularClosedMessage: {
    type: String,
    default: 'የመደበኛ ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል። ቀጣይ የምዝገባ ጊዜ በቅርቡ ይገለጻል።',
  },
  distanceClosedMessage: {
    type: String,
    default: 'የርቀት ተማሪዎች ምዝገባ ለጊዜው ተዘግቷል። ቀጣይ የምዝገባ ጊዜ በቅርቡ ይገለጻል።',
  },
  generalClosedMessage: {
    type: String,
    default: 'የተማሪዎች ምዝገባ ለጊዜው ተዘግቷል። ቀጣይ የምዝገባ ጊዜ በቅርቡ ይገለጻል።',
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Index for settings lookup
systemSettingSchema.index({ key: 1 });

module.exports = mongoose.models.SystemSetting || mongoose.model('SystemSetting', systemSettingSchema);
