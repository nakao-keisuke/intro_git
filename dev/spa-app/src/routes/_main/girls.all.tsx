import { createFileRoute, Link } from '@tanstack/react-router'
import { Circle, Phone, Video } from 'lucide-react'

export const Route = createFileRoute('/_main/girls/all')({
  component: GirlsAllPage,
})

type UserCardData = {
  userId: string
  userName: string
  age: number
  region: string
  avatarId: string
  isOnline: boolean
  isNewUser: boolean
  voiceCallWaiting: boolean
  videoCallWaiting: boolean
}

// Placeholder data - replace with API call
const MOCK_USERS: UserCardData[] = [
  {
    userId: '1',
    userName: 'みさき',
    age: 24,
    region: '東京',
    avatarId: '',
    isOnline: true,
    isNewUser: true,
    voiceCallWaiting: true,
    videoCallWaiting: false,
  },
  {
    userId: '2',
    userName: 'あやか',
    age: 22,
    region: '大阪',
    avatarId: '',
    isOnline: true,
    isNewUser: false,
    voiceCallWaiting: false,
    videoCallWaiting: true,
  },
  {
    userId: '3',
    userName: 'ゆい',
    age: 26,
    region: '福岡',
    avatarId: '',
    isOnline: false,
    isNewUser: false,
    voiceCallWaiting: false,
    videoCallWaiting: false,
  },
  {
    userId: '4',
    userName: 'さくら',
    age: 21,
    region: '名古屋',
    avatarId: '',
    isOnline: true,
    isNewUser: true,
    voiceCallWaiting: true,
    videoCallWaiting: true,
  },
  {
    userId: '5',
    userName: 'れな',
    age: 28,
    region: '札幌',
    avatarId: '',
    isOnline: true,
    isNewUser: false,
    voiceCallWaiting: false,
    videoCallWaiting: true,
  },
  {
    userId: '6',
    userName: 'なつみ',
    age: 23,
    region: '横浜',
    avatarId: '',
    isOnline: false,
    isNewUser: false,
    voiceCallWaiting: false,
    videoCallWaiting: false,
  },
  {
    userId: '7',
    userName: 'まい',
    age: 25,
    region: '京都',
    avatarId: '',
    isOnline: true,
    isNewUser: false,
    voiceCallWaiting: true,
    videoCallWaiting: false,
  },
  {
    userId: '8',
    userName: 'あおい',
    age: 20,
    region: '神戸',
    avatarId: '',
    isOnline: true,
    isNewUser: true,
    voiceCallWaiting: false,
    videoCallWaiting: true,
  },
  {
    userId: '9',
    userName: 'ひなた',
    age: 27,
    region: '仙台',
    avatarId: '',
    isOnline: false,
    isNewUser: false,
    voiceCallWaiting: false,
    videoCallWaiting: false,
  },
  {
    userId: '10',
    userName: 'かのん',
    age: 22,
    region: '広島',
    avatarId: '',
    isOnline: true,
    isNewUser: false,
    voiceCallWaiting: true,
    videoCallWaiting: true,
  },
  {
    userId: '11',
    userName: 'えみ',
    age: 24,
    region: '千葉',
    avatarId: '',
    isOnline: true,
    isNewUser: false,
    voiceCallWaiting: false,
    videoCallWaiting: false,
  },
  {
    userId: '12',
    userName: 'りこ',
    age: 21,
    region: '埼玉',
    avatarId: '',
    isOnline: false,
    isNewUser: true,
    voiceCallWaiting: false,
    videoCallWaiting: false,
  },
]

function UserCard({ user }: { user: UserCardData }) {
  const bgColors = [
    'from-pink-200 to-rose-300',
    'from-purple-200 to-indigo-300',
    'from-sky-200 to-blue-300',
    'from-amber-200 to-orange-300',
    'from-emerald-200 to-teal-300',
    'from-fuchsia-200 to-pink-300',
  ]
  const colorIndex = parseInt(user.userId, 10) % bgColors.length
  const bgGradient = bgColors[colorIndex]

  return (
    <Link
      to="/profile/detail/$partnerId"
      params={{ partnerId: user.userId }}
      className="group relative block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md"
    >
      {/* Thumbnail */}
      <div
        className={`relative aspect-[3/4] bg-gradient-to-br ${bgGradient}`}
      >
        {/* Placeholder avatar */}
        <div className="flex h-full items-center justify-center">
          <span className="text-4xl font-bold text-white/60">
            {user.userName.charAt(0)}
          </span>
        </div>

        {/* Online indicator */}
        {user.isOnline && (
          <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
            <Circle className="h-2 w-2 fill-green-400 text-green-400" />
            <span className="text-[10px] font-medium text-white">
              オンライン
            </span>
          </div>
        )}

        {/* NEW badge */}
        {user.isNewUser && (
          <div className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            NEW
          </div>
        )}

        {/* Call status icons */}
        <div className="absolute bottom-2 right-2 flex gap-1.5">
          {user.voiceCallWaiting && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 shadow-md">
              <Phone className="h-3.5 w-3.5 text-white" />
            </div>
          )}
          {user.videoCallWaiting && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 shadow-md">
              <Video className="h-3.5 w-3.5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="px-2.5 py-2">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm font-bold text-gray-900">
            {user.userName}
          </span>
          <span className="shrink-0 text-xs text-gray-400">
            {user.age}歳
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-400">{user.region}</p>
      </div>
    </Link>
  )
}

function GirlsAllPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">さがす</h1>
          <Link
            to="/search"
            className="rounded-full bg-gray-100 px-3.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-200"
          >
            絞り込み
          </Link>
        </div>

        {/* Category tabs */}
        <div className="mx-auto flex max-w-2xl gap-1 overflow-x-auto px-4 pb-2">
          {['すべて', 'オンライン', '新人', '音声待機中', 'ビデオ待機中'].map(
            (tab, i) => (
              <button
                key={tab}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition ${
                  i === 0
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-2xl px-3 pt-3">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {MOCK_USERS.map((user) => (
            <UserCard key={user.userId} user={user} />
          ))}
        </div>
      </div>
    </div>
  )
}
