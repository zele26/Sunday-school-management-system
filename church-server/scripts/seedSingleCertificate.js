const mongoose = require('mongoose');
const crypto = require('crypto');
const qrcode = require('qrcode');
require('dotenv').config();

require('../models/User');
const Certificate = require('../models/education/Certificate');
const Student = require('../models/Student');

async function seedCert() {
  await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
  const student = await Student.findOne({ studentId: 'TKR-2019-0001' }).populate('userId');
  if (!student) {
    console.log('Student not found');
    process.exit(1);
  }

  const certNumber = 'TKD-CERT-2017-0001';
  const batch = 'ዙር ፩ (Batch 1)';
  const academicYear = '2017 ዓ.ም';

  const verificationHash = crypto.createHash('sha256')
    .update(`${certNumber}-${student.studentId}-${batch}-2017`)
    .digest('hex');

  const verifyUrl = 'http://localhost:3000/verify-certificate/' + certNumber;
  const qrCodeDataUrl = await qrcode.toDataURL(verifyUrl, {
    errorCorrectionLevel: 'H',
    margin: 1,
    color: {
      dark: '#0f4c9c',
      light: '#ffffff'
    }
  });

  const courses = [
    { courseName: 'ትምህርተ ሃይማኖት', code: 'THEO-101', mark: 98, grade: 'A+' },
    { courseName: 'ሥነ-ፍጥረት', code: 'CREAT-102', mark: 95, grade: 'A' },
    { courseName: 'አምስቱ አዕማደ ምስጢራት', code: 'PILL-103', mark: 96, grade: 'A' },
    { courseName: 'ክርስቲያናዊ ሥነ-ምግባር', code: 'ETHIC-104', mark: 99, grade: 'A+' },
    { courseName: 'ሥርዓተ ቤተ ክርስቲያን', code: 'LITUR-105', mark: 94, grade: 'A' },
    { courseName: 'ምስጢራተ ቤተ ክርስቲያን', code: 'SACR-106', mark: 97, grade: 'A+' },
    { courseName: 'ነገረ ማርያም', code: 'MAR-107', mark: 98, grade: 'A+' },
    { courseName: 'ነገረ ክርስቶስ', code: 'CHRIS-108', mark: 96, grade: 'A' },
    { courseName: 'ነገረ ቅዱሳን', code: 'SAINT-109', mark: 95, grade: 'A' },
    { courseName: 'መጽሐፍ ቅዱስ ጥናት ፩ (ብሉይ ኪዳን)', code: 'BIB-110', mark: 97, grade: 'A+' },
    { courseName: 'መጽሐፍ ቅዱስ ጥናት ፪ (ሐዲስ ኪዳን)', code: 'BIB-111', mark: 98, grade: 'A+' },
    { courseName: 'የቤተ ክርስቲያን ታሪክ በኢትዮጵያ', code: 'HIST-112', mark: 96, grade: 'A' },
    { courseName: 'የቤተ ክርስቲያን ታሪክ በዓለም መድረክ', code: 'HIST-113', mark: 94, grade: 'A' }
  ];

  await Certificate.deleteMany({ studentId: student._id });

  const cert = await Certificate.create({
    certificateNumber: certNumber,
    studentId: student._id,
    userId: student.userId._id,
    studentName: 'Zelalem Gelaye',
    studentNameAmharic: 'ዘላለም ፍስሐ ገላዬ',
    studentNumber: student.studentId,
    program: 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን የርቀት ነገረ መለኮትና የመጽሐፍ ቅዱስ ጥናት መርሃ ግብር',
    programEnglish: 'Ethiopian Orthodox Tewahedo Church Distance Theological & Biblical Studies Program',
    batch: batch,
    academicYear: academicYear,
    completedCourses: courses,
    averageScore: 96.5,
    honors: 'በከፍተኛ ማዕረግ ተመርቋል (With High Distinction)',
    issueDateEthiopian: 'መስከረም ፲ ቀን ፳፻፲፯ ዓ.ም',
    issueDateGregorian: new Date(),
    verificationHash: verificationHash,
    qrCodeUrl: qrCodeDataUrl,
    status: 'Valid',
    signatories: [
      { title: 'የሰንበት ት/ቤት ሰብሳቢ', name: 'ሊቀ ማእምራን', signatureUrl: '' },
      { title: 'የደብሩ አስተዳዳሪ', name: 'መልአከ ሰላም', signatureUrl: '' }
    ]
  });

  console.log('Successfully created certificate:', cert.certificateNumber);
  process.exit(0);
}

seedCert().catch(err => {
  console.error(err);
  process.exit(1);
});
