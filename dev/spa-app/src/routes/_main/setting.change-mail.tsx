import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/setting/change-mail')({
  component: SettingChangeMailPage,
})

function SettingChangeMailPage() {
  return <div>Change Email (TODO: implement)</div>
}
