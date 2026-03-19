import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Bell,
  Bookmark,
  ChevronRight,
  Clock,
  Coins,
  Crown,
  Footprints,
  Heart,
  HelpCircle,
  LogOut,
  Pencil,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Video,
} from 'lucide-react'

export const Route = createFileRoute('/_main/my-page')({
  component: MyPagePage,
})

// Placeholder user data - replace with auth store
const MOCK_USER = {
  userName: 'ゲスト',
  userId: 'u_demo_001',
  age: 30,
  avatarId: '',
  point: 1200,
}

type MenuItem = {
  icon: React.ElementType
  label: string
  to: string
  badge?: string
  color?: string
}

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: 'アクティビティ',
    items: [
      {
        icon: Heart,
        label: 'お気に入りリスト',
        to: '/favorite-list',
        color: 'text-pink-500',
      },
      {
        icon: Bookmark,
        label: 'ブックマーク',
        to: '/bookmark-list',
        color: 'text-amber-500',
      },
      {
        icon: Footprints,
        label: '足あと',
        to: '/footprint-list',
        color: 'text-purple-500',
      },
      {
        icon: Clock,
        label: '通話履歴',
        to: '/callhistory-list',
        color: 'text-blue-500',
      },
      {
        icon: Video,
        label: '動画一覧',
        to: '/video-list',
        color: 'text-emerald-500',
      },
    ],
  },
  {
    title: 'ポイント',
    items: [
      {
        icon: Coins,
        label: 'ポイント購入',
        to: '/purchase',
        color: 'text-amber-500',
      },
      {
        icon: ShoppingBag,
        label: 'フリマ',
        to: '/fleamarket',
        color: 'text-teal-500',
      },
      {
        icon: Crown,
        label: 'デイリーボーナス',
        to: '/daily-bonus',
        badge: '受取可',
        color: 'text-orange-500',
      },
    ],
  },
  {
    title: 'その他',
    items: [
      {
        icon: Bell,
        label: 'お知らせ',
        to: '/notification',
        badge: '3',
        color: 'text-red-500',
      },
      {
        icon: Settings,
        label: '設定',
        to: '/setting',
        color: 'text-gray-500',
      },
      {
        icon: HelpCircle,
        label: 'よくある質問',
        to: '/faq',
        color: 'text-sky-500',
      },
      {
        icon: ShieldCheck,
        label: '利用規約',
        to: '/tos',
        color: 'text-gray-400',
      },
    ],
  },
]

function MyPagePage() {
  const user = MOCK_USER

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 px-4 pb-8 pt-12 text-white">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          {/* Avatar */}
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/20 ring-2 ring-white/40">
            <span className="text-3xl font-bold text-white/80">
              {user.userName.charAt(0)}
            </span>
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold">{user.userName}</h1>
              <span className="shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {user.age}歳
              </span>
            </div>
            <p className="mt-0.5 text-xs text-pink-100">
              ID: {user.userId}
            </p>
            <Link
              to="/edit-profile"
              className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/30"
            >
              <Pencil className="h-3 w-3" />
              プロフィール編集
            </Link>
          </div>
        </div>
      </div>

      {/* Point Balance Card */}
      <div className="mx-auto -mt-4 max-w-2xl px-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400">
                ポイント残高
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <Coins className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-extrabold text-gray-900">
                  {user.point.toLocaleString()}
                </span>
                <span className="text-sm text-gray-400">pt</span>
              </div>
            </div>
            <Link
              to="/purchase"
              className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-2 text-sm font-bold text-white shadow-md shadow-amber-400/20 transition hover:shadow-lg"
            >
              チャージ
            </Link>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="mx-auto max-w-2xl px-4 pt-6">
        {menuSections.map((section) => (
          <div key={section.title} className="mb-4">
            <h2 className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-gray-400">
              {section.title}
            </h2>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              {section.items.map((item, i) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3 px-4 py-3.5 transition active:bg-gray-50 ${
                    i < section.items.length - 1
                      ? 'border-b border-gray-50'
                      : ''
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 ${item.color ?? 'text-gray-400'}`}
                  />
                  <span className="flex-1 text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-pink-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout */}
        <button
          onClick={() => {
            // TODO: Replace with actual auth store logout
            localStorage.removeItem('auth_token')
            window.location.href = '/'
          }}
          className="mb-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white py-3.5 text-sm font-medium text-gray-400 transition hover:text-red-500"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </div>
    </div>
  )
}
