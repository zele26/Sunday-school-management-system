require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('./models/Registration');

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const recentRegs = await Registration.find({}).sort({ createdAt: -1 }).limit(5);
    console.log(`\n--- 5 MOST RECENT REGISTRATIONS IN DATABASE ---`);
    recentRegs.forEach((r, idx) => {
      console.log(`\n[${idx + 1}] Registration #: ${r.registrationNumber} | Status: ${r.status} | Date: ${r.createdAt}`);
      console.log(`FullName: "${r.fullName}" | FirstName: "${r.firstName}" | MiddleName: "${r.middleName}" | LastName: "${r.lastName}"`);
      console.log(`Phone: "${r.phone}" | Email: "${r.email}" | Grade: "${r.grade}" | Type: "${r.studentType}"`);
      console.log(`EmergencyName: "${r.emergencyFirstName} ${r.emergencyMiddleName} ${r.emergencyLastName}" | ParentName: "${r.parentName}"`);
      console.log(`EmergencyPhone: "${r.emergencyPhone}" | ParentPhone: "${r.parentPhone}"`);
      console.log(`EmergencyEmail: "${r.emergencyEmail}" | ParentEmail: "${r.parentEmail}"`);
      console.log(`Relationship: "${r.relationship}" | EmergencyAddress: "${r.emergencyAddress}"`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
