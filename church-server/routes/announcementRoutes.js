// routes/announcementRoutes.js
const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, hasPermission, authorize } = require('../middleware/auth');

// GET /api/announcements - Public / Authenticated list of announcements
router.get('/', async (req, res) => {
  try {
    const { targetType, grade, limit } = req.query;
    const query = {};

    if (targetType) query.targetType = targetType;
    if (grade) {
      query.$or = [{ targetType: 'all' }, { targetGrade: grade }];
    }

    const limitNum = parseInt(limit, 10) || 20;
    const announcements = await Announcement.find(query)
      .populate('sender', 'fullName role')
      .populate('targetCourse', 'name code')
      .sort({ createdAt: -1 })
      .limit(limitNum);

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/announcements - Admin / Staff create announcement
router.post('/', protect, async (req, res) => {
  try {
    const { title, message, targetType = 'all', targetGrade, targetCourse, priority = 'normal' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      message: message.trim(),
      sender: req.user._id,
      targetType,
      targetGrade: targetGrade || undefined,
      targetCourse: targetCourse || undefined,
      priority,
    });

    await announcement.populate('sender', 'fullName role');

    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
