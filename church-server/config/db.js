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

    // Mask credentials for safe logging
    const maskedUri = MONGO_URI.replace(/:([^:@]+)@/, ':****@');
    console.log(`🔗 Connecting to MongoDB: ${maskedUri}`);
    console.log(`📌 Target Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📌 Target Database:    ${targetDbName}`);

    // Connection options for high throughput, pooling & reliability
    const options = {
      dbName: targetDbName,    // Explicitly enforce target database (overrides URI path)
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 50,         // Scale pool up to 50 concurrent connections
      minPoolSize: 10,         // Keep 10 warm connections ready
      maxIdleTimeMS: 30000,    // Close idle connections after 30s
    };

    await mongoose.connect(MONGO_URI, options);

    const isAtlas = mongoose.connection.host.includes('mongodb.net');
    const dbType = isAtlas ? 'MongoDB Atlas' : (mongoose.connection.host.includes('localhost') || mongoose.connection.host.includes('127.0.0.1') ? 'Localhost MongoDB' : 'VPS / Custom MongoDB');

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log(`║  ✅ CONNECTED TO ${dbType.padEnd(46)}║`);
    console.log(`║  📌 Active Database Name : ${mongoose.connection.name.padEnd(35)} ║`);
    console.log(`║  📌 Environment          : ${(process.env.NODE_ENV || 'development').padEnd(35)} ║`);
    console.log(`║  📌 Database Host        : ${mongoose.connection.host.padEnd(35)} ║`);
    console.log(`║  📌 Database Port        : ${String(mongoose.connection.port || 27017).padEnd(35)} ║`);
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
    
    // Detailed error logging for common issues (VPS & Atlas)
    if (err.name === 'MongoServerSelectionError') {
      console.error('🔍 Could not connect to MongoDB server. Possible issues:');
      console.error('  1. VPS Firewall / Port: Ensure port 27017 is open (ufw allow 27017 / security group)');
      console.error('  2. MongoDB bindIp: Check /etc/mongod.conf has "bindIp: 0.0.0.0" or your server IP');
      console.error('  3. Authentication: Ensure user exists and authSource is specified (e.g. ?authSource=admin)');
      console.error('  4. SSL/TLS: If your VPS does NOT use SSL/TLS, ensure ssl=true / tls=true is omitted');
      console.error('  5. Atlas IP Whitelist: If using Atlas, check Network Access allows your IP (0.0.0.0/0 or VPS IP)');
    } else if (err.name === 'MongoParseError') {
      console.error('🔍 Invalid MongoDB connection string format. Check your MONGO_URI in .env');
    }
    
    throw err;
  }
};

module.exports = connectToDatabase;