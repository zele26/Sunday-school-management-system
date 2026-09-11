require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectToDatabase = require('../config/db');
const User = require('../models/User');

async function seedDevAdmin() {
  try {
    await connectToDatabase();
    console.log(`📌 Checking admin accounts in database: ${process.env.DB_NAME || 'church_db_dev'}...`);

    const existingAdmin = await User.findOne({ role: 'superadmin' });
    if (existingAdmin) {
      console.log(`✅ Admin account already exists: ${existingAdmin.email || existingAdmin.fullName}`);
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123456', salt);

    const newAdmin = await User.create({
      fullName: 'Super Admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'superadmin',
      status: 'approved',
      isApproved: true,
      mustChangePassword: false,
    });

    console.log(`🎉 Created development Super Admin account:`);
    console.log(`   - Email: ${newAdmin.email}`);
    console.log(`   - Password: admin123456`);
    console.log(`   - Role: ${newAdmin.role}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
}

seedDevAdmin();
