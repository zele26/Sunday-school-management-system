// const mongoose = require('mongoose');
// const dns = require('dns');

// dns.setDefaultResultOrder('ipv4first');

// const connectToDatabase = async () => {
//   const MONGO_URI = process.env.MONGO_URI || '';
//   try {
//     if (!MONGO_URI) {
//       console.error('❌ CRITICAL: MONGO_URI environment variable is missing!');
//       process.exit(1);
//     }

//     console.log('Connecting to MongoDB Atlas...');
//     await mongoose.connect(MONGO_URI, { 
//       dbName: 'church_db', // Forced target database
//       serverSelectionTimeoutMS: 30000 
//     });

//     console.log('Connected to MongoDB Atlas successfully! ✅');
//     console.log(`📌 Active Database Host: ${mongoose.connection.host}`);
//     console.log(`📌 Active Database Name: ${mongoose.connection.name}`);
//   } catch (err) {
//     console.error('❌ Database connection error to MongoDB Atlas:', err.message);
//   }
// };

// module.exports = connectToDatabase;




const mongoose = require('mongoose');
const dns = require('dns');

// Force IPv4 to avoid DNS resolution issues with MongoDB Atlas
dns.setDefaultResultOrder('ipv4first');

const connectToDatabase = async () => {
  const MONGO_URI = process.env.MONGO_URI || '';
  
  try {
    if (!MONGO_URI) {
      console.error('❌ CRITICAL: MONGO_URI environment variable is missing!');
      console.error('Please set MONGO_URI in your .env file');
      process.exit(1);
    }

    console.log('🔗 Connecting to MongoDB Atlas...');
    
    // Connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 30000, // Timeout after 30 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4 (helps with DNS resolution issues)
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Maintain at least 2 socket connections
    };

    // If a custom DB_NAME is provided in env, use it. Otherwise, if MONGO_URI doesn't have a path, default to church_db
    if (process.env.DB_NAME) {
      options.dbName = process.env.DB_NAME;
      console.log(`📌 Using custom database: ${options.dbName}`);
    } else if (!MONGO_URI.includes('/church_db') && !MONGO_URI.includes('/?') && !MONGO_URI.includes('/%3F')) {
      options.dbName = process.env.NODE_ENV === 'production' ? 'church_db_prod' : 'church_db_dev';
      console.log(`📌 Using default environment database: ${options.dbName}`);
    }

    await mongoose.connect(MONGO_URI, options);

    console.log('✅ Connected to MongoDB Atlas successfully!');
    console.log(`📌 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📌 Host: ${mongoose.connection.host}`);
    console.log(`📌 Database: ${mongoose.connection.name}`);
    console.log(`📌 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    
    // More detailed error logging for common issues
    if (err.name === 'MongoServerSelectionError') {
      console.error('🔍 Could not connect to MongoDB Atlas. Possible issues:');
      console.error('  1. Check your IP is whitelisted in Atlas Network Access');
      console.error('  2. Verify your username and password are correct');
      console.error('  3. Ensure your cluster is active and running');
      console.error('  4. Check if MONGO_URI format is correct');
    } else if (err.name === 'MongoParseError') {
      console.error('🔍 Invalid MongoDB connection string format. Check your MONGO_URI');
    }
    
    // Don't exit the process - let the server handle the error
    throw err;
  }
};

module.exports = connectToDatabase;