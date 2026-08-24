const express = require('express');
const router = express.Router();
const StudentProfile = require('../../models/education/StudentProfile');
const AcademicEnrollment = require('../../models/education/AcademicEnrollment');
const CourseEnrollment = require('../../models/education/CourseEnrollment');
const { protect, authorize } = require('../../middleware/auth');

// GET /api/education/students/:studentProfileId/certificate – generate certificate data
router.get('/students/:studentProfileId/certificate', protect, async (req, res) => {
  try {
    const { studentProfileId } = req.params;
    const profile = await StudentProfile.findById(studentProfileId).populate('personId', 'firstName middleName lastName');
    if (!profile) return res.status(404).json({ success: false, message: 'Student not found' });

    const latestEnrollment = await AcademicEnrollment.findOne({ studentProfileId: studentProfileId, status: 'completed' })
      .populate('programId', 'name')
      .populate('gradeId', 'name')
      .populate('academicYearId', 'name')
      .sort({ createdAt: -1 });

    if (!latestEnrollment) return res.status(404).json({ success: false, message: 'No completed enrollment found' });

    const courses = await CourseEnrollment.find({ academicEnrollmentId: latestEnrollment._id })
      .populate('courseId', 'name');

    // Ethiopian date
    const ethiopianDate = new Date().toLocaleDateString('am-ET-u-ca-ethiopic', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    res.json({
      success: true,
      certificate: {
        studentName: `${profile.personId.firstName} ${profile.personId.middleName || ''} ${profile.personId.lastName}`,
        studentNumber: profile.studentNumber,
        program: latestEnrollment.programId?.name,
        grade: latestEnrollment.gradeId?.name,
        academicYear: latestEnrollment.academicYearId?.name,
        courses: courses.map(c => c.courseId?.name),
        issueDateEthiopian: ethiopianDate,
      }
    });
  } catch (err) {
    console.error('Certificate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;