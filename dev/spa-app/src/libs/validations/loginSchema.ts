import { z } from 'zod';

export const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, 'メールアドレスまたは電話番号を入力してください')
    .regex(
      /^(?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*|0[0-9]{9,10})$/,
      'メールアドレスまたは10-11桁の電話番号（ハイフンなし）を入力してください',
    ),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export const createLoginSchema = (messages: {
  emailOrPhoneRequired: string;
  emailOrPhoneInvalid: string;
  passwordRequired: string;
}) =>
  z.object({
    emailOrPhone: z
      .string()
      .min(1, messages.emailOrPhoneRequired)
      .regex(
        /^(?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*|0[0-9]{9,10})$/,
        messages.emailOrPhoneInvalid,
      ),
    password: z.string().min(1, messages.passwordRequired),
  });

export type LoginFormData = z.infer<typeof loginSchema>;
