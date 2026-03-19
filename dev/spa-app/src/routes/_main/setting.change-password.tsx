import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/setting/change-password')({
  component: SettingChangePasswordPage,
})

function SettingChangePasswordPage() {
  return <div>Change Password (TODO: implement)</div>
}
