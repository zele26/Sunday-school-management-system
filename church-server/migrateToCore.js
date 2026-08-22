// church-server/migrateToCore.js
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Person = require('./models/Person');
const Department = require('./models/Department');
const DepartmentMembership = require('./models/DepartmentMembership');

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Ensure Education department exists
    let educationDept = await Department.findOne({ code: 'EDUCATION' });
    if (!educationDept) {
      educationDept = await Department.create({
        name: 'Education',
        code: 'EDUCATION',
        description: 'Sunday School / Education Department',
      });
      console.log('Created Education department');
    }

    // ---------- Migrate Students ----------
    const students = await Student.find({});
    console.log(`Processing ${students.length} students`);

    for (const student of students) {
      // Find existing Person by phone or email
      let person = await Person.findOne({
        $or: [
          { phone: student.studentPhone || student.contactPhone || '' },
          { email: student.email || '' },
        ],
      });

      if (!person) {
        person = await Person.create({
          firstName: student.firstName || '',
          middleName: student.middleName || '',
          lastName: student.lastName || '',
          gender: student.gender || 'Male',
          dateOfBirth: student.dob || '',
          phone: student.studentPhone || student.contactPhone || '',
          email: student.email || '',
          address: student.address || '',
        });
        console.log(`Created Person for student ${student.studentId}`);
      } else {
        console.log(`Person already exists for student ${student.studentId}`);
      }

      // Create DepartmentMembership if not already exists
      const existingMembership = await DepartmentMembership.findOne({
        personId: person._id,
        departmentId: educationDept._id,
        departmentMemberId: student.studentId,
      });

      if (!existingMembership) {
        await DepartmentMembership.create({
          personId: person._id,
          departmentId: educationDept._id,
          departmentMemberId: student.studentId,
          roleId: null,
          status: 'active',
          startDate: student.registrationDate || new Date(),
          metadata: {
            oldStudentId: student._id,
            studentType: student.studentType,
            batch: student.batch,
            grade: student.grade,
          },
        });
        console.log(`Created Education membership for ${student.studentId}`);
      }
    }

    // ---------- Migrate Teachers ----------
    const teachers = await Teacher.find({});
    console.log(`Processing ${teachers.length} teachers`);

    for (const teacher of teachers) {
      let person = await Person.findOne({
        $or: [
          { phone: teacher.phone || '' },
          { email: teacher.email || '' },
        ],
      });

      if (!person) {
        person = await Person.create({
          firstName: teacher.firstName || '',
          middleName: teacher.middleName || '',
          lastName: teacher.lastName || '',
          gender: teacher.gender || 'Male',
          dateOfBirth: teacher.dateOfBirth || '',
          phone: teacher.phone || '',
          email: teacher.email || '',
          address: teacher.address || '',
        });
        console.log(`Created Person for teacher ${teacher.teacherId}`);
      } else {
        console.log(`Person already exists for teacher ${teacher.teacherId}`);
      }

      const existingMembership = await DepartmentMembership.findOne({
        personId: person._id,
        departmentId: educationDept._id,
        departmentMemberId: teacher.teacherId,
      });

      if (!existingMembership) {
        await DepartmentMembership.create({
          personId: person._id,
          departmentId: educationDept._id,
          departmentMemberId: teacher.teacherId,
          roleId: null,
          status: 'active',
          startDate: teacher.registrationDate || new Date(),
          metadata: {
            oldTeacherId: teacher._id,
            subject: teacher.subject,
          },
        });
        console.log(`Created Education membership for teacher ${teacher.teacherId}`);
      }
    }

    console.log('✅ Migration to Core completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

run();