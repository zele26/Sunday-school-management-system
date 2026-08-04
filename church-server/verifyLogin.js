// verifyLogin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectToDatabase = require('./config/db');

async function verifyLogin() {
  try {
    await connectToDatabase();
    
    const User = require('./models/User');
    
    // Find admin
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('❌ Admin not found');
      process.exit(1);
    }
    
    console.log('✅ Found admin:', admin.email);
    console.log('🔐 Stored hash:', admin.password);
    
    // Test with different passwords
    const passwords = ['admin123', 'Admin123456', 'admin123456', 'Admin123'];
    
    console.log('\n🔍 Testing passwords:');
    for (const pwd of passwords) {
      const isMatch = await bcrypt.compare(pwd, admin.password);
      console.log(`  Password "${pwd}":`, isMatch ? '✅ MATCH' : '❌ NO MATCH');
    }
    
    // Also check if the stored hash is valid
    const isValidFormat = admin.password.startsWith('$2b$') || admin.password.startsWith('$2a$');
    console.log('\n📋 Hash format:', isValidFormat ? '✅ Valid bcrypt' : '❌ Invalid format');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

verifyLogin();