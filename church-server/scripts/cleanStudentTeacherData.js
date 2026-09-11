require('dotenv').config();
const mongoose = require('mongoose');
const connectToDatabase = require('../config/db');

// Models
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Registration = require('../models/education/Registration');
const Attendance = require('../models/education/Attendance');
const StudentLearningProgress = require('../models/education/StudentLearningProgress');
const CourseEnrollment = require('../models/education/CourseEnrollment');
const AcademicEnrollment = require('../models/education/AcademicEnrollment');
const StudentProfile = require('../models/education/StudentProfile');
const TeacherProfile = require('../models/education/TeacherProfile');
const Submission = require('../models/education/Submission');
const ExamResult = require('../models/education/ExamResult');
const Certificate = require('../models/education/Certificate');

async function inspectAndClean() {
  try {
    await connectToDatabase();

    console.log('🔍 Checking existing records...');
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: { $in: ['admin', 'superadmin', 'department_admin'] } });
    const studentUsers = await User.countDocuments({ role: 'student' });
    const teacherUsers = await User.countDocuments({ role: 'teacher' });
    const students = await Student.countDocuments();
    const teachers = await Teacher.countDocuments();
    const registrations = await Registration.countDocuments();
    const attendances = await Attendance.countDocuments();
    const progress = await StudentLearningProgress.countDocuments();

    console.log(`📌 Total Users: ${totalUsers}`);
    console.log(`   - Admins (to keep): ${adminUsers}`);
    console.log(`   - Student Users (to delete): ${studentUsers}`);
    console.log(`   - Teacher Users (to delete): ${teacherUsers}`);
    console.log(`📌 Students records: ${students}`);
    console.log(`📌 Teachers records: ${teachers}`);
    console.log(`📌 Registrations: ${registrations}`);
    console.log(`📌 Attendance records: ${attendances}`);
    console.log(`📌 Student Progress: ${progress}`);

    console.log('\n🧹 Deleting student and teacher data...');

    // 1. Delete Student & Teacher User accounts (preserving admins)
    const delUsers = await User.deleteMany({ role: { $in: ['student', 'teacher'] } });
    console.log(`✅ Deleted ${delUsers.deletedCount} student/teacher user accounts.`);

    // 2. Delete Student and Teacher collection records
    const delStudents = await Student.deleteMany({});
    console.log(`✅ Deleted ${delStudents.deletedCount} students.`);

    const delTeachers = await Teacher.deleteMany({});
    console.log(`✅ Deleted ${delTeachers.deletedCount} teachers.`);

    // 3. Delete related student profiles, enrollments, registrations, and learning progress
    const delStudentProfiles = await StudentProfile.deleteMany({});
    const delTeacherProfiles = await TeacherProfile.deleteMany({});
    const delRegistrations = await Registration.deleteMany({});
    const delAttendances = await Attendance.deleteMany({});
    const delProgress = await StudentLearningProgress.deleteMany({});
    const delCourseEnrollments = await CourseEnrollment.deleteMany({});
    const delAcademicEnrollments = await AcademicEnrollment.deleteMany({});
    const delSubmissions = await Submission.deleteMany({});
    const delExamResults = await ExamResult.deleteMany({});
    const delCertificates = await Certificate.deleteMany({});

    console.log(`✅ Cleaned up student profiles (${delStudentProfiles.deletedCount}), teacher profiles (${delTeacherProfiles.deletedCount})`);
    console.log(`✅ Cleaned up registrations (${delRegistrations.deletedCount}), attendance (${delAttendances.deletedCount}), progress (${delProgress.deletedCount})`);
    console.log(`✅ Cleaned up enrollments (${delCourseEnrollments.deletedCount}), submissions (${delSubmissions.deletedCount}), exams (${delExamResults.deletedCount}), certificates (${delCertificates.deletedCount})`);

    // Verify remaining admin users
    const remainingAdmins = await User.find({}).select('fullName email phone role status');
    console.log('\n👑 Preserved Active Admin Accounts:');
    remainingAdmins.forEach((adm) => {
      console.log(`   - ${adm.fullName} (${adm.role}) | Email: ${adm.email || '-'} | Phone: ${adm.phone || '-'}`);
    });

    console.log('\n✨ Database successfully reset for clean student & teacher operations!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during cleanup:', err);
    process.exit(1);
  }
}

inspectAndClean();
