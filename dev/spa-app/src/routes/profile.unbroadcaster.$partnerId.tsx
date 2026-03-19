import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/unbroadcaster/$partnerId')({
  component: ProfileUnbroadcasterPage,
})

function ProfileUnbroadcasterPage() {
  return <div>Non-broadcaster Profile (TODO: implement)</div>
}
