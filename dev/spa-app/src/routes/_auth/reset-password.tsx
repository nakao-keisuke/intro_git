import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/reset-password')({
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  return <div>Reset Password (TODO: implement)</div>
}
