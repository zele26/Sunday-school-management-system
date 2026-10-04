require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function setAdminPassword() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'church_db_dev';
  await mongoose.connect(uri, { dbName });

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('123456', salt);

  // Also support 0911000001 if the user wants it as an alias or new student
  await mongoose.connection.collection('users').updateOne(
    { email: 'admin@test.com' },
    { $set: { password: hash, phone: '0900000000', status: 'approved' } }
  );

  console.log('✅ admin@test.com password set to: 123456');

  // Let's also update or create user for 0911000001 with password 123456 just in case!
  const user01 = await mongoose.connection.collection('users').findOne({ phone: '0911000001' });
  if (!user01) {
    // Also create or alias 0911000001
    await mongoose.connection.collection('users').insertOne({
      fullName: 'ተማሪ ቴስት (0911000001)',
      phone: '0911000001',
      role: 'student',
      roles: ['student'],
      password: hash,
      status: 'approved',
      studentId: 'TKR-2019-0003',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await mongoose.connection.collection('students').insertOne({
      studentId: 'TKR-2019-0003',
      firstName: 'ተማሪ',
      lastName: 'ቴስት',
      phone: '0911000001',
      studentPhone: '0911000001',
      grade: 'Grade 10',
      studentType: 'regular',
      shift: 'weekend',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Created user & student for 0911000001 with password: 123456');
  }

  await mongoose.disconnect();
}

setAdminPassword().catch(console.error);
