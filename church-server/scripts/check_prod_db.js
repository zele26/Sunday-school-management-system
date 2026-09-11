// church-server/scripts/check_prod_db.js
const mongoose = require('mongoose');

const uriProd = "mongodb://zelalemfiseha26_db_user:zolazola@ac-cxhsxhf-shard-00-00.pj2hwsn.mongodb.net:27017,ac-cxhsxhf-shard-00-01.pj2hwsn.mongodb.net:27017,ac-cxhsxhf-shard-00-02.pj2hwsn.mongodb.net:27017/church_db?ssl=true&replicaSet=atlas-565zob-shard-0&authSource=admin&appName=workconnect";

async function main() {
  console.log('Connecting to church_db (production)...');
  await mongoose.connect(uriProd);
  console.log('Connected to DB:', mongoose.connection.name);
  
  const User = mongoose.model('User', new mongoose.Schema({
    fullName: String,
    email: String,
    phone: String,
    role: String,
    status: String,
  }, { collection: 'users' }));

  const users = await User.find({}).limit(30).lean();
  console.log(`Found ${users.length} users in ${mongoose.connection.name}:`);
  users.forEach(u => console.log(`- ID: ${u._id} | Role: [${u.role}] | Email: ${u.email || '-'} | Phone: ${u.phone || '-'} | Status: ${u.status}`));

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
