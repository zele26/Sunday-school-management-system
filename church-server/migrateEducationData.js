require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Course = require('./models/Course'); // legacy course
const Person = require('./models/Person');
const StudentProfile = require('./models/education/StudentProfile');
const TeacherProfile = require('./models/education/TeacherProfile');
const EducationCourse = require('./models/education/Course');
const Program = require('./models/education/Program');
const AcademicYear = require('./models/education/AcademicYear');
const Grade = require('./models/education/Grade');
const StudyMode = require('./models/education/StudyMode');
const Schedule = require('./models/education/Schedule');
const AcademicEnrollment = require('./models/education/AcademicEnrollment');
const CourseEnrollment = require('./models/education/CourseEnrollment');

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Migrate Teachers -> Person + TeacherProfile
    const teachers = await Teacher.find({});
    console.log(`Processing ${teachers.length} teachers`);
    const teacherMap = {}; // legacy teacherId -> new teacherId (Person? maybe teacherProfile._id)

    for (const teacher of teachers) {
      // Find or create Person by email/phone
      let person = await Person.findOne({
        $or: [
          { phone: teacher.phone || '' },
          { email: teacher.email?.toLowerCase() || '' },
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
          email: teacher.email?.toLowerCase() || '',
          address: teacher.address || '',
        });
        console.log(`Created Person for teacher ${teacher.teacherId}`);
      }
      // Create TeacherProfile if not exists
      let profile = await TeacherProfile.findOne({ personId: person._id });
      if (!profile) {
        profile = await TeacherProfile.create({
          personId: person._id,
          teacherNumber: teacher.teacherId,
          subject: teacher.subject || '',
          qualification: teacher.qualification || '',
          experience: teacher.experience || '',
          bio: teacher.bio || '',
          status: teacher.isActive === false ? 'inactive' : 'active',
          legacyTeacherId: teacher._id,
        });
        console.log(`Created TeacherProfile for ${teacher.teacherId}`);
      }
      teacherMap[teacher._id.toString()] = profile._id;
    }

    // 2. Migrate Courses -> EducationCourse
    const legacyCourses = await Course.find({});
    console.log(`Processing ${legacyCourses.length} courses`);
    const courseMap = {}; // legacy course id -> new education course id

    for (const legacy of legacyCourses) {
      let eduCourse = await EducationCourse.findOne({ legacyCourseId: legacy._id });
      if (!eduCourse) {
        eduCourse = await EducationCourse.create({
          code: legacy.code || `C-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
          name: legacy.name,
          description: legacy.description || '',
          status: 'active',
          legacyCourseId: legacy._id,
        });
        console.log(`Created EducationCourse for ${legacy.name}`);
      }
      courseMap[legacy._id.toString()] = eduCourse._id;
    }

    // 3. For each legacy Student, find StudentProfile and latest AcademicEnrollment,
    //    then create CourseEnrollment for each course in student.courses.
    const students = await Student.find({}).populate('courses');
    console.log(`Processing ${students.length} students for course enrollments`);

    for (const student of students) {
      // Find Person by phone/email
      let person = await Person.findOne({
        $or: [
          { phone: student.studentPhone || student.contactPhone || '' },
          { email: student.email || '' },
        ],
      });
      if (!person) {
        console.warn(`Skipping student ${student.studentId} - no Person found`);
        continue;
      }

      // Find StudentProfile
      const profile = await StudentProfile.findOne({ personId: person._id });
      if (!profile) {
        console.warn(`Skipping student ${student.studentId} - no StudentProfile`);
        continue;
      }

      // Find latest active AcademicEnrollment
      const enrollment = await AcademicEnrollment.findOne({
        studentProfileId: profile._id,
        status: { $in: ['active', 'completed'] },
      }).sort({ startDate: -1 });

      if (!enrollment) {
        console.warn(`Skipping student ${student.studentId} - no AcademicEnrollment`);
        continue;
      }

      // For each course in legacy student.courses
      if (student.courses && student.courses.length > 0) {
        for (const legacyCourse of student.courses) {
          const newCourseId = courseMap[legacyCourse._id.toString()];
          if (!newCourseId) continue;

          // Check if already exists
          const existing = await CourseEnrollment.findOne({
            academicEnrollmentId: enrollment._id,
            courseId: newCourseId,
          });
          if (existing) continue;

          // Determine teacher(s): if student.teacher exists, assign that teacher
          let teacherIds = [];
          if (student.teacher) {
            // student.teacher is a User ref; find corresponding TeacherProfile via User? 
            // For now, we might not have mapping; skip teacher assignment or map via User?
            // We'll leave empty for now; can assign later manually.
            // teacherIds = [teacherMap[student.teacher.toString()]] if available
            const teacherLegacy = await Teacher.findOne({ userId: student.teacher });
            if (teacherLegacy && teacherMap[teacherLegacy._id.toString()]) {
              teacherIds = [teacherMap[teacherLegacy._id.toString()]];
            }
          }

          await CourseEnrollment.create({
            academicEnrollmentId: enrollment._id,
            courseId: newCourseId,
            teachers: teacherIds,
            teacherId: teacherIds[0] || null,
            status: 'enrolled',
          });
        }
        console.log(`Created course enrollments for ${student.studentId}`);
      }
    }

    console.log('✅ Full education data migration completed.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

run();