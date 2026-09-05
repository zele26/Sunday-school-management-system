import { z } from 'zod';

const phoneRegex = /^(?:\+251|0)?[79]\d{8}$|^\d{10}$/;

export const courseModalSchema = z.object({
  name: z.string().trim().min(1, 'የኮርስ ስም ያስገቡ (Course name is required)'),
  studentType: z.string().default('regular'),
  grade: z.string().default('Grade 7'),
  bibleTheme: z.string().optional().or(z.literal('')),
  teacher: z.string().optional().or(z.literal('')),
  dayOfWeek: z.string().default('እሑድ'),
  startTime: z.string().default('08:30'),
  endTime: z.string().default('10:00'),
  shift: z.string().default('የቀን'),
  numberOfLessons: z.coerce.number().min(1, 'ቢያንስ 1 ትምህርት').default(12),
  lessonDuration: z.coerce.number().min(1).default(60),
});

export const courseFormSchema = z.object({
  title: z.string().trim().min(1, 'የትምህርት ስም ያስገቡ (Course title is required)'),
  code: z.string().trim().min(1, 'የኮርስ ኮድ ያስገቡ (Course code is required)'),
  gradeLevel: z.string().min(1, 'ደረጃ ይምረጡ (Grade level is required)'),
  category: z.string().default('General'),
  type: z.string().default('Core'),
  lessons: z.coerce.number().min(1, 'ቢያንስ 1 ትምህርት (At least 1 lesson required)').default(1),
  creditHours: z.coerce.number().min(0).default(3),
  description: z.string().optional().or(z.literal('')),
  status: z.string().default('active'),
});

export const userEditModalSchema = z.object({
  fullName: z.string().trim().min(1, 'ሙሉ ስም ያስገቡ (Full name is required)'),
  role: z.string().min(1, 'ሚና ይምረጡ (Role is required)'),
  departmentId: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  status: z.string().default('approved'),
  gender: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
});

export const userFormSchema = z.object({
  fullName: z.string().trim().min(1, 'ሙሉ ስም ያስገቡ (Full name is required)'),
  email: z.string().trim().email('ትክክለኛ ኢሜይል ያስገቡ (Valid email required)').optional().or(z.literal('')),
  phone: z.string().trim().min(1, 'ስልክ ቁጥር ያስገቡ (Phone is required)').regex(phoneRegex, 'ትክክለኛ ስልክ ቁጥር ያስገቡ'),
  role: z.string().min(1, 'ሚና ይምረጡ (Role is required)'),
  department: z.string().optional().or(z.literal('')),
  status: z.string().default('active'),
  password: z.string().min(6, 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች (At least 6 characters)').optional().or(z.literal('')),
});

export const classFormSchema = z.object({
  name: z.string().trim().min(1, 'የክፍል ስም ያስገቡ (Class name is required)'),
  code: z.string().trim().optional().or(z.literal('')),
  grade: z.string().min(1, 'ደረጃ ይምረጡ (Grade is required)'),
  room: z.string().optional().or(z.literal('')),
  capacity: z.coerce.number().min(1, 'የተማሪ ብዛት ቢያንስ 1 (Capacity must be at least 1)').default(30),
  academicYearId: z.string().optional().or(z.literal('')),
  teacherId: z.string().optional().or(z.literal('')),
});

export const departmentFormSchema = z.object({
  name: z.string().trim().min(1, 'የክፍል ስም ያስገቡ (Department name is required)'),
  code: z.string().trim().min(1, 'የክፍል መለያ ኮድ ያስገቡ (Department code is required)'),
  description: z.string().optional().or(z.literal('')),
  headId: z.string().optional().or(z.literal('')),
});

export const academicYearFormSchema = z.object({
  yearName: z.string().trim().min(1, 'የትምህርት ዘመን ስም ያስገቡ (Academic year name is required)'),
  startDate: z.string().min(1, 'የመጀመሪያ ቀን ያስገቡ (Start date is required)'),
  endDate: z.string().min(1, 'የማብቂያ ቀን ያስገቡ (End date is required)'),
  isCurrent: z.boolean().default(false),
});
