const mongoose = require('mongoose');
require('dotenv').config();

async function testIsolation() {
  const uri = process.env.MONGO_URI;

  // 1. Fetch current prod record
  const prodConn = await mongoose.createConnection(uri, { dbName: 'church_db' }).asPromise();
  const prodBefore = await prodConn.collection('systemsettings').findOne({ key: 'registration' });
  console.log('📌 Production BEFORE Dev Mutation:', {
    db: 'church_db',
    academicYear: prodBefore.academicYear,
    isRegistrationOpen: prodBefore.isRegistrationOpen,
    updatedAt: prodBefore.updatedAt,
  });

  // 2. Modify dev database
  const devConn = await mongoose.createConnection(uri, { dbName: 'church_db_dev' }).asPromise();
  const timestamp = new Date().toISOString();
  await devConn.collection('systemsettings').updateOne(
    { key: 'registration' },
    { $set: { academicYear: `2017 ዓ.ም (Dev Isolated ${timestamp})`, updatedAt: new Date() } }
  );
  const devAfter = await devConn.collection('systemsettings').findOne({ key: 'registration' });
  console.log('📌 Development AFTER Dev Mutation:', {
    db: 'church_db_dev',
    academicYear: devAfter.academicYear,
    updatedAt: devAfter.updatedAt,
  });

  // 3. Verify production database was NOT modified
  const prodAfter = await prodConn.collection('systemsettings').findOne({ key: 'registration' });
  console.log('📌 Production AFTER Dev Mutation:', {
    db: 'church_db',
    academicYear: prodAfter.academicYear,
    isRegistrationOpen: prodAfter.isRegistrationOpen,
    updatedAt: prodAfter.updatedAt,
  });

  const isProdUntouched =
    prodBefore.updatedAt.getTime() === prodAfter.updatedAt.getTime() &&
    prodAfter.academicYear === prodBefore.academicYear;

  if (isProdUntouched) {
    console.log('✅ TEST PASSED: Dev mutation had ZERO effect on Production church_db!');
  } else {
    console.error('❌ TEST FAILED: Production church_db was altered!');
  }

  // Restore dev academicYear to clean 2017 ዓ.ም
  await devConn.collection('systemsettings').updateOne(
    { key: 'registration' },
    { $set: { academicYear: '2017 ዓ.ም' } }
  );

  await prodConn.close();
  await devConn.close();
  process.exit(isProdUntouched ? 0 : 1);
}

testIsolation().catch((e) => {
  console.error(e);
  process.exit(1);
});
