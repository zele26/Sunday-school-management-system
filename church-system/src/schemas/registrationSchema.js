import { z } from 'zod';

const phoneRegex = /^(?:\+251|0)?[79]\d{8}$|^\d{10}$/;

export const regularRegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'የመጀመሪያ ስም ግዴታ ነው (First name is required)'),
  middleName: z
    .string()
    .trim()
    .min(1, 'የመካከለኛ ስም ግዴታ ነው (Middle name is required)'),
  lastName: z
    .string()
    .trim()
    .min(1, 'የአያት ስም ግዴታ ነው (Last name is required)'),
  educationLevel: z
    .string()
    .trim()
    .min(1, 'የትምህርት ደረጃ ይምረጡ (Education level is required)'),
  profession: z
    .string()
    .trim()
    .min(1, 'ሙያ ያስገቡ (Profession is required)'),
  gender: z
    .string()
    .default('Male'),
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .min(1, 'ስልክ ቁጥር ግዴታ ነው (Phone is required)')
    .regex(phoneRegex, 'ትክክለኛ ስልክ ቁጥር ያስገቡ (Valid 10-digit phone required)'),
  grade: z
    .string()
    .min(1, 'ክፍል ይምረጡ (Grade is required)'),
  address: z
    .string()
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('ትክክለኛ ኢሜይል ያስገቡ (Invalid email format)')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(6, 'የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት (Password must be at least 6 characters)'),
  studentType: z
    .string()
    .default('regular'),
  // Emergency Contact
  emergencyFirstName: z
    .string()
    .trim()
    .min(1, 'የአደጋ ጊዜ ተጠሪ የመጀመሪያ ስም ግዴታ ነው (Emergency contact first name is required)'),
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
    .min(1, 'የአደጋ ጊዜ ተጠሪ ስልክ ግዴታ ነው (Emergency phone is required)')
    .regex(phoneRegex, 'የአደጋ ጊዜ ተጠሪ ስልክ 10 አሃዝ መሆን አለበት (Valid 10-digit emergency phone required)'),
  emergencyEmail: z
    .string()
    .trim()
    .email('ትክክለኛ ኢሜይል ያስገቡ (Invalid email)')
    .optional()
    .or(z.literal('')),
  emergencyAddress: z
    .string()
    .optional()
    .or(z.literal('')),
});

export const distanceRegistrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'የመጀመሪያ ስም ግዴታ ነው (First name is required)'),
  middleName: z
    .string()
    .trim()
    .min(1, 'የመካከለኛ ስም ግዴታ ነው (Middle name is required)'),
  lastName: z
    .string()
    .trim()
    .min(1, 'የአያት ስም ግዴታ ነው (Last name is required)'),
  educationLevel: z
    .string()
    .trim()
    .min(1, 'የትምህርት ደረጃ ይምረጡ (Education level is required)'),
  profession: z
    .string()
    .trim()
    .min(1, 'ሙያ ያስገቡ (Profession is required)'),
  gender: z
    .string()
    .default('Male'),
  dateOfBirth: z
    .string()
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .min(1, 'ስልክ ቁጥር ግዴታ ነው (Phone is required)')
    .regex(phoneRegex, 'ትክክለኛ ስልክ ቁጥር ያስገቡ (Valid 10-digit phone required)'),
  address: z
    .string()
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .trim()
    .email('ትክክለኛ ኢሜይል ያስገቡ (Invalid email format)')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(6, 'የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት (Password must be at least 6 characters)'),
  studentType: z
    .string()
    .default('distance'),
  // Emergency Contact
  emergencyFirstName: z
    .string()
    .trim()
    .min(1, 'የአደጋ ጊዜ ተጠሪ የመጀመሪያ ስም ግዴታ ነው (Emergency contact first name is required)'),
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
    .min(1, 'የአደጋ ጊዜ ተጠሪ ስልክ ግዴታ ነው (Emergency phone is required)')
    .regex(phoneRegex, 'የአደጋ ጊዜ ተጠሪ ስልክ 10 አሃዝ መሆን አለበት (Valid 10-digit emergency phone required)'),
  emergencyEmail: z
    .string()
    .trim()
    .email('ትክክለኛ ኢሜይል ያስገቡ (Invalid email)')
    .optional()
    .or(z.literal('')),
  emergencyAddress: z
    .string()
    .optional()
    .or(z.literal('')),
});

export const studentSelfRegisterSchema = z.object({
  fullName: z.string().trim().min(1, 'ሙሉ ስም ያስገቡ (Full name is required)'),
  gender: z.string().default('Male'),
  dateOfBirth: z.string().optional().or(z.literal('')),
  phone: z.string().trim().min(1, 'ስልክ ቁጥር ያስገቡ (Phone is required)'),
  grade: z.string().default('Grade 7'),
  studentType: z.string().default('regular'),
  address: z.string().optional().or(z.literal('')),
  parentName: z.string().optional().or(z.literal('')),
  parentPhone: z.string().optional().or(z.literal('')),
  parentEmail: z.string().optional().or(z.literal('')),
  email: z.string().trim().email('ትክክለኛ ኢሜይል ያስገቡ (Valid email is required)'),
  password: z.string().min(6, 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት (Password min 6 chars)'),
});
