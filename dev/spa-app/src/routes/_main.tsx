import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router'
import {
  Users,
  MessageCircle,
  Image,
  LayoutList,
  User,
  Home,
  Footprints,
  Bell,
  Search,
  Coins,
} from 'lucide-react'

export const Route = createFileRoute('/_main')({
  component: MainLayout,
})

// --- Bottom Navigation (Mobile) ---

type BottomNavItem = {
  href: string
  icon: React.ReactNode
  activeIcon: React.ReactNode
  label: string
}

const bottomNavItems: BottomNavItem[] = [
  {
    href: '/girls/all',
    icon: <Users size={22} />,
    activeIcon: <Users size={22} strokeWidth={2.5} />,
    label: 'ホーム',
  },
  {
    href: '/conversation',
    icon: <MessageCircle size={22} />,
    activeIcon: <MessageCircle size={22} strokeWidth={2.5} />,
    label: 'トーク',
  },
  {
    href: '/gallery',
    icon: <Image size={22} />,
    activeIcon: <Image size={22} strokeWidth={2.5} />,
    label: 'ギャラリー',
  },
  {
    href: '/board',
    icon: <LayoutList size={22} />,
    activeIcon: <LayoutList size={22} strokeWidth={2.5} />,
    label: '掲示板',
  },
  {
    href: '/my-page',
    icon: <User size={22} />,
    activeIcon: <User size={22} strokeWidth={2.5} />,
    label: 'マイページ',
  },
]

function BottomNav() {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (href: string) => {
    if (href === '/girls/all') {
      return currentPath === '/girls/all' || currentPath === '/'
    }
    return currentPath.startsWith(href)
  }

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-[9999] border-gray-200 border-t bg-white md:hidden">
      <div className="flex h-14 items-center justify-around">
        {bottomNavItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 pt-1 pb-1 text-[10px] no-underline transition-colors ${
                active
                  ? 'font-bold text-pink-500'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {active ? item.activeIcon : item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// --- PC Sidebar ---

type SidebarNavItem = {
  href: string
  icon: React.ReactNode
  label: string
}

const sidebarNavItems: SidebarNavItem[] = [
  { href: '/girls/all', icon: <Home size={18} />, label: 'ホーム' },
  { href: '/conversation', icon: <MessageCircle size={18} />, label: 'トーク' },
  { href: '/gallery', icon: <Image size={18} />, label: 'ギャラリー' },
  { href: '/board', icon: <LayoutList size={18} />, label: '掲示板' },
  { href: '/footprint-list', icon: <Footprints size={18} />, label: '足あと' },
  { href: '/notification', icon: <Bell size={18} />, label: 'お知らせ' },
  { href: '/search', icon: <Search size={18} />, label: '検索' },
  { href: '/my-page', icon: <User size={18} />, label: 'マイページ' },
]

function PCSidebar() {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (href: string) => {
    if (href === '/girls/all') {
      return currentPath === '/girls/all' || currentPath === '/'
    }
    return currentPath.startsWith(href)
  }

  return (
    <aside className="fixed top-[50px] left-0 z-[100] hidden h-[calc(100vh-50px)] w-60 overflow-y-auto border-gray-200 border-r bg-gray-50 md:block">
      <div className="p-4">
        {/* User Info */}
        <div className="mb-4 rounded-lg bg-white p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
              <User size={20} className="text-pink-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-gray-700 text-sm">ゲスト</p>
              <p className="text-gray-400 text-xs">ログインしてください</p>
            </div>
          </div>
        </div>

        {/* Point Display */}
        <div className="mb-4 rounded-lg bg-white p-3 shadow-sm">
          <p className="mb-1 font-bold text-gray-500 text-xs">保有ポイント</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Coins size={18} className="text-yellow-500" />
              <span className="font-bold text-gray-700 text-lg">0</span>
              <span className="text-gray-500 text-xs">pt</span>
            </div>
            <Link
              to="/purchase"
              className="rounded-md bg-pink-500 px-3 py-1 font-bold text-white text-xs no-underline transition-opacity hover:opacity-80"
            >
              チャージ
            </Link>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-0.5">
          {sidebarNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm no-underline transition-colors ${
                  active
                    ? 'bg-pink-50 font-bold text-pink-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className={active ? 'text-pink-500' : 'text-gray-400'}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

// --- Header ---

function MainHeader() {
  return (
    <header className="fixed top-0 right-0 left-0 z-[99999] h-[50px] border-gray-200 border-b bg-white">
      <div className="flex h-full items-center px-4">
        {/* Logo */}
        <Link to="/girls/all" className="font-bold text-lg text-pink-500 no-underline">
          Utage
        </Link>

        {/* Right side nav items (visible on mobile) */}
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/footprint-list"
            className="flex items-center justify-center rounded-full p-2 text-gray-500 no-underline transition-colors hover:bg-gray-100 md:hidden"
          >
            <Footprints size={20} />
          </Link>
          <Link
            to="/notification"
            className="flex items-center justify-center rounded-full p-2 text-gray-500 no-underline transition-colors hover:bg-gray-100 md:hidden"
          >
            <Bell size={20} />
          </Link>
          <Link
            to="/search"
            className="flex items-center justify-center rounded-full p-2 text-gray-500 no-underline transition-colors hover:bg-gray-100 md:hidden"
          >
            <Search size={20} />
          </Link>
          <Link
            to="/purchase"
            className="hidden items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 font-bold text-white text-xs no-underline shadow-sm transition-opacity hover:opacity-80 md:flex"
          >
            <Coins size={14} />
            <span>0 pt</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

// --- Main Layout ---

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <MainHeader />

      {/* PC Sidebar */}
      <PCSidebar />

      {/* Main Content Area */}
      <main className="pt-[50px] pb-16 md:pb-0 md:pl-60">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
