import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(1, 'パスワードは1文字以上で入力してください。')
  .max(20, 'パスワードは20文字以内で入力してください。');
