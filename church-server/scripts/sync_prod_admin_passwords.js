// church-server/scripts/sync_prod_admin_passwords.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uriProd = "mongodb://zelalemfiseha26_db_user:zolazola@ac-cxhsxhf-shard-00-00.pj2hwsn.mongodb.net:27017,ac-cxhsxhf-shard-00-01.pj2hwsn.mongodb.net:27017,ac-cxhsxhf-shard-00-02.pj2hwsn.mongodb.net:27017/church_db?ssl=true&replicaSet=atlas-565zob-shard-0&authSource=admin&appName=workconnect";

async function main() {
  await mongoose.connect(uriProd);
  console.log('Connected to church_db (production)');
  
  const User = mongoose.model('User', new mongoose.Schema({
    fullName: String,
    email: String,
    password: { type: String, select: true },
    role: String,
    status: String,
  }, { collection: 'users' }));

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('admin123456', salt);

  const updatedAdmin = await User.findOneAndUpdate(
    { email: 'admin@example.com' },
    { password: hashedPassword, status: 'approved', role: 'superadmin' },
    { new: true }
  );
  console.log('Updated admin@example.com in production:', updatedAdmin?.email);

  const updatedTestAdmin = await User.findOneAndUpdate(
    { email: 'admin@test.com' },
    { password: hashedPassword, status: 'approved', role: 'superadmin' },
    { new: true }
  );
  console.log('Updated admin@test.com in production:', updatedTestAdmin?.email);

  await mongoose.disconnect();
  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
