require('dotenv').config();
const mongoose = require('mongoose');
const connectToDatabase = require('../config/db');
const AcademicYear = require('../models/education/AcademicYear');
const SystemSetting = require('../models/SystemSetting');

function ethiopicToGregorian(year, month, day) {
  const y = parseInt(year, 10);
  const m = parseInt(month, 10);
  const d = parseInt(day, 10);
  const jdn = (1723856 + 365) + 365 * (y - 1) + Math.floor(y / 4) + 30 * (m - 1) + d - 1;
  const a = jdn;
  const alpha = Math.floor((a - 1867216.25) / 36524.25);
  const b = a + 1 + alpha - Math.floor(alpha / 4);
  const c = b + 1524;
  const dConst = Math.floor((c - 122.1) / 365.25);
  const e = Math.floor(365.25 * dConst);
  const g = Math.floor((c - e) / 30.6001);
  const gDay = c - e - Math.floor(30.6001 * g);
  const gMonth = g < 13.5 ? g - 1 : g - 13;
  const gYear = gMonth > 2.5 ? dConst - 4716 : dConst - 4715;
  return new Date(Date.UTC(gYear, gMonth - 1, gDay, 0, 0, 0));
}

const academicYearsToSeed = [
  {
    yearNum: 2016,
    name: '2016 ዓ.ም',
    status: 'completed',
    description: 'የ2016 ዓ.ም የትምህርት ዘመን (ያለፈ)',
  },
  {
    yearNum: 2017,
    name: '2017 ዓ.ም',
    status: 'active',
    description: 'የ2017 ዓ.ም የትምህርት ዘመን (አሁን የሚሠራበት ንቁ የትምህርት ዘመን)',
  },
  {
    yearNum: 2018,
    name: '2018 ዓ.ም',
    status: 'inactive',
    description: 'የ2018 ዓ.ም የትምህርት ዘመን (ቀጣይ)',
  },
  {
    yearNum: 2019,
    name: '2019 ዓ.ም',
    status: 'inactive',
    description: 'የ2019 ዓ.ም የትምህርት ዘመን',
  },
  {
    yearNum: 2020,
    name: '2020 ዓ.ም',
    status: 'inactive',
    description: 'የ2020 ዓ.ም የትምህርት ዘመን',
  },
  {
    yearNum: 2021,
    name: '2021 ዓ.ም',
    status: 'inactive',
    description: 'የ2021 ዓ.ም የትምህርት ዘመን',
  },
];

async function seedYears() {
  try {
    await connectToDatabase();
    console.log('🇪🇹 Seeding Ethiopian Academic Years...');

    for (const item of academicYearsToSeed) {
      const isLeap = item.yearNum % 4 === 3;
      const startDate = ethiopicToGregorian(item.yearNum, 1, 1);
      const endDate = ethiopicToGregorian(item.yearNum, 13, isLeap ? 6 : 5);

      const existing = await AcademicYear.findOne({ name: item.name });
      if (existing) {
        existing.startDate = startDate;
        existing.endDate = endDate;
        existing.status = item.status;
        existing.description = item.description;
        await existing.save();
        console.log(`Updated ${item.name} (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}) -> ${item.status}`);
      } else {
        await AcademicYear.create({
          name: item.name,
          startDate,
          endDate,
          status: item.status,
          description: item.description,
        });
        console.log(`Created ${item.name} (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}) -> ${item.status}`);
      }
    }

    // Ensure SystemSetting registration academic year matches active year
    const activeYear = await AcademicYear.findOne({ status: 'active' });
    if (activeYear) {
      await SystemSetting.findOneAndUpdate(
        { key: 'registration' },
        { academicYear: activeYear.name },
        { upsert: true }
      );
      console.log(`✅ SystemSetting updated with active academic year: ${activeYear.name}`);
    }

    console.log('🎉 Ethiopian Academic Years successfully seeded!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding academic years:', err);
    process.exit(1);
  }
}

seedYears();
