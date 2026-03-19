import { createFileRoute, Link, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_content')({
  component: ContentLayout,
})

function ContentLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-4">
          <Link to="/" className="text-xl font-bold text-pink-500 no-underline">
            ウタゲ
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <Link to="/tos" className="hover:text-gray-700 no-underline text-gray-500">利用規約</Link>
            <Link to="/privacy" className="hover:text-gray-700 no-underline text-gray-500">プライバシーポリシー</Link>
            <Link to="/commerce" className="hover:text-gray-700 no-underline text-gray-500">特定商取引法</Link>
            <Link to="/faq" className="hover:text-gray-700 no-underline text-gray-500">FAQ</Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">© 2024 ウタゲ All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
