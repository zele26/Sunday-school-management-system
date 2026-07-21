// fixAdminStatus.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const DB_URI = process.env.MONGO_URI || 'your_mongodb_connection_string';

mongoose.connect(DB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const result = await User.updateMany(
      { role: 'admin' },
      { $set: { status: 'approved' } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} admin user(s) to status "approved".`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });