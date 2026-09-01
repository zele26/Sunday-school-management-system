require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const targetEmail = process.argv[2] || 'admin@example.com';

(async () => {
  try {
    await connectDB();
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      console.log(`❌ User with email "${targetEmail}" not found.`);
      process.exit(1);
    }

    user.role = 'superadmin';
    user.status = 'approved';
    await user.save();

    console.log(`✅ SUCCESS: User "${user.fullName}" (${user.email}) is now a 👑 Super Admin!`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating user:', err);
    process.exit(1);
  }
})();
