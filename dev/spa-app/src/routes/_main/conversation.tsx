import { createFileRoute, Link } from '@tanstack/react-router'
import { Circle, Phone, Video } from 'lucide-react'

export const Route = createFileRoute('/_main/conversation')({
  component: ConversationPage,
})

type ConversationItem = {
  partnerId: string
  partnerName: string
  avatarId: string
  lastMessage: string
  sentTime: string
  unreadNum: number
  isOnline: boolean
  voiceCallWaiting: boolean
  videoCallWaiting: boolean
  isNewUser: boolean
}

// Placeholder data - replace with API call
const MOCK_CONVERSATIONS: ConversationItem[] = [
  {
    partnerId: '1',
    partnerName: 'みさき',
    avatarId: '',
    lastMessage: 'こんにちは！今日は暇ですか？',
    sentTime: '14:32',
    unreadNum: 3,
    isOnline: true,
    voiceCallWaiting: true,
    videoCallWaiting: false,
    isNewUser: false,
  },
  {
    partnerId: '2',
    partnerName: 'あやか',
    avatarId: '',
    lastMessage: 'ありがとう！また話しましょうね',
    sentTime: '12:15',
    unreadNum: 0,
    isOnline: true,
    voiceCallWaiting: false,
    videoCallWaiting: true,
    isNewUser: false,
  },
  {
    partnerId: '4',
    partnerName: 'さくら',
    avatarId: '',
    lastMessage: '写真送ったよ！見てね',
    sentTime: '昨日',
    unreadNum: 1,
    isOnline: false,
    voiceCallWaiting: false,
    videoCallWaiting: false,
    isNewUser: true,
  },
  {
    partnerId: '5',
    partnerName: 'れな',
    avatarId: '',
    lastMessage: 'お疲れ様です～',
    sentTime: '昨日',
    unreadNum: 0,
    isOnline: true,
    voiceCallWaiting: false,
    videoCallWaiting: false,
    isNewUser: false,
  },
  {
    partnerId: '7',
    partnerName: 'まい',
    avatarId: '',
    lastMessage: '週末空いてる？通話しよう！',
    sentTime: '月曜',
    unreadNum: 0,
    isOnline: false,
    voiceCallWaiting: false,
    videoCallWaiting: false,
    isNewUser: false,
  },
  {
    partnerId: '8',
    partnerName: 'あおい',
    avatarId: '',
    lastMessage: 'スタンプを送信しました',
    sentTime: '3/15',
    unreadNum: 0,
    isOnline: false,
    voiceCallWaiting: false,
    videoCallWaiting: false,
    isNewUser: false,
  },
]

function ConversationRow({ item }: { item: ConversationItem }) {
  const bgColors = [
    'from-pink-300 to-rose-400',
    'from-purple-300 to-indigo-400',
    'from-sky-300 to-blue-400',
    'from-amber-300 to-orange-400',
    'from-emerald-300 to-teal-400',
    'from-fuchsia-300 to-pink-400',
  ]
  const colorIndex = parseInt(item.partnerId, 10) % bgColors.length
  const bgGradient = bgColors[colorIndex]

  return (
    <Link
      to="/message/$userId"
      params={{ userId: item.partnerId }}
      className="flex items-center gap-3 px-4 py-3 transition active:bg-gray-50"
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${bgGradient}`}
        >
          <span className="text-lg font-bold text-white/80">
            {item.partnerName.charAt(0)}
          </span>
        </div>
        {/* Online dot */}
        {item.isOnline && (
          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-400" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`truncate text-sm font-bold ${
                item.unreadNum > 0 ? 'text-gray-900' : 'text-gray-700'
              }`}
            >
              {item.partnerName}
            </span>
            {item.isNewUser && (
              <span className="rounded bg-pink-100 px-1.5 py-0.5 text-[10px] font-bold text-pink-500">
                NEW
              </span>
            )}
            {/* Call status */}
            {item.voiceCallWaiting && (
              <Phone className="h-3.5 w-3.5 text-green-500" />
            )}
            {item.videoCallWaiting && (
              <Video className="h-3.5 w-3.5 text-blue-500" />
            )}
          </div>
          <span className="shrink-0 text-xs text-gray-400">
            {item.sentTime}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between">
          <p
            className={`truncate text-xs ${
              item.unreadNum > 0
                ? 'font-medium text-gray-700'
                : 'text-gray-400'
            }`}
          >
            {item.lastMessage}
          </p>
          {item.unreadNum > 0 && (
            <span className="ml-2 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-pink-500 px-1.5 text-[10px] font-bold text-white">
              {item.unreadNum}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function ConversationPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-gray-900">メッセージ</h1>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Circle className="h-2 w-2 fill-green-400 text-green-400" />
            <span>
              {MOCK_CONVERSATIONS.filter((c) => c.isOnline).length}人オンライン
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="mx-auto flex max-w-2xl gap-1 overflow-x-auto px-4 pb-2">
          {['すべて', 'メッセージ', 'ブックマーク'].map((tab, i) => (
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
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className="mx-auto max-w-2xl divide-y divide-gray-50">
        {MOCK_CONVERSATIONS.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <Circle className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              メッセージはまだありません
            </p>
            <p className="mt-1 text-xs text-gray-400">
              気になる女の子にメッセージを送ってみましょう
            </p>
            <Link
              to="/girls/all"
              className="mt-4 rounded-full bg-pink-500 px-6 py-2 text-sm font-bold text-white"
            >
              女の子を探す
            </Link>
          </div>
        ) : (
          MOCK_CONVERSATIONS.map((item) => (
            <ConversationRow key={item.partnerId} item={item} />
          ))
        )}
      </div>
    </div>
  )
}
