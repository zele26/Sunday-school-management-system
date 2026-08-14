// church-server/backfillEmergencyFields.js
require('dotenv').config();
const mongoose = require('mongoose');
const Registration = require('./models/Registration');
const Student = require('./models/Student');

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ---------- Update Registrations ----------
    const registrations = await Registration.find({});
    console.log(`Processing ${registrations.length} registrations`);

    for (const reg of registrations) {
      let updated = false;

      // Sync name fields if missing
      if (!reg.firstName && reg.fullName) {
        const parts = reg.fullName.trim().split(/\s+/);
        reg.firstName = parts[0] || '';
        reg.middleName = parts[1] || '';
        reg.lastName = parts.slice(2).join(' ') || '';
        updated = true;
      }

      if (!reg.emergencyFirstName) {
        reg.emergencyFirstName = reg.parentName || '';
        updated = true;
      }
      if (!reg.emergencyPhone) {
        reg.emergencyPhone = reg.parentPhone || '';
        updated = true;
      }
      if (!reg.emergencyEmail) {
        reg.emergencyEmail = reg.parentEmail || '';
        updated = true;
      }
      if (!reg.parentName && reg.emergencyFirstName) {
        reg.parentName = reg.emergencyFirstName;
        updated = true;
      }
      if (!reg.parentPhone && reg.emergencyPhone) {
        reg.parentPhone = reg.emergencyPhone;
        updated = true;
      }
      if (!reg.parentEmail && reg.emergencyEmail) {
        reg.parentEmail = reg.emergencyEmail;
        updated = true;
      }
      if (!reg.relationship) {
        reg.relationship = 'Father';
        updated = true;
      }

      if (updated) {
        await reg.save({ validateBeforeSave: false });
        console.log(`Updated registration ${reg.registrationNumber}`);
      }
    }

    // ---------- Update Students ----------
    const students = await Student.find({});
    console.log(`Processing ${students.length} students`);

    for (const student of students) {
      let updated = false;

      // Find matching registration if available
      let matchingReg = null;
      if (student.registrationNumber) {
        matchingReg = await Registration.findOne({ registrationNumber: student.registrationNumber });
      }
      if (!matchingReg && student.studentId) {
        matchingReg = await Registration.findOne({ studentId: student.studentId });
      }
      if (!matchingReg && student.studentPhone) {
        matchingReg = await Registration.findOne({ phone: student.studentPhone });
      }

      // Sync name / education / profession from Registration if missing in Student
      if (matchingReg) {
        if (!student.firstName || student.firstName === student.fullName) {
          if (matchingReg.firstName) { student.firstName = matchingReg.firstName; updated = true; }
        }
        if (!student.middleName && matchingReg.middleName) {
          student.middleName = matchingReg.middleName; updated = true;
        }
        if (!student.lastName && matchingReg.lastName) {
          student.lastName = matchingReg.lastName; updated = true;
        }
        if (!student.educationLevel && matchingReg.educationLevel) {
          student.educationLevel = matchingReg.educationLevel; updated = true;
        }
        if (!student.profession && matchingReg.profession) {
          student.profession = matchingReg.profession; updated = true;
        }
      }

      const regEFirst = matchingReg?.emergencyFirstName || matchingReg?.parentName || '';
      const regEMiddle = matchingReg?.emergencyMiddleName || '';
      const regELast = matchingReg?.emergencyLastName || '';
      const regEPhone = matchingReg?.emergencyPhone || matchingReg?.parentPhone || '';
      const regEEmail = matchingReg?.emergencyEmail || matchingReg?.parentEmail || '';
      const regEAddress = matchingReg?.emergencyAddress || '';
      const regRel = matchingReg?.relationship || 'Father';

      const eFirst = student.emergencyFirstName || student.parentName || regEFirst;
      const eMiddle = student.emergencyMiddleName || regEMiddle;
      const eLast = student.emergencyLastName || regELast;
      const ePhone = student.emergencyPhone || student.parentPhone || student.contactPhone || regEPhone;
      const eEmail = student.emergencyEmail || student.parentEmail || student.contactEmail || regEEmail;
      const eAddress = student.emergencyAddress || student.contactAddress || regEAddress;
      const eRel = student.relationship || regRel;

      if (!student.emergencyFirstName && eFirst) {
        student.emergencyFirstName = eFirst;
        updated = true;
      }
      if (!student.emergencyMiddleName && eMiddle) {
        student.emergencyMiddleName = eMiddle;
        updated = true;
      }
      if (!student.emergencyLastName && eLast) {
        student.emergencyLastName = eLast;
        updated = true;
      }
      if (!student.emergencyPhone && ePhone) {
        student.emergencyPhone = ePhone;
        updated = true;
      }
      if (!student.emergencyEmail && eEmail) {
        student.emergencyEmail = eEmail;
        updated = true;
      }
      if (!student.emergencyAddress && eAddress) {
        student.emergencyAddress = eAddress;
        updated = true;
      }

      if (!student.parentName && eFirst) {
        student.parentName = eFirst;
        updated = true;
      }
      if (!student.parentPhone && ePhone) {
        student.parentPhone = ePhone;
        updated = true;
      }
      if (!student.parentEmail && eEmail) {
        student.parentEmail = eEmail;
        updated = true;
      }

      if (!student.contactPhone && ePhone) {
        student.contactPhone = ePhone;
        updated = true;
      }
      if (!student.contactEmail && eEmail) {
        student.contactEmail = eEmail;
        updated = true;
      }
      if (!student.contactAddress && eAddress) {
        student.contactAddress = eAddress;
        updated = true;
      }

      if (!student.relationship && eRel) {
        student.relationship = eRel;
        updated = true;
      }

      if (updated) {
        await student.save({ validateBeforeSave: false });
        console.log(`Updated student ${student.studentId || student._id} (${student.firstName} ${student.lastName})`);
      }
    }

    console.log('✅ Backfill completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Backfill error:', err);
    process.exit(1);
  }
}

run();