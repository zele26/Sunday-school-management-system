require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

(async () => {
  try {
    await connectDB();
    const users = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('fullName email phone role status');
    console.log('Found Admin Users:', JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
})();
