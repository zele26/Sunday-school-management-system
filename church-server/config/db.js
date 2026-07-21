const mongoose = require('mongoose');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const connectToDatabase = async () => {
  const MONGO_URI = process.env.MONGO_URI || '';
  try {
    if (!MONGO_URI) {
      console.error('❌ CRITICAL: MONGO_URI environment variable is missing!');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGO_URI, { 
      dbName: 'church_db', // Forced target database
      serverSelectionTimeoutMS: 30000 
    });

    console.log('Connected to MongoDB Atlas successfully! ✅');
    console.log(`📌 Active Database Host: ${mongoose.connection.host}`);
    console.log(`📌 Active Database Name: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('❌ Database connection error to MongoDB Atlas:', err.message);
  }
};

module.exports = connectToDatabase;