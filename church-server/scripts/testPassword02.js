require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testUser02Password() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'church_db_dev';
  await mongoose.connect(uri, { dbName });

  const user = await mongoose.connection.collection('users').findOne({
    _id: new mongoose.Types.ObjectId('6ac28c14d06d7c712b9d9ed8')
  });

  const matches = await bcrypt.compare('123456', user.password);
  console.log('User 6ac28c14d06d7c712b9d9ed8 password matches "123456":', matches);

  await mongoose.disconnect();
}

testUser02Password().catch(console.error);
