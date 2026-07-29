// backfillStudentIds.js
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Registration = require('./models/Registration');
const User = require('./models/User');

const generateStudentId = async (studentType) => {
  const prefix = studentType === 'distance' ? 'TKD' : 'TKR';
  const getEthiopianYearSuffix = () => {
    const now = new Date();
    const gregorianYear = now.getFullYear();
    const ethiopianYear =
      now >= new Date(gregorianYear, 8, 11) ? gregorianYear - 7 : gregorianYear - 8;
    return String(ethiopianYear % 100).padStart(2, '0');
  };
  const yearSuffix = getEthiopianYearSuffix();
  const lastStudent = await Student.findOne({
    studentId: { $regex: `^${prefix}-`, $exists: true },
  }).sort({ studentId: -1 }).limit(1);
  let lastNumber = 0;
  if (lastStudent && lastStudent.studentId) {
    const parts = lastStudent.studentId.split('/')[0].split('-');
    lastNumber = parseInt(parts[1]) || 0;
  }
  const newNumber = String(lastNumber + 1).padStart(4, '0');
  return `${prefix}-${newNumber}/${yearSuffix}`;
};

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const studentsWithoutId = await Student.find({ studentId: { $exists: false } });
  for (const s of studentsWithoutId) {
    const studentType = s.studentType || 'regular'; // default to regular if missing
    const newId = await generateStudentId(studentType);
    s.studentId = newId;
    await s.save();
    console.log(`Assigned ${newId} to ${s.firstName}`);
    // Optionally also update the linked Registration if one exists
    await Registration.findOneAndUpdate(
      { phone: s.studentPhone, fullName: s.firstName }, // rough match – you can improve this
      { $set: { studentId: newId } }
    );
  }
  console.log('Backfill complete.');
  process.exit(0);
})();