import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/setting/notificationSetting')({
  component: NotificationSettingPage,
})

function NotificationSettingPage() {
  return <div>Notification Settings (TODO: implement)</div>
}
