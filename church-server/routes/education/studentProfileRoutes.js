// church-server/routes/education/studentProfileRoutes.js
const express = require('express');
const router = express.Router();
const StudentProfile = require('../../models/education/StudentProfile');
const Student = require('../../models/Student');
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/education/student-profiles
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const [dbProfiles, allStudents] = await Promise.all([
      StudentProfile.find()
        .populate('personId', 'firstName middleName lastName phone email')
        .sort({ createdAt: -1 })
        .lean(),
      Student.find()
        .populate('userId', 'email phone fullName status')
        .populate('courses', 'name grade code')
        .sort({ registrationDate: -1 })
        .lean()
    ]);

    // Build enrollment map for existing StudentProfile records
    const profilesWithEnrollment = await Promise.all(dbProfiles.map(async (profile) => {
      const latestEnrollment = await AcademicEnrollment.findOne({ studentProfileId: profile._id })
        .populate('gradeId', 'name level')
        .populate('programId', 'name code type')
        .populate('academicYearId', 'name')
        .sort({ startDate: -1, createdAt: -1 })
        .lean();
      return { ...profile, latestEnrollment };
    }));

    // If there are students in `Student` model not yet in `StudentProfile` (or if StudentProfile is empty),
    // bridge them dynamically so all registered students appear seamlessly in the profiles list
    const existingStudentIds = new Set(
      dbProfiles.map((p) => p.studentNumber || p.studentId || p._id.toString())
    );

    const studentFallbacks = allStudents
      .filter((s) => !existingStudentIds.has(s.studentId) && !existingStudentIds.has(s._id.toString()))
      .map((s) => ({
        _id: s._id,
        studentNumber: s.studentId || s.registrationNumber || `STU-${s._id.toString().slice(-6).toUpperCase()}`,
        studentId: s.studentId || '',
        personId: {
          _id: s._id,
          firstName: s.firstName,
          middleName: s.middleName || '',
          lastName: s.lastName,
          phone: s.studentPhone || s.contactPhone || s.userId?.phone || '',
          email: s.userId?.email || s.email || '',
        },
        latestEnrollment: {
          gradeId: { name: s.grade || 'Grade 10' },
          programId: { type: s.studentType || 'regular' },
          academicYearId: { name: s.regYear ? `${s.regYear} ዓ.ም` : '2017 ዓ.ም' },
        },
        status: s.userId?.status === 'disabled' ? 'disabled' : 'active',
        studentType: s.studentType || 'regular',
        shift: s.shift || 'weekend',
        grade: s.grade || '',
        batch: s.batch || '',
        phone: s.studentPhone || s.contactPhone || s.userId?.phone || '',
        email: s.userId?.email || s.email || '',
        address: s.address || '',
        emergencyContact: {
          name: [s.emergencyFirstName, s.emergencyMiddleName, s.emergencyLastName].filter(Boolean).join(' '),
          phone: s.emergencyPhone || s.contactPhone || '',
          relationship: s.relationship || 'Father',
        },
        courses: s.courses || [],
      }));

    const combinedProfiles = [...profilesWithEnrollment, ...studentFallbacks];

    res.json({
      success: true,
      profiles: combinedProfiles,
      total: combinedProfiles.length,
    });
  } catch (err) {
    console.error('List profiles error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;