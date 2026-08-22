// church-server/migrateToEducationCore.js
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Person = require('./models/Person');
const StudentProfile = require('./models/education/StudentProfile');
const Program = require('./models/education/Program');
const AcademicYear = require('./models/education/AcademicYear');
const Grade = require('./models/education/Grade');
const StudyMode = require('./models/education/StudyMode');
const Schedule = require('./models/education/Schedule');
const AcademicEnrollment = require('./models/education/AcademicEnrollment');

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Seed default programs
    const programs = [
      { name: 'Regular Education', code: 'REG', type: 'regular' },
      { name: 'Distance Education', code: 'DIS', type: 'distance' },
    ];
    const programMap = {};
    for (const p of programs) {
      let program = await Program.findOne({ code: p.code });
      if (!program) {
        program = await Program.create(p);
        console.log(`Created Program: ${p.name}`);
      }
      programMap[p.code] = program;
    }

    // 2. Seed StudyModes
    const studyModes = [
      { name: 'Regular', code: 'REGULAR' },
      { name: 'Distance', code: 'DISTANCE' },
    ];
    const studyModeMap = {};
    for (const sm of studyModes) {
      let mode = await StudyMode.findOne({ code: sm.code });
      if (!mode) {
        mode = await StudyMode.create(sm);
        console.log(`Created StudyMode: ${sm.name}`);
      }
      studyModeMap[sm.code] = mode;
    }

    // 3. Seed Schedules
    const schedules = [
      { name: 'Weekend', code: 'WEEKEND' },
      { name: 'Monday / Wednesday / Friday - Night', code: 'MWF_NIGHT' },
    ];
    const scheduleMap = {};
    for (const s of schedules) {
      let schedule = await Schedule.findOne({ code: s.code });
      if (!schedule) {
        schedule = await Schedule.create(s);
        console.log(`Created Schedule: ${s.name}`);
      }
      scheduleMap[s.code] = schedule;
    }

    // 4. Seed current AcademicYear (use current Gregorian year)
    const currentYear = new Date().getFullYear().toString();
    let academicYear = await AcademicYear.findOne({ name: currentYear });
    if (!academicYear) {
      academicYear = await AcademicYear.create({ name: currentYear, status: 'active' });
      console.log(`Created AcademicYear: ${currentYear}`);
    }

    // 5. Process all existing students
    const students = await Student.find({});
    console.log(`Processing ${students.length} students`);

    for (const student of students) {
      // Find Person by phone/email
      let person = await Person.findOne({
        $or: [
          { phone: student.studentPhone || student.contactPhone || '' },
          { email: student.email || '' },
        ],
      });
      if (!person) {
        console.warn(`⚠️ No Person found for student ${student.studentId}. Skipping.`);
        continue;
      }

      // Create or find StudentProfile
      let profile = await StudentProfile.findOne({ personId: person._id });
      if (!profile) {
        profile = await StudentProfile.create({
          personId: person._id,
          studentNumber: student.studentId,
          admissionDate: student.registrationDate || new Date(),
          status: 'active',
        });
        console.log(`Created StudentProfile for ${student.studentId}`);
      } else {
        console.log(`StudentProfile already exists for ${student.studentId}`);
      }

      // Determine program and study mode
      const programCode = student.studentType === 'distance' ? 'DIS' : 'REG';
      const modeCode = student.studentType === 'distance' ? 'DISTANCE' : 'REGULAR';

      // Determine grade (if regular) or null for distance
      let gradeId = null;
      if (student.studentType === 'regular') {
        // Look up grade by name (e.g., "Grade 7")
        const gradeName = student.grade;  // e.g., "Grade 7"
        if (gradeName) {
          let grade = await Grade.findOne({ name: gradeName, programId: programMap[programCode]._id });
          if (!grade) {
            // Create grade if not exists
            const levelMatch = gradeName.match(/(\d+)/);
            const level = levelMatch ? parseInt(levelMatch[1]) : 1;
            grade = await Grade.create({
              name: gradeName,
              level,
              programId: programMap[programCode]._id,
            });
            console.log(`Created Grade: ${gradeName}`);
          }
          gradeId = grade._id;
        }
      }

      // Create AcademicEnrollment for current year
      const existingEnrollment = await AcademicEnrollment.findOne({
        studentProfileId: profile._id,
        academicYearId: academicYear._id,
        programId: programMap[programCode]._id,
      });

      if (!existingEnrollment) {
        await AcademicEnrollment.create({
          studentProfileId: profile._id,
          academicYearId: academicYear._id,
          programId: programMap[programCode]._id,
          gradeId: gradeId,
          studyModeId: studyModeMap[modeCode]._id,
          scheduleId: scheduleMap['WEEKEND']?._id || null,   // default weekend for now
          status: 'active',
          startDate: new Date(),
        });
        console.log(`Created AcademicEnrollment for ${student.studentId}`);
      }
    }

    console.log('✅ Migration to Education Core completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

run();