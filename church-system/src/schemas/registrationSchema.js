import { z } from 'zod';

const phoneRegex = /^(?:\+251|0)?[79]\d{8}$|^\d{10}$/;

// Regex for strictly Amharic characters + whitespace + Ethiopic wordspace (፡)
// Rejecting English characters, numbers, and special characters
export const amharicTextRegex = /^[\u1200-\u135A\u135F\u1361\u2D80-\u2DDF\uAB00-\uAB2F\s]+$/;

export const amharicNameValidator = (fieldNameAm = 'ስም') =>
  z
    .string()
    .trim()
    .min(1, `${fieldNameAm} ግዴታ ነው`)
    .regex(amharicTextRegex, `${fieldNameAm} በአማርኛ ፊደላት ብቻ መሆን አለበት (እንግሊዝኛ ወይም ልዩ ምልክት አይፈቀድም)`);

export const optionalAmharicNameValidator = (fieldNameAm = 'ስም') =>
  z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || amharicTextRegex.test(val), {
      message: `${fieldNameAm} በአማርኛ ፊደላት ብቻ መሆን አለበት (እንግሊዝኛ ወይም ልዩ ምልክት አይፈቀድም)`,
    });

const optionalPhoneValidator = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((val) => !val || phoneRegex.test(val), {
    message: 'ትክክለኛ 10 አሃዝ ስልክ ቁጥር ያስገቡ',
  });

export const regularRegistrationSchema = z.object({
  firstName: amharicNameValidator('የመጀመሪያ ስም'),
  middleName: amharicNameValidator('የመካከለኛ ስም'),
  lastName: amharicNameValidator('የአያት ስም'),
  christianName: optionalAmharicNameValidator('የክርስትና ስም'),
  photoUrl: z
    .string()
    .optional()
    .or(z.literal('')),
  educationLevel: z
    .string()
    .trim()
    .min(1, 'የትምህርት ደረጃ ይምረጡ'),
  profession: z
    .string()
    .trim()
    .min(1, 'የሥራ ዘርፍ / ሙያ ይምረጡ'),
  gender: z
    .string()
    .default('Male'),
  age: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const n = Number(val);
      return !isNaN(n) && n > 14;
    }, {
      message: 'የተማሪ ዕድሜ ከ 14 ዓመት በላይ መሆን አለበት',
    }),
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .min(1, 'ስልክ ቁጥር ግዴታ ነው')
    .regex(phoneRegex, 'ትክክለኛ ስልክ ቁጥር ያስገቡ'),
  grade: z
    .string()
    .min(1, 'ክፍል ይምረጡ'),
  shift: z
    .string()
    .default('weekend'),
  // Confession Father
  hasConfessionFather: z
    .union([z.boolean(), z.string()])
    .default(false),
  confessionFatherName: optionalAmharicNameValidator('የንስሐ አባት ስም'),
  confessionFatherPhone: optionalPhoneValidator,
  // Address
  subcity: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  woreda: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  kebele: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('ትክክለኛ ኢሜይል ያስገቡ')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(6, 'የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት'),
  confirmPassword: z
    .string()
    .min(1, 'የይለፍ ቃል ማረጋገጫ ያስገቡ'),
  studentType: z
    .string()
    .default('regular'),
  // Emergency Contact
  emergencyContactPhoto: z
    .string()
    .optional()
    .or(z.literal('')),
  emergencyFirstName: amharicNameValidator('የአደጋ ጊዜ ተጠሪ የመጀመሪያ ስም'),
  emergencyMiddleName: optionalAmharicNameValidator('የአደጋ ጊዜ ተጠሪ የአባት ስም'),
  emergencyLastName: optionalAmharicNameValidator('የአደጋ ጊዜ ተጠሪ የአያት ስም'),
  relationship: z
    .string()
    .default('Father'),
  emergencyPhone: z
    .string()
    .trim()
    .min(1, 'የአደጋ ጊዜ ተጠሪ ስልክ ግዴታ ነው')
    .regex(phoneRegex, 'የአደጋ ጊዜ ተጠሪ ስልክ 10 አሃዝ መሆን አለበት'),
  emergencyEmail: z
    .string()
    .trim()
    .email('ትክክለኛ ኢሜይል ያስገቡ')
    .optional()
    .or(z.literal('')),
  emergencyAddress: z
    .string()
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'የይለፍ ቃሎቹ አይመሳሰሉም',
  path: ['confirmPassword'],
}).refine((data) => {
  const hasFather = data.hasConfessionFather === true || String(data.hasConfessionFather).toLowerCase() === 'true';
  if (hasFather) {
    return Boolean(data.confessionFatherName && data.confessionFatherName.trim().length > 0);
  }
  return true;
}, {
  message: 'የንስሐ አባት ስም ማስገባት ግዴታ ነው',
  path: ['confessionFatherName'],
});

export const distanceRegistrationSchema = z.object({
  firstName: amharicNameValidator('የመጀመሪያ ስም'),
  middleName: amharicNameValidator('የመካከለኛ ስም'),
  lastName: amharicNameValidator('የአያት ስም'),
  christianName: optionalAmharicNameValidator('የክርስትና ስም'),
  photoUrl: z
    .string()
    .optional()
    .or(z.literal('')),
  educationLevel: z
    .string()
    .trim()
    .min(1, 'የትምህርት ደረጃ ይምረጡ'),
  profession: z
    .string()
    .trim()
    .min(1, 'የሥራ ዘርፍ / ሙያ ይምረጡ'),
  gender: z
    .string()
    .default('Male'),
  age: z
    .union([z.string(), z.number()])
    .refine((val) => {
      const n = Number(val);
      return !isNaN(n) && n > 14;
    }, {
      message: 'የተማሪ ዕድሜ ከ 14 ዓመት በላይ መሆን አለበት',
    }),
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .min(1, 'ስልክ ቁጥር ግዴታ ነው')
    .regex(phoneRegex, 'ትክክለኛ ስልክ ቁጥር ያስገቡ'),
  // Confession Father
  hasConfessionFather: z
    .union([z.boolean(), z.string()])
    .default(false),
  confessionFatherName: optionalAmharicNameValidator('የንስሐ አባት ስም'),
  confessionFatherPhone: optionalPhoneValidator,
  // Address
  subcity: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  woreda: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  kebele: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('ትክክለኛ ኢሜይል ያስገቡ')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(6, 'የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት'),
  confirmPassword: z
    .string()
    .min(1, 'የይለፍ ቃል ማረጋገጫ ያስገቡ'),
  studentType: z
    .string()
    .default('distance'),
  // Emergency Contact
  emergencyContactPhoto: z
    .string()
    .optional()
    .or(z.literal('')),
  emergencyFirstName: amharicNameValidator('የአደጋ ጊዜ ተጠሪ የመጀመሪያ ስም'),
  emergencyMiddleName: optionalAmharicNameValidator('የአደጋ ጊዜ ተጠሪ የአባት ስም'),
  emergencyLastName: optionalAmharicNameValidator('የአደጋ ጊዜ ተጠሪ የአያት ስም'),
  relationship: z
    .string()
    .default('Father'),
  emergencyPhone: z
    .string()
    .trim()
    .min(1, 'የአደጋ ጊዜ ተጠሪ ስልክ ግዴታ ነው')
    .regex(phoneRegex, 'የአደጋ ጊዜ ተጠሪ ስልክ 10 አሃዝ መሆን አለበት'),
  emergencyEmail: z
    .string()
    .trim()
    .email('ትክክለኛ ኢሜይል ያስገቡ')
    .optional()
    .or(z.literal('')),
  emergencyAddress: z
    .string()
    .optional()
    .or(z.literal('')),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'የይለፍ ቃሎቹ አይመሳሰሉም',
  path: ['confirmPassword'],
}).refine((data) => {
  const hasFather = data.hasConfessionFather === true || String(data.hasConfessionFather).toLowerCase() === 'true';
  if (hasFather) {
    return Boolean(data.confessionFatherName && data.confessionFatherName.trim().length > 0);
  }
  return true;
}, {
  message: 'የንስሐ አባት ስም ማስገባት ግዴታ ነው',
  path: ['confessionFatherName'],
});

export const studentSelfRegisterSchema = z.object({
  fullName: amharicNameValidator('ሙሉ ስም'),
  christianName: optionalAmharicNameValidator('የክርስትና ስም'),
  photoUrl: z.string().optional().or(z.literal('')),
  gender: z.string().default('Male'),
  age: z
  .union([z.string(), z.number()])
  .refine((val) => {
    const n = Number(val);
    return !isNaN(n) && n > 14;
  }, {
    message: 'የተማሪ ዕድሜ ከ 14 ዓመት በላይ መሆን አለበት',
  }),
  dateOfBirth: z.string().optional().or(z.literal('')),
  shift: z.string().optional().or(z.literal('')),
  hasConfessionFather: z.union([z.boolean(), z.string()]).default(false),
  confessionFatherName: optionalAmharicNameValidator('የንስሐ አባት ስም'),
  confessionFatherPhone: optionalPhoneValidator,
  subcity: z.string().trim().optional().or(z.literal('')),
  woreda: z.string().trim().optional().or(z.literal('')),
  kebele: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().min(1, 'ስልክ ቁጥር ያስገቡ'),
  grade: z.string().default('Grade 7'),
  studentType: z.string().default('regular'),
  address: z.string().optional().or(z.literal('')),
  emergencyContactPhoto: z.string().optional().or(z.literal('')),
  parentName: optionalAmharicNameValidator('የወላጅ/ተጠሪ ስም'),
  parentPhone: z.string().optional().or(z.literal('')),
  parentEmail: z.string().optional().or(z.literal('')),
  email: z.string().trim().email('ትክክለኛ ኢሜይል ያስገቡ'),
  password: z.string().min(6, 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት'),
  confirmPassword: z.string().min(1, 'የይለፍ ቃል ማረጋገጫ ያስገቡ'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'የይለፍ ቃሎቹ አይመሳሰሉም',
  path: ['confirmPassword'],
}).refine((data) => {
  const hasFather = data.hasConfessionFather === true || String(data.hasConfessionFather).toLowerCase() === 'true';
  if (hasFather) {
    return Boolean(data.confessionFatherName && data.confessionFatherName.trim().length > 0);
  }
  return true;
}, {
  message: 'የንስሐ አባት ስም ማስገባት ግዴታ ነው',
  path: ['confessionFatherName'],
});
