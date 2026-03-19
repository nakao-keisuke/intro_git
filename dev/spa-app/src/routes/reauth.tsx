import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reauth')({
  component: ReauthPage,
})

function ReauthPage() {
  return <div>Re-authentication (TODO: implement)</div>
}
