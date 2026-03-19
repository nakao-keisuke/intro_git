import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/ranking')({
  component: RankingPage,
})

function RankingPage() {
  return <div>Rankings (TODO: implement)</div>
}
