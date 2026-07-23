// removeDuplicateAttendance.js
require('dotenv').config();
const mongoose = require('mongoose');
const Attendance = require('./models/Attendance');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Find all duplicate groups by student + date + course
    const duplicates = await Attendance.aggregate([
      {
        $group: {
          _id: { student: '$student', date: '$date', course: '$course' },
          ids: { $push: '$_id' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    let totalRemoved = 0;
    for (const group of duplicates) {
      // Keep the first document, remove the rest
      const [keep, ...remove] = group.ids;
      await Attendance.deleteMany({ _id: { $in: remove } });
      totalRemoved += remove.length;
    }

    console.log(`Removed ${totalRemoved} duplicate attendance records.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });