import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Heart, MessageCircle, Shield, Star, Video } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({ component: LandingPage })

function LandingPage() {
  const navigate = useNavigate()
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual auth check from store
    const token = localStorage.getItem('auth_token')
    if (token) {
      navigate({ to: '/girls/all' })
      return
    }
    setIsCheckingAuth(false)
  }, [navigate])

  if (isCheckingAuth) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-300 border-t-pink-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-pink-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden px-4 pb-16 pt-12 text-center">
        <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 top-20 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl" />

        <div className="relative mx-auto max-w-2xl">
          <h1 className="mb-2 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
            Utage
          </h1>
          <p className="mb-4 text-lg font-medium text-pink-600">
            ビデオ通話で、もっと近くに。
          </p>
          <p className="mx-auto mb-8 max-w-md text-base text-gray-500">
            お気に入りの女の子とビデオ通話・チャットを楽しめるライブコミュニケーションアプリ
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/signup"
              className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-pink-500/25 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-500/30 sm:w-auto"
            >
              無料で始める
            </Link>
            <Link
              to="/login"
              className="inline-flex w-full items-center justify-center rounded-full border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-md sm:w-auto"
            >
              ログイン
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Utageの魅力
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Video,
              title: 'ビデオ通話',
              desc: '高画質なビデオ通話で、まるで隣にいるような体験を。',
              color: 'text-pink-500',
              bg: 'bg-pink-50',
            },
            {
              icon: MessageCircle,
              title: 'リアルタイムチャット',
              desc: 'メッセージのやり取りで、いつでも繋がれる。',
              color: 'text-purple-500',
              bg: 'bg-purple-50',
            },
            {
              icon: Heart,
              title: 'お気に入り機能',
              desc: '気になる女の子をお気に入りに登録して、すぐにアクセス。',
              color: 'text-rose-500',
              bg: 'bg-rose-50',
            },
            {
              icon: Star,
              title: 'ランキング',
              desc: '人気の女の子をランキングでチェック。',
              color: 'text-amber-500',
              bg: 'bg-amber-50',
            },
            {
              icon: Shield,
              title: '安心・安全',
              desc: '24時間監視体制で、安心してご利用いただけます。',
              color: 'text-emerald-500',
              bg: 'bg-emerald-50',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div
                className={`mb-3 inline-flex rounded-xl ${feature.bg} p-3`}
              >
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="mb-1.5 text-lg font-bold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 text-center">
        <div className="mx-auto max-w-md rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 p-8 text-white shadow-xl">
          <h2 className="mb-3 text-2xl font-bold">今すぐ無料登録</h2>
          <p className="mb-6 text-sm text-pink-100">
            新規登録で1,200ポイントプレゼント！
          </p>
          <Link
            to="/signup"
            className="inline-flex rounded-full bg-white px-8 py-3 text-base font-bold text-pink-600 shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            無料で始める
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-4 py-8 text-center text-xs text-gray-400">
        <p>&copy; 2024 Utage. All rights reserved.</p>
      </footer>
    </div>
  )
}
