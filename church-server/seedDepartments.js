// church-server/seedDepartments.js
require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('./models/Department');

const MONGO_URI = process.env.MONGO_URI;

const departments = [
  { name: 'Education', code: 'EDUCATION', description: 'Sunday School / Education Department' },
  { name: 'Choir', code: 'CHOIR', description: 'Church Choir' },
  { name: 'Youth', code: 'YOUTH', description: 'Youth Ministry' },
  { name: 'Finance', code: 'FINANCE', description: 'Church Finance' },
  { name: 'Evangelism', code: 'EVANGELISM', description: 'Evangelism and Outreach' },
  { name: "Women's Ministry", code: 'WOMEN', description: "Women's Ministry" },
  { name: "Men's Ministry", code: 'MEN', description: "Men's Ministry" },
  { name: 'Events', code: 'EVENTS', description: 'Church Events' },
  { name: 'Administration', code: 'ADMINISTRATION', description: 'Church Administration' },
  { name: 'Prayer', code: 'PRAYER', description: 'Prayer Ministry' },
  { name: 'Outreach', code: 'OUTREACH', description: 'Community Outreach' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const dept of departments) {
      const existing = await Department.findOne({ code: dept.code });
      if (!existing) {
        await Department.create(dept);
        console.log(`Created department: ${dept.name}`);
      } else {
        console.log(`Department already exists: ${dept.name}`);
      }
    }

    console.log('✅ Department seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();