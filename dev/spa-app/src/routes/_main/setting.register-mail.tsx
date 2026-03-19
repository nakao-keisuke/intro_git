import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/setting/register-mail')({
  component: SettingRegisterMailPage,
})

function SettingRegisterMailPage() {
  return <div>Register Email (TODO: implement)</div>
}
