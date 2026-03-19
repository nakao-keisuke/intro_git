import { z } from 'zod';

// サインアップフォームのバリデーションスキーマ
export const signupSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, '電話番号を入力してください。')
    .min(10, '電話番号は10桁以上で入力してください。')
    .max(11, '電話番号は11桁以内で入力してください。')
    .regex(/^[0-9]+$/, '電話番号は数字のみで入力してください。'),
  password: z.string().min(4, 'パスワードは4文字以上で入力してください。'),
  verificationCode: z
    .string()
    .min(1, '認証コードを入力してください。')
    .regex(/^\d{6}$/, '認証コードは6桁の数字で入力してください。'),
  name: z
    .string()
    .min(1, '名前は1文字以上で入力してください。')
    .max(20, '名前は20文字以内で入力してください。'),
  region: z.string(),
  age: z
    .number()
    .min(18, '年齢は18歳以上で入力してください。')
    .max(90, '年齢は90歳以下で入力してください。'),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: '利用規約に同意する必要があります。',
  }),
});

// ローカライズ対応のスキーマファクトリ関数
export const createSignupSchema = (messages: {
  phoneRequired: string;
  phoneMin: string;
  phoneMax: string;
  phoneDigitsOnly: string;
  passwordMin: string;
  verificationCodeRequired: string;
  verificationCodeInvalid: string;
  nameMin: string;
  nameMax: string;
  ageMinValue: string;
  ageMaxValue: string;
  agreeTerms: string;
}) =>
  z.object({
    phoneNumber: z
      .string()
      .min(1, messages.phoneRequired)
      .min(10, messages.phoneMin)
      .max(11, messages.phoneMax)
      .regex(/^[0-9]+$/, messages.phoneDigitsOnly),
    password: z.string().min(4, messages.passwordMin),
    verificationCode: z
      .string()
      .min(1, messages.verificationCodeRequired)
      .regex(/^\d{6}$/, messages.verificationCodeInvalid),
    name: z.string().min(1, messages.nameMin).max(20, messages.nameMax),
    region: z.string(),
    age: z.number().min(18, messages.ageMinValue).max(90, messages.ageMaxValue),
    agreeTerms: z.boolean().refine((val) => val === true, {
      message: messages.agreeTerms,
    }),
  });

// スキーマから型を推論
export type SignupFormData = z.infer<typeof signupSchema>;
