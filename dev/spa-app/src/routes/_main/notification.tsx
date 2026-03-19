import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/notification')({
  component: NotificationPage,
})

function NotificationPage() {
  return <div>Notifications (TODO: implement)</div>
}
