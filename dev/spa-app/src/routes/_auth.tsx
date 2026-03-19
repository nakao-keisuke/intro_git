import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-pink-500">ウタゲ</h1>
          <p className="mt-2 text-sm text-gray-500">ライブチャット</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
