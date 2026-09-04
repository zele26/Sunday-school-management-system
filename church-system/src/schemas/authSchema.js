import { z } from 'zod';

export const loginSchema = z.object({
  credential: z
    .string()
    .min(1, 'እባክዎ ኢሜይል፣ ስልክ ቁጥር ወይም የተማሪ መለያ ያስገቡ (Email, phone, or student ID is required)'),
  password: z
    .string()
    .min(1, 'እባክዎ የይለፍ ቃል ያስገቡ (Password is required)'),
});

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, 'እባክዎ ኢሜይል፣ ስልክ ቁጥር ወይም የተማሪ መለያ ያስገቡ (Please enter email, phone, or Student ID)'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'የአሁኑን የይለፍ ቃል ያስገቡ (Current password is required)'),
    newPassword: z
      .string()
      .min(6, 'አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት (Password must be at least 6 characters)'),
    confirmPassword: z
      .string()
      .min(1, 'የይለፍ ቃል ማረጋገጫ ያስገቡ (Confirm password is required)'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'አዲሱ የይለፍ ቃል እና ማረጋገጫው አይዛመዱም (Passwords do not match)',
    path: ['confirmPassword'],
  });
