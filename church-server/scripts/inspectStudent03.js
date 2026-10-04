require('dotenv').config();
const mongoose = require('mongoose');

async function inspectStudent03() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'church_db_dev';
  await mongoose.connect(uri, { dbName });

  const students = await mongoose.connection.collection('students').find({
    $or: [
      { phone: '0911000003' },
      { studentPhone: '0911000003' },
      { studentId: 'TKR-2019-0004' }
    ]
  }).toArray();
  console.log('--- STUDENT IN DB ---:', JSON.stringify(students, null, 2));

  const users = await mongoose.connection.collection('users').find({
    $or: [
      { phone: '0911000003' },
      { phoneNumber: '0911000003' },
      { username: '0911000003' },
      { email: '0911000003' }
    ]
  }).toArray();
  console.log('--- USER IN DB ---:', JSON.stringify(users, null, 2));

  await mongoose.disconnect();
}

inspectStudent03().catch(console.error);
