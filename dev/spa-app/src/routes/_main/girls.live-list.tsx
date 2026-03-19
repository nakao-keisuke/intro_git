import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/girls/live-list')({
  component: GirlsLiveListPage,
})

function GirlsLiveListPage() {
  return <div>Live Broadcasters (TODO: implement)</div>
}
