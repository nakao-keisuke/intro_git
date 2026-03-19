import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/live-broadcaster/$partnerId')({
  component: ProfileLiveBroadcasterPage,
})

function ProfileLiveBroadcasterPage() {
  return <div>Live Broadcaster Profile (TODO: implement)</div>
}
