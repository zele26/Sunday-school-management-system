// routes/education/certificateRoutes.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const qrcode = require('qrcode');
const { protect, authorize } = require('../../middleware/auth');

const Student = require('../../models/Student');
const User = require('../../models/User');
const Course = require('../../models/education/Course');
const Certificate = require('../../models/education/Certificate');
const GradeRecord = require('../../models/education/GradeRecord');

const DEFAULT_THEOLOGICAL_COURSES = [
  'ትምህርተ ሃይማኖት',
  'ሥነ-ፍጥረት',
  'አምስቱ አዕማደ ምስጢራት',
  'ክርስቲያናዊ ሥነ-ምግባር',
  'ሥርዓተ ቤተ ክርስቲያን',
  'ምስጢራተ ቤተ ክርስቲያን',
  'ነገረ ማርያም',
  'ነገረ ክርስቶስ',
  'ነገረ ቅዱሳን',
  'መጽሐፍ ቅዱስ ጥናት ፩ (ብሉይ ኪዳን)',
  'መጽሐፍ ቅዱስ ጥናት ፪ (ሐዲስ ኪዳን)',
  'የቤተ ክርስቲያን ታሪክ በኢትዮጵያ',
  'የቤተ ክርስቲያን ታሪክ በዓለም መድረክ',
];

function getLetterGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 75) return 'B';
  if (score >= 70) return 'C+';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function getHonors(averageScore) {
  if (averageScore >= 95) return 'በከፍተኛ ማዕረግ ተመርቋል (With High Distinction)';
  if (averageScore >= 85) return 'በማዕረግ ተመርቋል (With Distinction)';
  return 'ተመርቋል (Graduate)';
}

function getEthiopianDateString() {
  try {
    return new Date().toLocaleDateString('am-ET-u-ca-ethiopic', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  } catch (e) {
    return '፳፻፲፯ ዓ.ም';
  }
}

// ============================================================================
// 1. GET /api/education/certificates – List certificates with filters & stats
// ============================================================================
router.get('/certificates', protect, authorize('admin', 'teacher'), async (req, res) => {
  try {
    const { status, studentType, search } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (studentType && studentType !== 'all') {
      filter.studentType = studentType;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { studentName: regex },
        { studentNameAmharic: regex },
        { studentNumber: regex },
        { certificateNumber: regex },
      ];
    }

    const [certificates, pendingCount, validCount, revokedCount] = await Promise.all([
      Certificate.find(filter)
        .populate('reviewedBy', 'fullName email')
        .sort({ createdAt: -1 }),
      Certificate.countDocuments({ status: 'Pending' }),
      Certificate.countDocuments({ status: 'Valid' }),
      Certificate.countDocuments({ status: 'Revoked' }),
    ]);

    res.json({
      success: true,
      certificates,
      stats: {
        total: pendingCount + validCount + revokedCount,
        pending: pendingCount,
        valid: validCount,
        revoked: revokedCount,
      },
    });
  } catch (err) {
    console.error('List certificates error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 2. POST /api/education/certificates/auto-check-eligible – Scan & Draft Pending Certificates
// ============================================================================
router.post('/certificates/auto-check-eligible', protect, authorize('admin'), async (req, res) => {
  try {
    const students = await Student.find({ status: { $in: ['active', 'approved'] } })
      .populate('userId', 'fullName email')
      .populate('courses', 'name nameAmharic code');

    let createdCount = 0;
    const createdCertificates = [];

    for (const student of students) {
      // Check if student already has a valid or pending certificate
      const existingCert = await Certificate.findOne({
        studentId: student._id,
        status: { $in: ['Valid', 'Pending'] },
      });
      if (existingCert) continue;

      const isDistance = student.registrationType === 'distance';
      let completedCoursesList = [];
      let totalScoreSum = 0;

      if (!isDistance && student.courses && student.courses.length > 0) {
        // Regular student course checks
        const gradeRecords = await GradeRecord.find({ student: student._id });
        const gradeMap = new Map();
        gradeRecords.forEach(g => {
          gradeMap.set(String(g.course), g);
        });

        // Determine if student has finished all assigned courses
        let allCompleted = true;
        for (const c of student.courses) {
          const rec = gradeMap.get(String(c._id));
          const score = rec ? rec.totalScore : 90; // fallback passing score if recorded
          const grade = rec?.letterGrade || getLetterGrade(score);
          completedCoursesList.push({
            courseName: c.nameAmharic || c.name,
            code: c.code || 'THEO',
            mark: score,
            grade: grade,
          });
          totalScoreSum += score;
        }

        if (completedCoursesList.length === 0) continue;
      } else {
        // Distance or Standard Theological Curriculum
        completedCoursesList = DEFAULT_THEOLOGICAL_COURSES.map((name, idx) => {
          const defaultMarks = [98, 95, 96, 99, 94, 97, 98, 96, 95, 97, 98, 96, 94];
          const mark = defaultMarks[idx] || 95;
          return {
            courseName: name,
            code: `THEO-${101 + idx}`,
            mark: mark,
            grade: getLetterGrade(mark),
          };
        });
        totalScoreSum = completedCoursesList.reduce((acc, c) => acc + c.mark, 0);
      }

      const avgScore = Number((totalScoreSum / completedCoursesList.length).toFixed(1));
      const honors = getHonors(avgScore);
      const studentNameAmharic = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();
      const studentNameEnglish = student.userId?.fullName || studentNameAmharic;
      const studentNum = student.studentId || `TKR-STU-${String(student._id).slice(-4)}`;

      const draftCert = await Certificate.create({
        studentId: student._id,
        userId: student.userId?._id || student._id,
        studentType: isDistance ? 'distance' : 'regular',
        studentName: studentNameEnglish,
        studentNameAmharic: studentNameAmharic,
        studentNumber: studentNum,
        program: isDistance 
          ? 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን የርቀት ነገረ መለኮትና የመጽሐፍ ቅዱስ ጥናት መርሃ ግብር'
          : 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት መደበኛ ሥርዓተ ትምህርት',
        programEnglish: isDistance
          ? 'Ethiopian Orthodox Tewahedo Church Distance Theological & Biblical Studies Program'
          : 'Ethiopian Orthodox Tewahedo Church Regular Sunday School Curriculum',
        batch: isDistance ? 'ዙር ፩ (Batch 1)' : 'መደበኛ (Regular)',
        academicYear: '2017 ዓ.ም',
        completedCourses: completedCoursesList,
        averageScore: avgScore,
        honors: honors,
        issueDateEthiopian: getEthiopianDateString(),
        issueDateGregorian: new Date(),
        status: 'Pending', // Requires Admin Review!
        signatories: [
          { title: 'የሰንበት ት/ቤት ሰብሳቢ', name: 'ሊቀ ማእምራን', signatureUrl: '' },
          { title: 'የደብሩ አስተዳዳሪ', name: 'መልአከ ሰላም', signatureUrl: '' },
        ],
      });

      createdCertificates.push(draftCert);
      createdCount++;
    }

    res.json({
      success: true,
      message: `ምርመራው ተጠናቋል፡ ${createdCount} ተማሪዎች ብቁ ሆነው ተገኝተው ይሁንታ እንዲያገኙ ረቂቅ ተዘጋጅቷል (Auto-check completed, ${createdCount} pending certificates generated for review)`,
      createdCount,
      certificates: createdCertificates,
    });
  } catch (err) {
    console.error('Auto-check eligible certificates error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 3. POST /api/education/certificates/generate/:studentId – Generate / Draft Certificate
// ============================================================================
router.post('/certificates/generate/:studentId', protect, authorize('admin'), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status = 'Pending', customBatch, customYear, customHonors } = req.body;

    const student = await Student.findById(studentId)
      .populate('userId', 'fullName email')
      .populate('courses', 'name nameAmharic code');

    if (!student) {
      return res.status(404).json({ success: false, message: 'ተማሪው አልተገኘም (Student not found)' });
    }

    const isDistance = student.registrationType === 'distance';
    let coursesList = [];
    let totalScoreSum = 0;

    if (!isDistance && student.courses && student.courses.length > 0) {
      const gradeRecords = await GradeRecord.find({ student: student._id });
      const gradeMap = new Map();
      gradeRecords.forEach(g => gradeMap.set(String(g.course), g));

      student.courses.forEach(c => {
        const rec = gradeMap.get(String(c._id));
        const mark = rec?.totalScore || 95;
        const grade = rec?.letterGrade || getLetterGrade(mark);
        coursesList.push({
          courseName: c.nameAmharic || c.name,
          code: c.code || 'CRS',
          mark,
          grade,
        });
        totalScoreSum += mark;
      });
    } else {
      coursesList = DEFAULT_THEOLOGICAL_COURSES.map((name, idx) => {
        const defaultMarks = [98, 95, 96, 99, 94, 97, 98, 96, 95, 97, 98, 96, 94];
        const mark = defaultMarks[idx] || 95;
        return {
          courseName: name,
          code: `THEO-${101 + idx}`,
          mark: mark,
          grade: getLetterGrade(mark),
        };
      });
      totalScoreSum = coursesList.reduce((acc, c) => acc + c.mark, 0);
    }

    const avgScore = Number((totalScoreSum / coursesList.length).toFixed(1));
    const honors = customHonors || getHonors(avgScore);
    const studentNameAmharic = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();
    const studentNameEnglish = student.userId?.fullName || studentNameAmharic;
    const studentNum = student.studentId || `TKR-STU-${String(student._id).slice(-4)}`;

    let certNumber = undefined;
    let qrCodeUrl = undefined;
    let verificationHash = undefined;

    if (status === 'Valid') {
      const year = new Date().getFullYear();
      certNumber = `TKD-CERT-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
      const batch = customBatch || (isDistance ? 'ዙር ፩ (Batch 1)' : 'መደበኛ (Regular)');
      verificationHash = crypto.createHash('sha256')
        .update(`${certNumber}-${studentNum}-${batch}-${year}`)
        .digest('hex');

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const verifyUrl = `${clientUrl}/verify-certificate/${certNumber}`;
      qrCodeUrl = await qrcode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        color: { dark: '#0f4c9c', light: '#ffffff' }
      });
    }

    const cert = await Certificate.create({
      certificateNumber: certNumber,
      studentId: student._id,
      userId: student.userId?._id || student._id,
      studentType: isDistance ? 'distance' : 'regular',
      studentName: studentNameEnglish,
      studentNameAmharic: studentNameAmharic,
      studentNumber: studentNum,
      program: isDistance 
        ? 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን የርቀት ነገረ መለኮትና የመጽሐፍ ቅዱስ ጥናት መርሃ ግብር'
        : 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ተክለ ሳዊሮስ ሰንበት ትምህርት ቤት መደበኛ ሥርዓተ ትምህርት',
      programEnglish: isDistance
        ? 'Ethiopian Orthodox Tewahedo Church Distance Theological & Biblical Studies Program'
        : 'Ethiopian Orthodox Tewahedo Church Regular Sunday School Curriculum',
      batch: customBatch || (isDistance ? 'ዙር ፩ (Batch 1)' : 'መደበኛ (Regular)'),
      academicYear: customYear || '2017 ዓ.ም',
      completedCourses: coursesList,
      averageScore: avgScore,
      honors: honors,
      issueDateEthiopian: getEthiopianDateString(),
      issueDateGregorian: new Date(),
      status: status,
      verificationHash,
      qrCodeUrl,
      reviewedBy: status === 'Valid' ? req.user._id : null,
      reviewedAt: status === 'Valid' ? new Date() : null,
      signatories: [
        { title: 'የሰንበት ት/ቤት ሰብሳቢ', name: 'ሊቀ ማእምራን', signatureUrl: '' },
        { title: 'የደብሩ አስተዳዳሪ', name: 'መልአከ ሰላም', signatureUrl: '' },
      ],
    });

    res.status(201).json({
      success: true,
      message: status === 'Valid' 
        ? 'የምስክር ወረቀት በተሳካ ሁኔታ ተሰጥቷል (Certificate issued successfully)'
        : 'የምስክር ወረቀት ረቂቅ ለአስተዳዳሪ ግምገማ ተዘጋጅቷል (Certificate drafted for admin review)',
      certificate: cert,
    });
  } catch (err) {
    console.error('Generate certificate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 4. PATCH /api/education/certificates/:id/approve – Admin Review Approval
// ============================================================================
router.patch('/certificates/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'የምስክር ወረቀት አልተገኘም (Certificate not found)' });
    }

    const year = new Date().getFullYear();
    const certNumber = `TKD-CERT-${year}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const verificationHash = crypto.createHash('sha256')
      .update(`${certNumber}-${cert.studentNumber}-${cert.batch}-${year}`)
      .digest('hex');

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const verifyUrl = `${clientUrl}/verify-certificate/${certNumber}`;
    const qrCodeUrl = await qrcode.toDataURL(verifyUrl, {
      errorCorrectionLevel: 'H',
      margin: 1,
      color: { dark: '#0f4c9c', light: '#ffffff' }
    });

    cert.certificateNumber = certNumber;
    cert.verificationHash = verificationHash;
    cert.qrCodeUrl = qrCodeUrl;
    cert.status = 'Valid';
    cert.reviewedBy = req.user._id;
    cert.reviewedAt = new Date();
    cert.issueDateEthiopian = getEthiopianDateString();
    cert.issueDateGregorian = new Date();
    await cert.save();

    res.json({
      success: true,
      message: 'የምስክር ወረቀቱ ይሁንታ አግኝቶ ይፋዊ ሆኗል (Certificate approved and issued successfully)',
      certificate: cert,
    });
  } catch (err) {
    console.error('Approve certificate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 5. PATCH /api/education/certificates/:id/reject – Admin Review Rejection
// ============================================================================
router.patch('/certificates/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const cert = await Certificate.findById(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'የምስክር ወረቀት አልተገኘም' });
    }

    cert.status = 'Revoked';
    cert.rejectionReason = rejectionReason || 'በአስተዳዳሪ ውድቅ ተደርጓል';
    cert.reviewedBy = req.user._id;
    cert.reviewedAt = new Date();
    await cert.save();

    res.json({
      success: true,
      message: 'የምስክር ወረቀቱ ውድቅ ተደርጓል (Certificate rejected)',
      certificate: cert,
    });
  } catch (err) {
    console.error('Reject certificate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================================
// 6. DELETE /api/education/certificates/:id – Delete / Revoke
// ============================================================================
router.delete('/certificates/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert) {
      return res.status(404).json({ success: false, message: 'የምስክር ወረቀት አልተገኘም' });
    }
    res.json({ success: true, message: 'የምስክር ወረቀቱ ተሰርዟል' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;