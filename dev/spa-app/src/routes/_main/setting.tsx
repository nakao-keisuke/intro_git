import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/setting')({
  component: SettingPage,
})

function SettingPage() {
  return <div>Settings (TODO: implement)</div>
}
