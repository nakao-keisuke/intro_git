import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { CheckSquare, Eye, EyeOff, Lock, Mail, Square, User } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください')
    .min(8, 'パスワードは8文字以上で入力してください'),
  nickname: z
    .string()
    .min(1, 'ニックネームを入力してください')
    .min(2, 'ニックネームは2文字以上で入力してください')
    .max(20, 'ニックネームは20文字以内で入力してください'),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: '利用規約に同意してください' }),
  }),
})

type SignupFormData = z.infer<typeof signupSchema>

export const Route = createFileRoute('/_auth/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      nickname: '',
      agreeTerms: false as unknown as true,
    },
  })

  const onSubmit = async (data: SignupFormData) => {
    setSignupError(null)
    try {
      // TODO: Replace with actual signup API call
      console.log('Signup attempt:', data.email, data.nickname)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      localStorage.setItem('auth_token', 'dummy_token')
      navigate({ to: '/girls/all' })
    } catch {
      setSignupError('登録に失敗しました。しばらく経ってからお試しください。')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Utage
          </h1>
          <p className="mt-2 text-sm text-gray-500">新規アカウント登録</p>
          {/* Bonus Banner */}
          <div className="mt-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2.5 text-sm font-bold text-white shadow-md">
            今なら登録で 1,200pt プレゼント!
          </div>
        </div>

        {/* Signup Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          {signupError && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {signupError}
            </div>
          )}

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              メールアドレス
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              パスワード
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="8文字以上"
                className={`w-full rounded-xl border py-3 pl-10 pr-10 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Nickname */}
          <div className="mb-4">
            <label
              htmlFor="nickname"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              ニックネーム
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="nickname"
                type="text"
                autoComplete="username"
                placeholder="表示名を入力"
                className={`w-full rounded-xl border py-3 pl-10 pr-4 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100 ${
                  errors.nickname ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}
                {...register('nickname')}
              />
            </div>
            {errors.nickname && (
              <p className="mt-1 text-xs text-red-500">
                {errors.nickname.message}
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="mb-6">
            <Controller
              name="agreeTerms"
              control={control}
              render={({ field }) => (
                <button
                  type="button"
                  onClick={() => field.onChange(!field.value)}
                  className="flex items-start gap-2.5 text-left"
                >
                  {field.value ? (
                    <CheckSquare className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" />
                  ) : (
                    <Square className="mt-0.5 h-5 w-5 shrink-0 text-gray-300" />
                  )}
                  <span className="text-xs leading-relaxed text-gray-600">
                    <Link
                      to="/tos"
                      className="text-pink-500 underline hover:text-pink-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      利用規約
                    </Link>
                    および
                    <Link
                      to="/privacy"
                      className="text-pink-500 underline hover:text-pink-600"
                      onClick={(e) => e.stopPropagation()}
                    >
                      プライバシーポリシー
                    </Link>
                    に同意します
                  </span>
                </button>
              )}
            />
            {errors.agreeTerms && (
              <p className="mt-1 text-xs text-red-500">
                {errors.agreeTerms.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-3 text-sm font-bold text-white shadow-md shadow-pink-500/20 transition hover:shadow-lg hover:shadow-pink-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                登録中...
              </span>
            ) : (
              '無料で登録する'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm text-gray-500">
          すでにアカウントをお持ちの方{' '}
          <Link
            to="/login"
            className="font-semibold text-pink-500 hover:text-pink-600"
          >
            ログイン
          </Link>
        </div>
      </div>
    </div>
  )
}
