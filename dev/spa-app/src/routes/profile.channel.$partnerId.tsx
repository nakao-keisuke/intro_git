import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/channel/$partnerId')({
  component: ProfileChannelPage,
})

function ProfileChannelPage() {
  return <div>Live Channel Profile (TODO: implement)</div>
}
