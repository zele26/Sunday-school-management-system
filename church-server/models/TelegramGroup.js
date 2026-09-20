const mongoose = require('mongoose');

const telegramGroupSchema = new mongoose.Schema(
  {
    chatId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      default: 'Unnamed Telegram Group',
    },
    type: {
      type: String,
      enum: ['group', 'supergroup', 'channel'],
      default: 'group',
    },
    assignedGrade: {
      type: String,
      default: 'All Classes', // e.g. 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'All Classes', 'Distance'
      index: true,
    },
    shift: {
      type: String,
      enum: ['all', 'weekend', 'night', 'day'],
      default: 'all',
    },
    studentType: {
      type: String,
      enum: ['all', 'regular', 'distance'],
      default: 'all',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: '',
    },
    lastMessageSentAt: {
      type: Date,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    linkedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.TelegramGroup || mongoose.model('TelegramGroup', telegramGroupSchema);
