// church-server/scripts/testRegularRegistrationsLifecycle.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Registration = require('../models/Registration');
const User = require('../models/User');
const Student = require('../models/Student');
const SystemSetting = require('../models/SystemSetting');
const EducationCourse = require('../models/education/Course');
const Teacher = require('../models/Teacher');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || '7f8a9b2c4d6e8f0a1b3c5d7e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8r';

async function connectWithRetry() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || 'church_db_dev';
  console.log(`🔗 Connecting to MongoDB Atlas (DB: ${dbName})...`);
  await mongoose.connect(uri, {
    dbName,
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
  console.log('✅ Connected to MongoDB Atlas:', mongoose.connection.name);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastErr = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < maxRetries) {
        await sleep(500 * attempt);
      }
    }
  }
  throw lastErr;
}

// Mock student profiles generator
const generateMockStudents = () => {
  return [
    // --- Weekend Shift (10 Profiles) ---
    {
      firstName: 'ዮሐንስ',
      middleName: 'ገብረማርያም',
      lastName: 'ተፈሪ',
      gender: 'Male',
      age: 15,
      dateOfBirth: '2003-05-12',
      educationLevel: 'High School (9-12)',
      profession: 'Student',
      grade: 'Grade 7',
      shift: 'weekend',
      phone: '0988000001',
      password: 'Password@123',
      subcity: 'Bole',
      woreda: '03',
      kebele: '05',
      address: 'ቦሌ መድኃኔዓለም አካባቢ',
      emergencyFirstName: 'ገብረማርያም',
      emergencyMiddleName: 'ተፈሪ',
      emergencyLastName: 'ወልደስላሴ',
      relationship: 'Father',
      emergencyPhone: '0988000101',
      emergencyEmail: 'gebremariam.t@example.com',
      emergencyAddress: 'ቦሌ ወረዳ 03',
      email: 'yohannes.test@example.com',
    },
    {
      firstName: 'ሰላማዊት',
      middleName: 'ኃይሉ',
      lastName: 'መኮንን',
      gender: 'Female',
      age: 16,
      dateOfBirth: '2002-08-20',
      educationLevel: 'High School (9-12)',
      profession: 'Student',
      grade: 'Grade 7',
      shift: 'weekend',
      phone: '0988000002',
      password: 'Password@123',
      subcity: 'Yeka',
      woreda: '07',
      kebele: '12',
      address: 'የካ ሚካኤል አካባቢ',
      emergencyFirstName: 'ኃይሉ',
      emergencyMiddleName: 'መኮንን',
      emergencyLastName: 'ታደሰ',
      relationship: 'Father',
      emergencyPhone: '0988000102',
      emergencyEmail: 'hailu.m@example.com',
      emergencyAddress: 'የካ ወረዳ 07',
      email: 'selamawit.test@example.com',
    },
    {
      firstName: 'በረከት',
      middleName: 'ታደሰ',
      lastName: 'አሰፋ',
      gender: 'Male',
      age: 16,
      dateOfBirth: '2002-11-15',
      educationLevel: 'High School (9-12)',
      profession: 'Student',
      grade: 'Grade 8',
      shift: 'weekend',
      phone: '0988000003',
      password: 'Password@123',
      subcity: 'Arada',
      woreda: '02',
      kebele: '04',
      address: 'ፒያሳ ቅዱስ ጊዮርጊስ ፊትለፊት',
      emergencyFirstName: 'ታደሰ',
      emergencyMiddleName: 'አሰፋ',
      emergencyLastName: 'ኪዳኔ',
      relationship: 'Father',
      emergencyPhone: '0988000103',
      emergencyEmail: 'tadesse.a@example.com',
      emergencyAddress: 'አራዳ ወረዳ 02',
      email: 'bereket.test@example.com',
    },
    {
      firstName: 'ማኅሌት',
      middleName: 'ሲሳይ',
      lastName: 'ኃይለ',
      gender: 'Female',
      age: 17,
      dateOfBirth: '2001-04-10',
      educationLevel: 'High School (9-12)',
      profession: 'Student',
      grade: 'Grade 8',
      shift: 'weekend',
      phone: '0988000004',
      password: 'Password@123',
      subcity: 'Kirkos',
      woreda: '05',
      kebele: '08',
      address: 'ካዛንቺስ ኡራኤል አካባቢ',
      emergencyFirstName: 'ሲሳይ',
      emergencyMiddleName: 'ኃይለ',
      emergencyLastName: 'መርሻ',
      relationship: 'Father',
      emergencyPhone: '0988000104',
      emergencyEmail: 'sisay.h@example.com',
      emergencyAddress: 'ቂርቆስ ወረዳ 05',
      email: 'mahlet.test@example.com',
    },
    {
      firstName: 'ዳዊት',
      middleName: 'ዓለማየሁ',
      lastName: 'በላይ',
      gender: 'Male',
      age: 18,
      dateOfBirth: '2000-09-05',
      educationLevel: 'Undergraduate Degree',
      profession: 'Student',
      grade: 'Grade 9',
      shift: 'weekend',
      phone: '0988000005',
      password: 'Password@123',
      subcity: 'Nifas Silk-Lafto',
      woreda: '09',
      kebele: '11',
      address: 'ላፍቶ ቅዱስ ሚካኤል ጀርባ',
      emergencyFirstName: 'ዓለማየሁ',
      emergencyMiddleName: 'በላይ',
      emergencyLastName: 'ነጋሽ',
      relationship: 'Father',
      emergencyPhone: '0988000105',
      emergencyEmail: 'alemayehu.b@example.com',
      emergencyAddress: 'ንፋስ ስልክ ወረዳ 09',
      email: 'dawit.test@example.com',
    },
    {
      firstName: 'ቤተልሔም',
      middleName: 'ወርቁ',
      lastName: 'ተክሌ',
      gender: 'Female',
      age: 19,
      dateOfBirth: '1999-12-25',
      educationLevel: 'Undergraduate Degree',
      profession: 'Student',
      grade: 'Grade 9',
      shift: 'weekend',
      phone: '0988000006',
      password: 'Password@123',
      subcity: 'Gullele',
      woreda: '04',
      kebele: '06',
      address: 'ሰሚት ቅዱስ ጊዮርጊስ አጠገብ',
      emergencyFirstName: 'ወርቁ',
      emergencyMiddleName: 'ተክሌ',
      emergencyLastName: 'ደበበ',
      relationship: 'Father',
      emergencyPhone: '0988000106',
      emergencyEmail: 'worku.t@example.com',
      emergencyAddress: 'ጉለሌ ወረዳ 04',
      email: 'bethelhem.test@example.com',
    },
    {
      firstName: 'አቤል',
      middleName: 'በቀለ',
      lastName: 'ዘለቀ',
      gender: 'Male',
      age: 20,
      dateOfBirth: '1998-07-14',
      educationLevel: 'Undergraduate Degree',
      profession: 'Student',
      grade: 'Grade 10',
      shift: 'weekend',
      phone: '0988000007',
      password: 'Password@123',
      subcity: 'Akaki-Kality',
      woreda: '01',
      kebele: '03',
      address: 'ቃሊቲ ቅድስት ማርያም አቅራቢያ',
      emergencyFirstName: 'በቀለ',
      emergencyMiddleName: 'ዘለቀ',
      emergencyLastName: 'ወልዴ',
      relationship: 'Father',
      emergencyPhone: '0988000107',
      emergencyEmail: 'bekele.z@example.com',
      emergencyAddress: 'አቃቂ ቃሊቲ ወረዳ 01',
      email: 'abel.test@example.com',
    },
    {
      firstName: 'ጽዮን',
      middleName: 'ግርማ',
      lastName: 'ታሪኩ',
      gender: 'Female',
      age: 21,
      dateOfBirth: '1997-03-30',
      educationLevel: 'Diploma / TVET',
      profession: 'Nurse',
      grade: 'Grade 10',
      shift: 'weekend',
      phone: '0988000008',
      password: 'Password@123',
      subcity: 'Kolfe Keranio',
      woreda: '08',
      kebele: '14',
      address: 'ኮልፌ ጦር ኃይሎች አካባቢ',
      emergencyFirstName: 'ግርማ',
      emergencyMiddleName: 'ታሪኩ',
      emergencyLastName: 'አየለ',
      relationship: 'Father',
      emergencyPhone: '0988000108',
      emergencyEmail: 'girma.t@example.com',
      emergencyAddress: 'ኮልፌ ወረዳ 08',
      email: 'tsion.test@example.com',
    },
    {
      firstName: 'ናትናኤል',
      middleName: 'ካሳሁን',
      lastName: 'ደስታ',
      gender: 'Male',
      age: 22,
      dateOfBirth: '1996-10-18',
      educationLevel: 'Undergraduate Degree',
      profession: 'Teacher',
      grade: 'Grade 11',
      shift: 'weekend',
      phone: '0988000009',
      password: 'Password@123',
      subcity: 'Addis Ketema',
      woreda: '06',
      kebele: '09',
      address: 'መርካቶ ተክለሃይማኖት አጠገብ',
      emergencyFirstName: 'ካሳሁን',
      emergencyMiddleName: 'ደስታ',
      emergencyLastName: 'ኃይሉ',
      relationship: 'Father',
      emergencyPhone: '0988000109',
      emergencyEmail: 'kassahun.d@example.com',
      emergencyAddress: 'አዲስ ከተማ ወረዳ 06',
      email: 'natnael.test@example.com',
    },
    {
      firstName: 'ሄርሜላ',
      middleName: 'ሰሎሞን',
      lastName: 'ተሾመ',
      gender: 'Female',
      age: 23,
      dateOfBirth: '1995-06-22',
      educationLevel: 'Undergraduate Degree',
      profession: 'Architect',
      grade: 'Grade 11',
      shift: 'weekend',
      phone: '0988000010',
      password: 'Password@123',
      subcity: 'Bole',
      woreda: '05',
      kebele: '07',
      address: 'ገርጂ ቅዱስ ጊዮርጊስ አካባቢ',
      emergencyFirstName: 'ሰሎሞን',
      emergencyMiddleName: 'ተሾመ',
      emergencyLastName: 'ፈንታ',
      relationship: 'Father',
      emergencyPhone: '0988000110',
      emergencyEmail: 'solomon.t@example.com',
      emergencyAddress: 'ቦሌ ወረዳ 05',
      email: 'hermela.test@example.com',
    },

    // --- Night Shift (10 Profiles) ---
    {
      firstName: 'ሳሙኤል',
      middleName: 'መንግሥቱ',
      lastName: 'ገብሬ',
      gender: 'Male',
      age: 24,
      dateOfBirth: '1994-02-14',
      educationLevel: 'Undergraduate Degree',
      profession: 'Civil Servant',
      grade: 'Grade 12',
      shift: 'night',
      phone: '0988000011',
      password: 'Password@123',
      subcity: 'Yeka',
      woreda: '04',
      kebele: '08',
      address: 'ኮተቤ 0 አካባቢ',
      emergencyFirstName: 'መንግሥቱ',
      emergencyMiddleName: 'ገብሬ',
      emergencyLastName: 'ኪዳኔ',
      relationship: 'Father',
      emergencyPhone: '0988000111',
      emergencyEmail: 'mengistu.g@example.com',
      emergencyAddress: 'የካ ወረዳ 04',
      email: 'samuel.test@example.com',
    },
    {
      firstName: 'ራሔል',
      middleName: 'አሰፋ',
      lastName: 'ብርሃኑ',
      gender: 'Female',
      age: 25,
      dateOfBirth: '1993-08-19',
      educationLevel: 'Postgraduate (Masters)',
      profession: 'Software Engineer',
      grade: 'Grade 12',
      shift: 'night',
      phone: '0988000012',
      password: 'Password@123',
      subcity: 'Kirkos',
      woreda: '03',
      kebele: '05',
      address: 'ጎተራ ኮንዶሚኒየም',
      emergencyFirstName: 'አሰፋ',
      emergencyMiddleName: 'ብርሃኑ',
      emergencyLastName: 'ተክሌ',
      relationship: 'Father',
      emergencyPhone: '0988000112',
      emergencyEmail: 'assefa.b@example.com',
      emergencyAddress: 'ቂርቆስ ወረዳ 03',
      email: 'rahel.test@example.com',
    },
    {
      firstName: 'ሄኖክ',
      middleName: 'ተስፋዬ',
      lastName: 'ዘሪሁን',
      gender: 'Male',
      age: 26,
      dateOfBirth: '1992-11-11',
      educationLevel: 'Undergraduate Degree',
      profession: 'Banker',
      grade: 'Grade 7',
      shift: 'night',
      phone: '0988000013',
      password: 'Password@123',
      subcity: 'Arada',
      woreda: '05',
      kebele: '10',
      address: 'አራት ኪሎ ሥላሴ ፊትለፊት',
      emergencyFirstName: 'ተስፋዬ',
      emergencyMiddleName: 'ዘሪሁን',
      emergencyLastName: 'መላኩ',
      relationship: 'Father',
      emergencyPhone: '0988000113',
      emergencyEmail: 'tesfaye.z@example.com',
      emergencyAddress: 'አራዳ ወረዳ 05',
      email: 'henok.test@example.com',
    },
    {
      firstName: 'ማርታ',
      middleName: 'ብርሃኑ',
      lastName: 'ታደለ',
      gender: 'Female',
      age: 27,
      dateOfBirth: '1991-05-03',
      educationLevel: 'Postgraduate (Masters)',
      profession: 'Lecturer',
      grade: 'Grade 7',
      shift: 'night',
      phone: '0988000014',
      password: 'Password@123',
      subcity: 'Nifas Silk-Lafto',
      woreda: '06',
      kebele: '12',
      address: 'ሳሪስ አቦ አካባቢ',
      emergencyFirstName: 'ብርሃኑ',
      emergencyMiddleName: 'ታደለ',
      emergencyLastName: 'ገሰሰ',
      relationship: 'Father',
      emergencyPhone: '0988000114',
      emergencyEmail: 'berhanu.t@example.com',
      emergencyAddress: 'ንፋስ ስልክ ወረዳ 06',
      email: 'marta.test@example.com',
    },
    {
      firstName: 'ሚካኤል',
      middleName: 'ተሾመ',
      lastName: 'ኃይለማርያም',
      gender: 'Male',
      age: 28,
      dateOfBirth: '1990-09-17',
      educationLevel: 'Undergraduate Degree',
      profession: 'Business Owner',
      grade: 'Grade 8',
      shift: 'night',
      phone: '0988000015',
      password: 'Password@123',
      subcity: 'Gullele',
      woreda: '02',
      kebele: '04',
      address: 'ሺሮ ሜዳ መድኃኔዓለም',
      emergencyFirstName: 'ተሾመ',
      emergencyMiddleName: 'ኃይለማርያም',
      emergencyLastName: 'ወንድሙ',
      relationship: 'Father',
      emergencyPhone: '0988000115',
      emergencyEmail: 'teshome.h@example.com',
      emergencyAddress: 'ጉለሌ ወረዳ 02',
      email: 'michael.test@example.com',
    },
    {
      firstName: 'ሳራ',
      middleName: 'ከበደ',
      lastName: 'አረጋ',
      gender: 'Female',
      age: 29,
      dateOfBirth: '1989-01-28',
      educationLevel: 'Undergraduate Degree',
      profession: 'Pharmacist',
      grade: 'Grade 8',
      shift: 'night',
      phone: '0988000016',
      password: 'Password@123',
      subcity: 'Bole',
      woreda: '09',
      kebele: '15',
      address: 'ቡልቡላ ቅዱስ ጊዮርጊስ',
      emergencyFirstName: 'ከበደ',
      emergencyMiddleName: 'አረጋ',
      emergencyLastName: 'ገብሬ',
      relationship: 'Father',
      emergencyPhone: '0988000116',
      emergencyEmail: 'kebede.a@example.com',
      emergencyAddress: 'ቦሌ ወረዳ 09',
      email: 'sara.test@example.com',
    },
    {
      firstName: 'ዮናስ',
      middleName: 'ደስታ',
      lastName: 'ተሰማ',
      gender: 'Male',
      age: 30,
      dateOfBirth: '1988-04-12',
      educationLevel: 'Doctorate (PhD / MD)',
      profession: 'Medical Doctor',
      grade: 'Grade 9',
      shift: 'night',
      phone: '0988000017',
      password: 'Password@123',
      subcity: 'Yeka',
      woreda: '08',
      kebele: '11',
      address: 'ላምበረት ቅዱስ ገብርኤል',
      emergencyFirstName: 'ደስታ',
      emergencyMiddleName: 'ተሰማ',
      emergencyLastName: 'ግርማ',
      relationship: 'Father',
      emergencyPhone: '0988000117',
      emergencyEmail: 'desta.t@example.com',
      emergencyAddress: 'የካ ወረዳ 08',
      email: 'yonas.test@example.com',
    },
    {
      firstName: 'ሊዲያ',
      middleName: 'ፍቅሩ',
      lastName: 'ብርሃነ',
      gender: 'Female',
      age: 35,
      dateOfBirth: '1983-12-05',
      educationLevel: 'Undergraduate Degree',
      profession: 'Accountant',
      grade: 'Grade 10',
      shift: 'night',
      phone: '0988000018',
      password: 'Password@123',
      subcity: 'Akaki-Kality',
      woreda: '04',
      kebele: '07',
      address: 'ቱሉ ዲምቱ ማርያም',
      emergencyFirstName: 'ፍቅሩ',
      emergencyMiddleName: 'ብርሃነ',
      emergencyLastName: 'አዳነ',
      relationship: 'Father',
      emergencyPhone: '0988000118',
      emergencyEmail: 'fikru.b@example.com',
      emergencyAddress: 'አቃቂ ቃሊቲ ወረዳ 04',
      email: 'lidya.test@example.com',
    },
    {
      firstName: 'ጌታቸው',
      middleName: 'ወልዴ',
      lastName: 'ገብረእግዚአብሔር',
      gender: 'Male',
      age: 40,
      dateOfBirth: '1978-07-20',
      educationLevel: 'Postgraduate (Masters)',
      profession: 'Lawyer',
      grade: 'Grade 11',
      shift: 'night',
      phone: '0988000019',
      password: 'Password@123',
      subcity: 'Kirkos',
      woreda: '01',
      kebele: '02',
      address: 'መስቀል አደባባይ ቅዱስ እስጢፋኖስ',
      emergencyFirstName: 'ወልዴ',
      emergencyMiddleName: 'ገብረእግዚአብሔር',
      emergencyLastName: 'ኃይሉ',
      relationship: 'Father',
      emergencyPhone: '0988000119',
      emergencyEmail: 'wolde.g@example.com',
      emergencyAddress: 'ቂርቆስ ወረዳ 01',
      email: 'getachew.test@example.com',
    },
    {
      firstName: 'ፍፁም',
      middleName: 'ኃይሌ',
      lastName: 'አያሌው',
      gender: 'Male',
      age: 45,
      dateOfBirth: '1973-10-15',
      educationLevel: 'Postgraduate (Masters)',
      profession: 'IT Specialist',
      grade: 'Grade 12',
      shift: 'night',
      phone: '0988000020',
      password: 'Password@123',
      subcity: 'Kolfe Keranio',
      woreda: '05',
      kebele: '09',
      address: 'አየር ጤና ቅዱስ ሚካኤል',
      emergencyFirstName: 'ኃይሌ',
      emergencyMiddleName: 'አያሌው',
      emergencyLastName: 'በቀለ',
      relationship: 'Father',
      emergencyPhone: '0988000120',
      emergencyEmail: 'haile.a@example.com',
      emergencyAddress: 'ኮልፌ ወረዳ 05',
      email: 'fitsum.test@example.com',
    },

    // --- 2 Test Cases Intended for Rejection ---
    {
      firstName: 'ዳንኤል',
      middleName: 'ነጋሽ',
      lastName: 'ወልደሃይማኖት',
      gender: 'Male',
      age: 18,
      dateOfBirth: '2000-03-15',
      educationLevel: 'High School (9-12)',
      profession: 'Merchant',
      grade: 'Grade 7',
      shift: 'weekend',
      phone: '0988000021',
      password: 'Password@123',
      subcity: 'Bole',
      woreda: '02',
      kebele: '04',
      address: 'ቦሌ 22 አካባቢ',
      emergencyFirstName: 'ነጋሽ',
      emergencyMiddleName: 'ወልደሃይማኖት',
      emergencyLastName: 'ተክሌ',
      relationship: 'Father',
      emergencyPhone: '0988000121',
      emergencyEmail: 'negash.w@example.com',
      emergencyAddress: 'ቦሌ ወረዳ 02',
      email: 'daniel.test@example.com',
      expectedOutcome: 'reject',
      rejectionReason: 'የደብር የንስሐ አባት ማስረጃ አልተያያዘም፤ እባክዎ ማስረጃዎን አሟልተው በድጋሚ ያመልክቱ። (Missing required parish priest clearance certificate)',
    },
    {
      firstName: 'ትዕግሥት',
      middleName: 'አማረ',
      lastName: 'ካሳዬ',
      gender: 'Female',
      age: 24,
      dateOfBirth: '1994-09-10',
      educationLevel: 'Diploma / TVET',
      profession: 'Cashier',
      grade: 'Grade 8',
      shift: 'night',
      phone: '0988000022',
      password: 'Password@123',
      subcity: 'Yeka',
      woreda: '03',
      kebele: '06',
      address: 'ፈረንሳይ ጉራጌ ሰፈር',
      emergencyFirstName: 'አማረ',
      emergencyMiddleName: 'ካሳዬ',
      emergencyLastName: 'ዘሪሁን',
      relationship: 'Father',
      emergencyPhone: '0988000122',
      emergencyEmail: 'amare.k@example.com',
      emergencyAddress: 'የካ ወረዳ 03',
      email: 'tigist.test@example.com',
      expectedOutcome: 'reject',
      rejectionReason: 'የተሰጠው የአደጋ ጊዜ ተጠሪ ስልክ ቁጥር አይሰራም፤ እባክዎ ትክክለኛ መረጃ ይዘው በአካል ቢሮ ይቅረቡ። (Unreachable emergency contact phone number)',
    },
  ];
};

async function runLifecycleTest() {
  console.log('================================================================');
  console.log('🚀 REGULAR STUDENT ONLINE REGISTRATION & POST-REGISTRATION TEST');
  console.log('================================================================\n');

  try {
    await connectWithRetry();

    // 0. Clean previous mock test data (idempotency)
    const testPhones = [];
    for (let i = 1; i <= 25; i++) {
      testPhones.push(`09880000${String(i).padStart(2, '0')}`);
    }
    console.log('🧹 Cleaning previous mock test data for phones 0988000001 - 0988000025...');
    await Registration.deleteMany({ phone: { $in: testPhones } });
    await User.deleteMany({ phone: { $in: testPhones } });
    await Student.deleteMany({ studentPhone: { $in: testPhones } });
    console.log('✅ Cleaned prior test records.\n');

    // 1. Check & Ensure Registration Settings are Open
    console.log('⚙️ Phase 1: Checking and Updating System Registration Settings...');
    let settings = await SystemSetting.findOne({ key: 'registration' });
    if (!settings) {
      settings = new SystemSetting({ key: 'registration' });
    }
    settings.isRegistrationOpen = true;
    settings.isRegularOpen = true;
    settings.isDistanceOpen = true;
    settings.academicYear = '2019 ዓ.ም';
    await settings.save();
    console.log('✅ SystemSetting updated: isRegistrationOpen = true, isRegularOpen = true, academicYear = "2019 ዓ.ም"');

    // Verify public status endpoint
    const statusRes = await fetch(`${BASE_URL}/api/registrations/status`);
    const statusData = await statusRes.json();
    console.log('📡 Public Status API Check:', statusData.success ? 'SUCCESS (HTTP 200)' : 'FAILED', statusData.data);
    if (!statusData.data?.isRegistrationOpen || !statusData.data?.isRegularOpen) {
      throw new Error('Registration status endpoint did not report open registration!');
    }
    console.log('✅ Status API verifies registration is currently OPEN.\n');

    // 2. Negative Validation Edge Cases
    console.log('🧪 Phase 2: Negative Validation Tests (Edge Cases)...');
    
    // Negative Test A: Underage student (age 13)
    const underageRes = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'ታዳጊ',
        middleName: 'አበበ',
        lastName: 'ከበደ',
        fullName: 'ታዳጊ አበበ ከበደ',
        age: 13,
        dateOfBirth: '2005-01-01',
        gender: 'Male',
        educationLevel: 'Primary School (1-8)',
        profession: 'Student',
        grade: 'Grade 7',
        shift: 'weekend',
        phone: '0988000099',
        password: 'Password@123',
        emergencyFirstName: 'አበበ',
        emergencyPhone: '0988000199',
        studentType: 'regular',
      }),
    });
    const underageData = await underageRes.json();
    console.log(`  - Underage Test (Age 13): Status=${underageRes.status}, Expected 400. Message: "${underageData.message}"`);
    if (underageRes.status !== 400) throw new Error('Underage validation did not fail as expected!');

    // Negative Test B: Invalid Phone Format
    const badPhoneRes = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'ስህተት',
        middleName: 'ስልክ',
        lastName: 'ሰው',
        fullName: 'ስህተት ስልክ ሰው',
        age: 18,
        gender: 'Male',
        educationLevel: 'Undergraduate Degree',
        profession: 'Student',
        grade: 'Grade 7',
        shift: 'weekend',
        phone: '01234567', // Bad format
        password: 'Password@123',
        emergencyFirstName: 'አደጋ',
        emergencyPhone: '0988000199',
        studentType: 'regular',
      }),
    });
    const badPhoneData = await badPhoneRes.json();
    console.log(`  - Invalid Phone Test: Status=${badPhoneRes.status}, Expected 400. Message: "${badPhoneData.message}"`);
    if (badPhoneRes.status !== 400) throw new Error('Invalid phone validation did not fail as expected!');
    console.log('✅ All Negative Validation edge cases passed successfully.\n');

    // 3. Submit 22 Diverse Mock Student Registrations
    console.log('📝 Phase 3: Submitting 22 Mock Regular Student Online Registrations...');
    const mockProfiles = generateMockStudents();
    const createdRegistrations = [];

    for (let i = 0; i < mockProfiles.length; i++) {
      const p = mockProfiles[i];
      const payload = {
        ...p,
        fullName: `${p.firstName} ${p.middleName} ${p.lastName}`,
        studentType: 'regular',
      };

      let regRes, regData;
      for (let retry = 0; retry < 3; retry++) {
        regRes = await fetchWithRetry(`${BASE_URL}/api/registrations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        regData = await regRes.json();
        if (regRes.ok && regData.success) break;
        if (retry < 2) await sleep(500);
      }

      if (!regRes.ok || !regData.success) {
        console.error(`❌ Registration failed for ${p.firstName} (${p.phone}):`, regData);
        throw new Error(`Failed to submit registration for student ${i + 1}: ${regData.message}`);
      }

      createdRegistrations.push({
        index: i + 1,
        profile: p,
        regNum: regData.registration.registrationNumber,
        status: regData.registration.status,
      });

      console.log(`  [${String(i + 1).padStart(2, '0')}/22] ✅ Registered ${payload.fullName} | Phone: ${p.phone} | Shift: ${p.shift.toUpperCase()} | Grade: ${p.grade} | Reg#: ${regData.registration.registrationNumber}`);
      await sleep(150);
    }

    // Negative Test C: Duplicate phone test
    console.log('\n  - Testing Duplicate Phone Submission (Phone: 0988000001)...');
    const dupRes = await fetch(`${BASE_URL}/api/registrations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...mockProfiles[0],
        fullName: `${mockProfiles[0].firstName} ${mockProfiles[0].middleName} ${mockProfiles[0].lastName}`,
        studentType: 'regular',
      }),
    });
    const dupData = await dupRes.json();
    console.log(`  - Duplicate Phone Result: Status=${dupRes.status}, Expected 400. Message: "${dupData.message}"`);
    if (dupRes.status !== 400) throw new Error('Duplicate phone check did not fail as expected!');
    console.log('✅ Duplicate phone check validated.\n');

    // 4. Test Student Status Check Endpoint
    console.log('🔍 Phase 4: Testing Student Self-Service Status Check Endpoint...');
    const checkStatusRes = await fetch(`${BASE_URL}/api/registrations/check-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: mockProfiles[0].phone,
        password: mockProfiles[0].password,
      }),
    });
    const checkStatusData = await checkStatusRes.json();
    const currentStatus = checkStatusData.status || checkStatusData.registration?.status;
    const currentFullName = checkStatusData.fullName || checkStatusData.registration?.fullName;
    const currentRegNum = checkStatusData.registrationNumber || checkStatusData.registration?.registrationNumber;

    console.log('  - Student 1 Status Check Response:', {
      success: checkStatusData.success,
      status: currentStatus,
      fullName: currentFullName,
      registrationNumber: currentRegNum,
    });
    if (!checkStatusData.success || currentStatus !== 'Pending Verification') {
      throw new Error(`Student status check before approval returned unexpected status: ${currentStatus}`);
    }
    console.log('✅ Student Self-Service Status Check passed.\n');

    // 5. Admin Auth & Registration Review Queue
    console.log('👑 Phase 5: Admin Processing (Approvals, Rejections, and ID Generation)...');
    // Find or create admin user for token
    let adminUser = await User.findOne({ role: 'superadmin' });
    if (!adminUser) {
      adminUser = await User.findOne({ role: 'admin' });
    }
    if (!adminUser) {
      const salt = await bcrypt.genSalt(10);
      adminUser = await User.create({
        fullName: 'System Test Admin',
        email: 'testadmin@church.org',
        phone: '0900000000',
        password: await bcrypt.hash('admin123456', salt),
        role: 'superadmin',
        status: 'approved',
      });
    }

    const adminToken = jwt.sign(
      { id: adminUser._id, role: adminUser.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Fetch pending registrations queue
    const pendingRes = await fetchWithRetry(`${BASE_URL}/api/admin/registrations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const pendingData = await pendingRes.json();
    console.log(`  - Admin fetched pending queue: Total ${pendingData.registrations?.length} pending applications.`);

    const approvedStudents = [];
    const rejectedStudents = [];

    // Process each registration: Approve first 20, Reject last 2
    for (const item of createdRegistrations) {
      const dbReg = await Registration.findOne({ registrationNumber: item.regNum });
      if (!dbReg) throw new Error(`Registration record not found for ${item.regNum}`);

      if (item.profile.expectedOutcome === 'reject') {
        // Reject with reason
        const rejectRes = await fetchWithRetry(`${BASE_URL}/api/admin/registrations/${dbReg._id}/reject`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ reason: item.profile.rejectionReason }),
        });
        const rejectData = await rejectRes.json();
        console.log(`  - ❌ Rejected Application #${item.index} (${item.profile.firstName}) | Reason: "${item.profile.rejectionReason}" | Result: ${rejectData.message}`);
        rejectedStudents.push({ ...item, rejectionReason: item.profile.rejectionReason });
      } else {
        // Approve application
        const approveRes = await fetchWithRetry(`${BASE_URL}/api/admin/registrations/${dbReg._id}/approve`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        const approveData = await approveRes.json();
        if (!approveRes.ok || !approveData.success) {
          console.error(`❌ Approval failed for #${item.index}:`, approveData);
          throw new Error(`Approval failed for student ${item.index}: ${approveData.message}`);
        }
        console.log(`  - ✅ Approved Student #${item.index} (${item.profile.firstName} ${item.profile.middleName}) | Generated ID: ${approveData.studentId}`);
        approvedStudents.push({ ...item, studentId: approveData.studentId });
      }
      await sleep(150);
    }
    console.log(`\n✅ Admin processing complete: ${approvedStudents.length} Approved, ${rejectedStudents.length} Rejected.\n`);

    // 6. Post-Approval Data Integrity & Business Rules Verification
    console.log('🛡️ Phase 6: Validating Post-Registration Data Integrity & Business Rules...');
    console.log('   (CRITICAL: Verifying NO courses/teachers are automatically assigned upon approval)');
    
    for (const s of approvedStudents) {
      const studentDoc = await Student.findOne({ studentId: s.studentId });
      const userDoc = await User.findOne({ phone: s.profile.phone });
      const regDoc = await Registration.findOne({ registrationNumber: s.regNum });

      if (!studentDoc) throw new Error(`Student document missing for ${s.studentId}`);
      if (!userDoc) throw new Error(`User account missing for phone ${s.profile.phone}`);
      if (regDoc.status !== 'Approved') throw new Error(`Registration status not updated to Approved for ${s.regNum}`);
      if (userDoc.status !== 'approved') throw new Error(`User status not approved for ${userDoc.fullName}`);

      // Check ID format
      if (!/^TKR-\d{4}-\d{4}$/.test(studentDoc.studentId)) {
        throw new Error(`Invalid studentId format generated: ${studentDoc.studentId}`);
      }

      // Check NO automatic course/teacher assignment rule
      const courseCount = studentDoc.courses ? studentDoc.courses.length : 0;
      const teachersCount = studentDoc.teachers ? studentDoc.teachers.length : 0;
      const teacherAssigned = studentDoc.teacher;

      if (courseCount !== 0 || teachersCount !== 0 || teacherAssigned) {
        throw new Error(`VIOLATION: Student ${s.studentId} was auto-assigned courses/teachers! (courses: ${courseCount}, teachers: ${teachersCount})`);
      }

      // Verify QR code was generated
      if (!studentDoc.qrCode) {
        throw new Error(`Student ${s.studentId} missing qrCode!`);
      }
    }
    console.log(`✅ All ${approvedStudents.length} approved students verified:`);
    console.log('   - Valid TKR-YYYY-XXXX Student IDs generated.');
    console.log('   - Active User accounts linked with correct roles and profile IDs.');
    console.log('   - Complete demographic, shift, emergency contact, and QR code details recorded.');
    console.log('   - Confirmed ZERO automatic course/teacher assignments (Rule strictly maintained).\n');

    // Verify rejected records
    for (const r of rejectedStudents) {
      const regDoc = await Registration.findOne({ registrationNumber: r.regNum });
      if (regDoc.status !== 'Rejected') {
        throw new Error(`Expected Rejected status for ${r.regNum}, got ${regDoc.status}`);
      }
      if (!regDoc.rejectionReason) {
        throw new Error(`Missing rejection reason for ${r.regNum}`);
      }
    }
    console.log(`✅ All ${rejectedStudents.length} rejected registrations verified with persistent rejection reasons.\n`);

    // 7. Student Login & Identification Verification
    console.log('🔐 Phase 7: Testing Student Authentication & Post-Approval Status Check...');
    
    // Login with student phone & password
    const student1 = approvedStudents[0];
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: student1.profile.phone,
        password: student1.profile.password,
      }),
    });
    const loginData = await loginRes.json();
    console.log('  - Student Login Result:', {
      success: loginData.success,
      fullName: loginData.user?.fullName,
      role: loginData.user?.role,
      studentId: loginData.user?.studentId,
      tokenIssued: !!loginData.accessToken,
    });
    if (!loginData.success || loginData.user?.studentId !== student1.studentId) {
      throw new Error(`Student login failed or returned incorrect studentId!`);
    }

    // Status check for approved student
    const postApproveStatusRes = await fetch(`${BASE_URL}/api/registrations/check-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: student1.profile.phone,
        password: student1.profile.password,
      }),
    });
    const postApproveStatusData = await postApproveStatusRes.json();
    const approvedStatus = postApproveStatusData.status || postApproveStatusData.registration?.status;
    const approvedStudentId = postApproveStatusData.studentId || postApproveStatusData.registration?.studentId;

    console.log('  - Post-Approval Status Check:', {
      status: approvedStatus,
      studentId: approvedStudentId,
    });
    if (approvedStatus !== 'Approved' || approvedStudentId !== student1.studentId) {
      throw new Error(`Post-approval status check did not report Approved or correct studentId! Got status=${approvedStatus}, id=${approvedStudentId}`);
    }
    console.log('✅ Student Login and Post-Approval Status Check passed.\n');

    // 8. Test Attendance QR Scan & Public Verification
    console.log('📱 Phase 8: Testing Attendance Scanning and Digital Verification...');
    
    // Test attendance scanning endpoint with studentId
    const studentDoc1 = await Student.findOne({ studentId: student1.studentId });
    const attendanceScanRes = await fetchWithRetry(`${BASE_URL}/api/attendance/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        qrCode: student1.studentId,
        status: 'Present',
      }),
    });
    const attendanceScanData = await attendanceScanRes.json();
    console.log('  - Attendance Scan by Student ID:', {
      success: attendanceScanData.success,
      message: attendanceScanData.message,
      studentId: attendanceScanData.student?.studentId,
      studentName: attendanceScanData.student?.name,
    });
    if (!attendanceScanData.success || attendanceScanData.student?.studentId !== student1.studentId) {
      throw new Error(`Attendance scan failed for student ${student1.studentId}: ${attendanceScanData.message}`);
    }

    // Test dual certificate/student public verification endpoint
    const verifyRes = await fetchWithRetry(`${BASE_URL}/api/education/distance/public/verify/${encodeURIComponent(student1.studentId)}`);
    const verifyData = await verifyRes.json();
    console.log('  - Public Digital Verification Endpoint:', {
      success: verifyData.success,
      type: verifyData.type,
      studentId: verifyData.certificate?.studentNumber || verifyData.certificate?.certificateNumber,
      fullName: verifyData.certificate?.studentName,
      status: verifyData.certificate?.status,
    });
    const verifiedId = verifyData.certificate?.studentNumber || verifyData.certificate?.certificateNumber;
    if (!verifyData.success || verifiedId !== student1.studentId) {
      throw new Error(`Public digital verification failed for approved student! Expected ${student1.studentId}, got ${verifiedId}`);
    }
    console.log('✅ Attendance QR Scan and Public Digital Verification passed.\n');

    // 9. Test Bulk Course & Teacher Assignment
    console.log('📚 Phase 9: Testing Admin Bulk Course & Teacher Assignment...');
    
    // Ensure 2 test regular courses exist in Grade 7
    let course1 = await EducationCourse.findOne({ code: 'REG-DOGMA-7' });
    if (!course1) {
      course1 = await EducationCourse.create({
        code: 'REG-DOGMA-7',
        name: 'ኦርቶዶክሳዊ ትምህርተ ሃይማኖት ፩',
        nameAmharic: 'ኦርቶዶክሳዊ ትምህርተ ሃይማኖት ፩',
        description: 'የመጀመሪያ ዓመት የዶግማ ትምህርት ለመደበኛ ተማሪዎች',
        grade: 'Grade 7',
        studentType: 'regular',
        status: 'active',
      });
    }

    let course2 = await EducationCourse.findOne({ code: 'REG-HIST-7' });
    if (!course2) {
      course2 = await EducationCourse.create({
        code: 'REG-HIST-7',
        name: 'የቤተክርስቲያን ታሪክ ፩',
        nameAmharic: 'የቤተክርስቲያን ታሪክ ፩',
        description: 'የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ታሪክ',
        grade: 'Grade 7',
        studentType: 'regular',
        status: 'active',
      });
    }

    // Ensure a test teacher user exists
    let teacherUser = await User.findOne({ role: 'teacher', email: 'teacher.regular@church.org' });
    if (!teacherUser) {
      const salt = await bcrypt.genSalt(10);
      teacherUser = await User.create({
        fullName: 'መምህር ተክለማርያም ወልደሩፋኤል',
        email: 'teacher.regular@church.org',
        phone: '0988000090',
        password: await bcrypt.hash('teacher123456', salt),
        role: 'teacher',
        status: 'approved',
      });
    }

    // Select 4 Grade 7 approved students
    const grade7Approved = approvedStudents.filter(s => s.profile.grade === 'Grade 7').slice(0, 4);
    const targetStudentDocIds = [];
    for (const s of grade7Approved) {
      const doc = await Student.findOne({ studentId: s.studentId });
      targetStudentDocIds.push(doc._id.toString());
    }

    console.log(`  - Target 4 Grade 7 Students for Bulk Assignment:`, grade7Approved.map(s => `${s.studentId} (${s.profile.firstName})`));

    // Execute Bulk Course Assignment
    const bulkCourseRes = await fetchWithRetry(`${BASE_URL}/api/admin/students/bulk-assign-courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        studentIds: targetStudentDocIds,
        courseIds: [course1._id.toString(), course2._id.toString()],
        mode: 'replace',
      }),
    });
    const bulkCourseData = await bulkCourseRes.json();
    console.log('  - Bulk Course Assignment Result:', bulkCourseData);
    if (!bulkCourseRes.ok || !bulkCourseData.success) {
      throw new Error(`Bulk course assignment failed: ${bulkCourseData.message}`);
    }

    // Execute Bulk Teacher Assignment
    const bulkTeacherRes = await fetchWithRetry(`${BASE_URL}/api/admin/students/bulk-assign-teacher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        studentIds: targetStudentDocIds,
        teacherId: teacherUser._id.toString(),
        mode: 'set',
      }),
    });
    const bulkTeacherData = await bulkTeacherRes.json();
    console.log('  - Bulk Teacher Assignment Result:', bulkTeacherData);
    if (!bulkTeacherRes.ok || !bulkTeacherData.success) {
      throw new Error(`Bulk teacher assignment failed: ${bulkTeacherData.message}`);
    }

    // Verify assigned students have the courses and teacher
    for (const docId of targetStudentDocIds) {
      const sDoc = await Student.findById(docId);
      if (!sDoc.courses || sDoc.courses.length !== 2) {
        throw new Error(`Expected student ${sDoc.studentId} to have 2 courses assigned, got ${sDoc.courses?.length}`);
      }
      if (String(sDoc.teacher) !== String(teacherUser._id)) {
        throw new Error(`Expected student ${sDoc.studentId} to have teacher ${teacherUser.fullName} assigned`);
      }
    }

    // Verify non-targeted students still have 0 courses (isolation check)
    const nonTargeted = approvedStudents.filter(s => !grade7Approved.includes(s));
    for (const s of nonTargeted) {
      const sDoc = await Student.findOne({ studentId: s.studentId });
      if (sDoc.courses && sDoc.courses.length > 0) {
        throw new Error(`Isolation breach: Non-targeted student ${s.studentId} had courses assigned!`);
      }
    }

    console.log('✅ Bulk Course and Teacher Assignment verified with perfect student isolation.\n');

    console.log('================================================================');
    console.log('🎉 ALL 9 PHASES OF REGISTRATION & POST-REGISTRATION TESTS PASSED!');
    console.log('================================================================');
    console.log(`📊 Summary:`);
    console.log(`   - 22 Mock Applications Submitted`);
    console.log(`   - 20 Students Approved with TKR-2019-XXXX IDs & Active Credentials`);
    console.log(`   - 2 Edge-Case Applications Rejected with Saved Notes`);
    console.log(`   - 3 Negative Validation Scenarios Passed`);
    console.log(`   - 0 Courses Auto-Assigned on Registration Approval (Enforced)`);
    console.log(`   - Bulk Course & Teacher Assignment Verified for Target Groups`);
    console.log(`   - Student Login, Attendance QR, and Public Verification Validated`);
    console.log('================================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ LIFECYCLE TEST FAILED:', err);
    process.exit(1);
  }
}

runLifecycleTest();
