// backfillStudentIds.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectToDatabase = require('./config/db');

const generateStudentId = async (studentType, model) => {
  const prefix = studentType === 'distance' ? 'TKD' : 'TKR';
  
  const getEthiopianYearSuffix = () => {
    const now = new Date();
    const gregorianYear = now.getFullYear();
    const ethiopianYear =
      now >= new Date(gregorianYear, 8, 11) ? gregorianYear - 7 : gregorianYear - 8;
    return String(ethiopianYear % 100).padStart(2, '0');
  };
  
  const yearSuffix = getEthiopianYearSuffix();
  
  // Find the last student with this prefix
  const lastStudent = await model.findOne({
    studentId: { $regex: `^${prefix}-`, $exists: true },
  }).sort({ studentId: -1 }).limit(1);
  
  let lastNumber = 0;
  if (lastStudent && lastStudent.studentId) {
    // Extract number from TKR-0001/18
    const match = lastStudent.studentId.match(/^([A-Z]+)-(\d+)\/(\d+)$/);
    if (match) {
      lastNumber = parseInt(match[2]) || 0;
    }
  }
  
  const newNumber = String(lastNumber + 1).padStart(4, '0');
  return `${prefix}-${newNumber}/${yearSuffix}`;
};

async function backfillStudentIds() {
  try {
    await connectToDatabase();
    
    const Student = require('./models/Student');
    const Registration = require('./models/Registration');
    
    // Find all students without studentId
    const studentsWithoutId = await Student.find({ 
      studentId: { $exists: false } 
    });
    
    console.log(`📋 Found ${studentsWithoutId.length} students without studentId`);
    
    let assignedCount = 0;
    
    for (const student of studentsWithoutId) {
      const studentType = student.studentType || 'regular';
      const newId = await generateStudentId(studentType, Student);
      
      student.studentId = newId;
      await student.save();
      assignedCount++;
      
      console.log(`✅ Assigned ${newId} to ${student.firstName} ${student.lastName || ''} (${studentType})`);
      
      // ✅ Link registration via userId
      if (student.userId) {
        await Registration.findOneAndUpdate(
          { userId: student.userId },
          { $set: { studentId: newId } }
        );
      }
      
      // Optional: if userId doesn't exist, try matching by phone
      if (student.studentPhone) {
        await Registration.findOneAndUpdate(
          { phone: student.studentPhone },
          { $set: { studentId: newId } }
        );
      }
    }
    
    console.log(`✅ Backfill complete! ${assignedCount} students assigned.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

backfillStudentIds();