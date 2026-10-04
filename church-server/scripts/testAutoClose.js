require('dotenv').config();
const mongoose = require('mongoose');
const { getEthiopianTimeInfo, autoCloseExpiredSessions } = require('../services/sessionAutoCloseService');
const ClassSession = require('../models/education/ClassSession');

async function testAutoClose() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'church_db_dev';
  await mongoose.connect(uri, { dbName });

  const ethTime = getEthiopianTimeInfo();
  console.log('Ethiopian Time Info:', ethTime);

  const sessionsBefore = await ClassSession.find({}).sort({ sessionDate: -1, startTime: 1 });
  console.log('--- SESSIONS BEFORE AUTO-CLOSE ---');
  for (const s of sessionsBefore) {
    console.log({
      id: s._id,
      title: s.title || s.grade,
      date: s.sessionDate,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      stats: s.stats,
    });
  }

  console.log('\nRunning autoCloseExpiredSessions()...');
  await autoCloseExpiredSessions();

  const sessionsAfter = await ClassSession.find({}).sort({ sessionDate: -1, startTime: 1 });
  console.log('\n--- SESSIONS AFTER AUTO-CLOSE ---');
  for (const s of sessionsAfter) {
    console.log({
      id: s._id,
      title: s.title || s.grade,
      date: s.sessionDate,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      stats: s.stats,
    });
  }

  await mongoose.disconnect();
}

testAutoClose().catch(console.error);
