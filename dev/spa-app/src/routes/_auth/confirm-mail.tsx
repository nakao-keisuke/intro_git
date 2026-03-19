import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/confirm-mail')({
  component: ConfirmMailPage,
})

function ConfirmMailPage() {
  return <div>Email Confirmation (TODO: implement)</div>
}
