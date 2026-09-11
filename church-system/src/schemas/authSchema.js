import { z } from 'zod';

export const loginSchema = z.object({
  credential: z
    .string()
    .min(1, 'እባክዎ ኢሜይል፣ ስልክ ቁጥር ወይም የተማሪ መለያ ያስገቡ'),
  password: z
    .string()
    .min(1, 'እባክዎ የይለፍ ቃል ያስገቡ'),
});

export const forgotPasswordSchema = z.object({
  identifier: z
    .string()
    .min(1, 'እባክዎ ኢሜይል፣ ስልክ ቁጥር ወይም የተማሪ መለያ ያስገቡ'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'የአሁኑን የይለፍ ቃል ያስገቡ'),
    newPassword: z
      .string()
      .min(6, 'አዲሱ የይለፍ ቃል ቢያንስ 6 ፊደላት/ቁጥሮች መሆን አለበት'),
    confirmPassword: z
      .string()
      .min(1, 'የይለፍ ቃል ማረጋገጫ ያስገቡ'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'አዲሱ የይለፍ ቃል እና ማረጋገጫው አይዛመዱም',
    path: ['confirmPassword'],
  });
