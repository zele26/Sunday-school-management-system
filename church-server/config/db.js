const mongoose = require('mongoose');

const connectToDatabase = async () => {
  const MONGO_URI = process.env.MONGO_URI || '';
  
  try {
    if (!MONGO_URI) {
      console.error('❌ CRITICAL: MONGO_URI environment variable is missing!');
      console.error('Please set MONGO_URI in your .env file');
      process.exit(1);
    }

    // Determine environment and target database explicitly
    const isProduction = process.env.NODE_ENV === 'production';
    const targetDbName = process.env.DB_NAME || (isProduction ? 'church_db' : 'church_db_dev');

    console.log('🔗 Connecting to MongoDB Atlas...');
    console.log(`📌 Target Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📌 Target Database:    ${targetDbName}`);

    // Connection options for high throughput, pooling & reliability
    const options = {
      dbName: targetDbName, // Explicitly enforce target database (overrides URI path)
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 50,         // Scale pool up to 50 concurrent connections
      minPoolSize: 10,         // Keep 10 warm connections ready
      maxIdleTimeMS: 30000,    // Close idle connections after 30s
    };

    await mongoose.connect(MONGO_URI, options);

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ CONNECTED TO MONGODB ATLAS                                 ║');
    console.log(`║  📌 Active Database Name : ${mongoose.connection.name.padEnd(35)} ║`);
    console.log(`║  📌 Environment          : ${(process.env.NODE_ENV || 'development').padEnd(35)} ║`);
    console.log(`║  📌 Database Host        : ${mongoose.connection.host.padEnd(35)} ║`);
    console.log('╚════════════════════════════════════════════════════════════════╝');
    
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