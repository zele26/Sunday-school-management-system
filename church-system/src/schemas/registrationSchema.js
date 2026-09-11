import { z } from 'zod';

const phoneRegex = /^(?:\+251|0)?[79]\d{8}$|^\d{10}$/;

export const regularRegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'የመጀመሪያ ስም ግዴታ ነው'),
  middleName: z
    .string()
    .trim()
    .min(1, 'የመካከለኛ ስም ግዴታ ነው'),
  lastName: z
    .string()
    .trim()
    .min(1, 'የአያት ስም ግዴታ ነው'),
  educationLevel: z
    .string()
    .trim()
    .min(1, 'የትምህርት ደረጃ ይምረጡ'),
  profession: z
    .string()
    .trim()
    .min(1, 'ሙያ ያስገቡ'),
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
  emergencyFirstName: z
    .string()
    .trim()
    .min(1, 'የአደጋ ጊዜ ተጠሪ የመጀመሪያ ስም ግዴታ ነው'),
  emergencyMiddleName: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  emergencyLastName: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
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
});

export const distanceRegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'የመጀመሪያ ስም ግዴታ ነው'),
  middleName: z
    .string()
    .trim()
    .min(1, 'የመካከለኛ ስም ግዴታ ነው'),
  lastName: z
    .string()
    .trim()
    .min(1, 'የአያት ስም ግዴታ ነው'),
  educationLevel: z
    .string()
    .trim()
    .min(1, 'የትምህርት ደረጃ ይምረጡ'),
  profession: z
    .string()
    .trim()
    .min(1, 'ሙያ ያስገቡ'),
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
  emergencyFirstName: z
    .string()
    .trim()
    .min(1, 'የአደጋ ጊዜ ተጠሪ የመጀመሪያ ስም ግዴታ ነው'),
  emergencyMiddleName: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
  emergencyLastName: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
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
});

export const studentSelfRegisterSchema = z.object({
  fullName: z.string().trim().min(1, 'ሙሉ ስም ያስገቡ'),
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
  subcity: z.string().trim().optional().or(z.literal('')),
  woreda: z.string().trim().optional().or(z.literal('')),
  kebele: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().min(1, 'ስልክ ቁጥር ያስገቡ'),
  grade: z.string().default('Grade 7'),
  studentType: z.string().default('regular'),
  address: z.string().optional().or(z.literal('')),
  parentName: z.string().optional().or(z.literal('')),
  parentPhone: z.string().optional().or(z.literal('')),
  parentEmail: z.string().optional().or(z.literal('')),
  email: z.string().trim().email('ትክክለኛ ኢሜይል ያስገቡ'),
  password: z.string().min(6, 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት'),
  confirmPassword: z.string().min(1, 'የይለፍ ቃል ማረጋገጫ ያስገቡ'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'የይለፍ ቃሎቹ አይመሳሰሉም',
  path: ['confirmPassword'],
});
