import { z } from 'zod';

const phoneRegex = /^(?:\+251|0)?[79]\d{8}$|^\d{10}$/;

export const courseModalSchema = z.object({
  name: z.string().trim().min(1, 'የኮርስ ስም ያስገቡ'),
  studentType: z.string().default('regular'),
  grade: z.string().default('Grade 7'),
  bibleTheme: z.string().optional().or(z.literal('')),
  teacher: z.string().optional().or(z.literal('')),
  dayOfWeek: z.string().optional().or(z.literal('')),
  startTime: z.string().optional().or(z.literal('')),
  endTime: z.string().optional().or(z.literal('')),
  shift: z.string().optional().or(z.literal('')),
  numberOfLessons: z.coerce.number().optional(),
  lessonDuration: z.coerce.number().optional(),
});

export const courseFormSchema = z.object({
  title: z.string().trim().min(1, 'የትምህርት ስም ያስገቡ'),
  code: z.string().trim().min(1, 'የኮርስ ኮድ ያስገቡ'),
  gradeLevel: z.string().min(1, 'ደረጃ ይምረጡ'),
  category: z.string().default('General'),
  type: z.string().default('Core'),
  lessons: z.coerce.number().min(1, 'ቢያንስ 1 ትምህርት ያስፈልጋል').default(1),
  creditHours: z.coerce.number().min(0).default(3),
  description: z.string().optional().or(z.literal('')),
  status: z.string().default('active'),
});

export const userEditModalSchema = z.object({
  fullName: z.string().trim().min(1, 'ሙሉ ስም ያስገቡ'),
  role: z.string().min(1, 'ሚና ይምረጡ'),
  departmentId: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  status: z.string().default('approved'),
  gender: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
});

export const userFormSchema = z.object({
  fullName: z.string().trim().min(1, 'ሙሉ ስም ያስገቡ'),
  email: z.string().trim().email('ትክክለኛ ኢሜይል ያስገቡ').optional().or(z.literal('')),
  phone: z.string().trim().min(1, 'ስልክ ቁጥር ያስገቡ').regex(phoneRegex, 'ትክክለኛ ስልክ ቁጥር ያስገቡ'),
  role: z.string().min(1, 'ሚና ይምረጡ'),
  department: z.string().optional().or(z.literal('')),
  status: z.string().default('active'),
  password: z.string().min(6, 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት').optional().or(z.literal('')),
});

export const classFormSchema = z.object({
  name: z.string().trim().min(1, 'የክፍል ስም ያስገቡ'),
  code: z.string().trim().optional().or(z.literal('')),
  grade: z.string().min(1, 'ደረጃ ይምረጡ'),
  room: z.string().optional().or(z.literal('')),
  capacity: z.coerce.number().min(1, 'የተማሪ ብዛት ቢያንስ 1 መሆን አለበት').default(30),
  academicYearId: z.string().optional().or(z.literal('')),
  teacherId: z.string().optional().or(z.literal('')),
});

export const departmentFormSchema = z.object({
  name: z.string().trim().min(1, 'የክፍል ስም ያስገቡ'),
  code: z.string().trim().min(1, 'የክፍል መለያ ኮድ ያስገቡ'),
  description: z.string().optional().or(z.literal('')),
  headId: z.string().optional().or(z.literal('')),
});

export const academicYearFormSchema = z.object({
  yearName: z.string().trim().min(1, 'የትምህርት ዘመን ስም ያስገቡ'),
  startDate: z.string().min(1, 'የመጀመሪያ ቀን ያስገቡ'),
  endDate: z.string().min(1, 'የማብቂያ ቀን ያስገቡ'),
  isCurrent: z.boolean().default(false),
});
