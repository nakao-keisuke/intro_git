import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/profile/detail/$partnerId')({
  component: ProfileDetailPage,
})

function ProfileDetailPage() {
  return <div>User Profile Detail (TODO: implement)</div>
}
