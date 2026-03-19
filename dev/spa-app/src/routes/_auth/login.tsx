import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'メールアドレスを入力してください')
    .email('正しいメールアドレスを入力してください'),
  password: z
    .string()
    .min(1, 'パスワードを入力してください'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const Route = createFileRoute('/_auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null)
    try {
      // TODO: Replace with actual auth store login action
      console.log('Login attempt:', data.email)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // On success, store token and navigate
      localStorage.setItem('auth_token', 'dummy_token')
      navigate({ to: '/girls/all' })
    } catch {
      setLoginError('メールアドレスまたはパスワードが正しくありません')
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
          <p className="mt-2 text-sm text-gray-500">
            アカウントにログイン
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          {loginError && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {loginError}
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
          <div className="mb-6">
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
                autoComplete="current-password"
                placeholder="パスワード"
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 py-3 text-sm font-bold text-white shadow-md shadow-pink-500/20 transition hover:shadow-lg hover:shadow-pink-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ログイン中...
              </span>
            ) : (
              'ログイン'
            )}
          </button>

          {/* Forgot Password */}
          <div className="mt-4 text-center">
            <Link
              to="/forgot-password"
              className="text-xs text-pink-500 hover:text-pink-600"
            >
              パスワードをお忘れの方
            </Link>
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center text-sm text-gray-500">
          アカウントをお持ちでない方{' '}
          <Link
            to="/signup"
            className="font-semibold text-pink-500 hover:text-pink-600"
          >
            新規登録
          </Link>
        </div>
      </div>
    </div>
  )
}
