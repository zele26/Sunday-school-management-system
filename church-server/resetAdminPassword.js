// resetAdminPassword.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectToDatabase = require('./config/db');

async function resetAdminPassword() {
  try {
    await connectToDatabase();
    
    const User = require('./models/User');
    
    // Find admin user
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }
    
    console.log('✅ Found admin user:', admin.email);
    console.log('👤 Name:', admin.fullName);
    console.log('📋 Role:', admin.role);
    console.log('✅ Status:', admin.status);
    console.log('📋 Current hashed password:', admin.password);
    
    // Set new password - using 'admin123' (lowercase as you tested)
    const plainPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    // Update the password
    admin.password = hashedPassword;
    await admin.save();
    
    console.log('\n✅ Password reset successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 New Password:', plainPassword);
    console.log('🔐 New Hashed Password:', hashedPassword);
    
    // Verify the hash works
    const isMatch = await bcrypt.compare(plainPassword, admin.password);
    console.log('✅ Password verification:', isMatch ? 'SUCCESS ✅' : 'FAILED ❌');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetAdminPassword();