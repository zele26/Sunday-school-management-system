const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../../middleware/auth');
const sessionCtrl = require('../../controllers/education/attendanceSessionController');
const Schedule = require('../../models/education/Schedule');

router.get('/', protect, async (req, res, next) => {
  try {
    return sessionCtrl.getSchedules(req, res, next);
  } catch (err) {
    const schedules = await Schedule.find().catch(() => []);
    res.json({ success: true, schedules });
  }
});

router.post('/', protect, authorize('admin', 'superadmin'), sessionCtrl.createSchedule);
router.put('/:id', protect, authorize('admin', 'superadmin'), sessionCtrl.updateSchedule);
router.delete('/:id', protect, authorize('admin', 'superadmin'), sessionCtrl.deleteSchedule);

module.exports = router;