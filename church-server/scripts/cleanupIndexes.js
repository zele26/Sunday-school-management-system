require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'church_db_dev';
  console.log('Connecting to:', uri, 'with db:', dbName);

  await mongoose.connect(uri, { dbName });
  console.log('Connected to DB:', mongoose.connection.name);

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('Collections:', collections.map(c => c.name));

  const attendanceCollection = mongoose.connection.collection('attendances');
  const indexes = await attendanceCollection.indexes();
  console.log('Current indexes on attendances:', JSON.stringify(indexes, null, 2));

  for (const idx of indexes) {
    if (idx.name === 'student_1_date_1' || idx.name === 'student_1_date_1_course_1') {
      console.log(`Dropping index ${idx.name}...`);
      try {
        await attendanceCollection.dropIndex(idx.name);
        console.log(`Successfully dropped ${idx.name}!`);
      } catch (e) {
        console.error(`Error dropping ${idx.name}:`, e.message);
      }
    }
  }

  const updatedIndexes = await attendanceCollection.indexes();
  console.log('Updated indexes on attendances:', JSON.stringify(updatedIndexes, null, 2));

  await mongoose.disconnect();
  console.log('Done!');
}

fixIndexes().catch(console.error);
