require('dotenv').config();
const mongoose = require('mongoose');

async function inspectUserById() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'church_db_dev';
  await mongoose.connect(uri, { dbName });

  const user = await mongoose.connection.collection('users').findOne({
    _id: new mongoose.Types.ObjectId('6ac28c14d06d7c712b9d9ed8')
  });
  console.log('--- USER DOC (6ac28c14d06d7c712b9d9ed8) ---:', user);

  await mongoose.disconnect();
}

inspectUserById().catch(console.error);
