// forceApproveAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectToDatabase = require('./config/db');

async function forceApproveAdmin() {
  try {
    await connectToDatabase();
    
    const User = require('./models/User');
    
    // Find admin user by email
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Creating admin user...');
      
      // Create admin with correct enum values
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123456', salt);
      
      const newAdmin = new User({
        fullName: 'System Administrator',
        email: 'admin@example.com',
        password: hashedPassword,
        role: 'admin',
        status: 'approved', // ✅ Use lowercase 'approved'
        isApproved: true,
        approvedAt: new Date(),
        registrationDate: new Date()
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created and approved!');
      console.log('📧 Email: admin@example.com');
      console.log('🔑 Password: Admin123456');
    } else {
      // Update existing admin - USE LOWERCASE
      console.log('✅ Found admin user:', admin.email);
      console.log('📋 Current status:', admin.status);
      
      admin.status = 'approved'; // ✅ Use lowercase 'approved'
      admin.isApproved = true;
      admin.approvedAt = new Date();
      admin.updatedAt = new Date();
      await admin.save();
      
      console.log('✅ Admin approved successfully!');
      console.log('📧 Email:', admin.email);
      console.log('👤 Name:', admin.fullName);
      console.log('📋 Role:', admin.role);
      console.log('✅ New Status:', admin.status);
    }
    
    console.log('\n🔐 You can now login with:');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: Admin123456');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

forceApproveAdmin();