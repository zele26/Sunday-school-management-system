// church-server/scripts/verify_prod_passwords.js
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

  const users = await User.find({}).select('+password').lean();
  for (const u of users) {
    const isMatch123456 = u.password ? await bcrypt.compare('admin123456', u.password) : false;
    const isMatchAdmin = u.password ? await bcrypt.compare('admin123', u.password) : false;
    const isMatchPassword = u.password ? await bcrypt.compare('password123', u.password) : false;
    console.log(`User: ${u.email} | admin123456: ${isMatch123456} | admin123: ${isMatchAdmin} | password123: ${isMatchPassword}`);
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
