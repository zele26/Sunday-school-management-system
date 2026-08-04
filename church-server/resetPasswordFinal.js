// resetPasswordFinal.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectToDatabase = require('./config/db');

async function resetPasswordFinal() {
  try {
    await connectToDatabase();
    
    const User = require('./models/User');
    
    // Find admin with password field included
    const admin = await User.findOne({ email: 'admin@example.com' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin not found');
      process.exit(1);
    }
    
    console.log('✅ Found admin:', admin.email);
    console.log('📋 Status:', admin.status);
    console.log('📋 Role:', admin.role);
    
    // Set password to 'admin123'
    const plainPassword = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    
    admin.password = hashedPassword;
    admin.status = 'approved';
    await admin.save();
    
    console.log('\n✅ Password reset successful!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password:', plainPassword);
    console.log('✅ Status:', admin.status);
    
    // Verify
    const updated = await User.findOne({ email: 'admin@example.com' }).select('+password');
    const isMatch = await bcrypt.compare(plainPassword, updated.password);
    console.log('✅ Verification:', isMatch ? 'SUCCESS ✅' : 'FAILED ❌');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetPasswordFinal();