import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/video-call-broadcaster/$partnerId')({
  component: ProfileVideoCallBroadcasterPage,
})

function ProfileVideoCallBroadcasterPage() {
  return <div>Video Call Broadcaster Profile (TODO: implement)</div>
}
