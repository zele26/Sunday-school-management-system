require('dotenv').config();
const mongoose = require('mongoose');

async function inspectUsers() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'church_db_dev';
  await mongoose.connect(uri, { dbName });
  console.log('Connected to DB:', mongoose.connection.name);

  const usersCollection = mongoose.connection.collection('users');
  const allUsers = await usersCollection.find({}, { projection: { password: 0, passwordResetToken: 0 } }).toArray();
  console.log('--- ALL USERS in ' + dbName + ' --- (' + allUsers.length + ' users)');
  for (const u of allUsers) {
    console.log({
      _id: u._id,
      fullName: u.fullName || u.name,
      username: u.username,
      email: u.email,
      phone: u.phone || u.phoneNumber,
      role: u.role,
      roles: u.roles,
      studentId: u.studentId,
      status: u.status,
    });
  }

  // Specifically check for 0911000001
  const targetUser = await usersCollection.findOne({
    $or: [
      { phone: '0911000001' },
      { phoneNumber: '0911000001' },
      { username: '0911000001' },
      { email: '0911000001' },
      { studentId: '0911000001' },
      { phone: '+251911000001' },
    ]
  });
  console.log('\n--- TARGET USER (0911000001) ---:', targetUser);

  // Check students collection as well
  const studentsCollection = mongoose.connection.collection('students');
  const studentCount = await studentsCollection.countDocuments();
  console.log('\n--- TOTAL STUDENTS in ' + dbName + ': ' + studentCount);
  const sampleStudents = await studentsCollection.find({}).limit(5).toArray();
  for (const s of sampleStudents) {
    console.log({
      _id: s._id,
      studentId: s.studentId,
      name: `${s.firstName} ${s.middleName || ''} ${s.lastName || ''}`,
      phone: s.studentPhone || s.phone || s.parentPhone,
      grade: s.grade,
      status: s.status,
    });
  }

  await mongoose.disconnect();
}

inspectUsers().catch(console.error);
