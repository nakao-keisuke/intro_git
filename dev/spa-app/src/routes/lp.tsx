import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lp')({
  component: LpPage,
})

function LpPage() {
  return <div>Landing Page (TODO: implement)</div>
}
