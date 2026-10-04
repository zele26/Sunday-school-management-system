require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testPasswords() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'church_db_dev';
  await mongoose.connect(uri, { dbName });

  const users = await mongoose.connection.collection('users').find({}).toArray();
  for (const u of users) {
    const is123456 = u.password ? await bcrypt.compare('123456', u.password) : false;
    const isPassword123 = u.password ? await bcrypt.compare('password123', u.password) : false;
    const isAdmin123 = u.password ? await bcrypt.compare('admin123', u.password) : false;
    const isTest123 = u.password ? await bcrypt.compare('test123', u.password) : false;
    console.log({
      id: u._id,
      name: u.fullName,
      email: u.email,
      phone: u.phone,
      role: u.role,
      passwordMatches_123456: is123456,
      passwordMatches_password123: isPassword123,
      passwordMatches_admin123: isAdmin123,
      passwordMatches_test123: isTest123,
    });
  }

  await mongoose.disconnect();
}

testPasswords().catch(console.error);
